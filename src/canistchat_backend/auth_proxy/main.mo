import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

actor AuthProxy {
    // Types
    public type UserId = Principal;
    public type SessionId = Text;
    
    public type UserSession = {
        userId: UserId;
        sessionId: SessionId;
        created: Time.Time;
        lastActive: Time.Time;
        expiresAt: Time.Time;
    };
    
    public type Error = {
        #Unauthorized;
        #SessionExpired;
        #InvalidSession;
        #InternalError: Text;
    };
    
    // Storage
    private stable var sessionEntries: [(SessionId, UserSession)] = [];
    private var sessions = HashMap.HashMap<SessionId, UserSession>(50, Text.equal, Text.hash);
    
    // Constants
    private let SESSION_DURATION: Int = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
    
    // System upgrade hooks
    system func preupgrade() {
        sessionEntries := Iter.toArray(sessions.entries());
    };
    
    system func postupgrade() {
        sessions := HashMap.fromIter<SessionId, UserSession>(sessionEntries.vals(), sessionEntries.size(), Text.equal, Text.hash);
        sessionEntries := [];
    };
    
    // Helper functions
    private func generateSessionId(userId: UserId): SessionId {
        let _now = Time.now();
        Principal.toText(userId) # "_" # Int.toText(_now);
    };
    
    private func isSessionValid(session: UserSession): Bool {
        let _now = Time.now();
        session.expiresAt > _now;
    };
    
    // Public API
    public shared(msg) func createSession(): async Result.Result<SessionId, Error> {
        let caller = msg.caller;
        
        // Verify caller is not anonymous
        if (Principal.isAnonymous(caller)) {
            return #err(#Unauthorized);
        };
        
        let sessionId = generateSessionId(caller);
        let _now = Time.now();
        
        let session: UserSession = {
            userId = caller;
            sessionId = sessionId;
            created = _now;
            lastActive = _now;
            expiresAt = _now + SESSION_DURATION;
        };
        
        sessions.put(sessionId, session);
        #ok(sessionId);
    };
    
    public query func validateSession(sessionId: SessionId): async Result.Result<UserId, Error> {
        switch (sessions.get(sessionId)) {
            case (?session) {
                if (isSessionValid(session)) {
                    #ok(session.userId);
                } else {
                    #err(#SessionExpired);
                };
            };
            case null {
                #err(#InvalidSession);
            };
        };
    };
    
    public func refreshSession(sessionId: SessionId): async Result.Result<(), Error> {
        switch (sessions.get(sessionId)) {
            case (?session) {
                if (isSessionValid(session)) {
                    let _now = Time.now();
                    let refreshedSession: UserSession = {
                        session with
                        lastActive = _now;
                        expiresAt = _now + SESSION_DURATION;
                    };
                    sessions.put(sessionId, refreshedSession);
                    #ok(());
                } else {
                    #err(#SessionExpired);
                };
            };
            case null {
                #err(#InvalidSession);
            };
        };
    };
    
    public func revokeSession(sessionId: SessionId): async Result.Result<(), Error> {
        switch (sessions.get(sessionId)) {
            case (?_) {
                sessions.delete(sessionId);
                #ok(());
            };
            case null {
                #err(#InvalidSession);
            };
        };
    };
    
    public shared(msg) func whoami(): async Principal {
        msg.caller;
    };
    
    public func test(): async Text {
        "AuthProxy canister is running!";
    };

    public func healthCheck(): async {
        status: Text;
        activeSessions: Nat;
    } {
        // Count active (non-expired) sessions
        let _now = Time.now();
        var activeCount = 0;
        for ((_, session) in sessions.entries()) {
            if (isSessionValid(session)) {
                activeCount += 1;
            };
        };
        
        {
            status = "Auth Proxy operational";
            activeSessions = activeCount;
        }
    };
} 