import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor SecurityManager {
    
    // Enhanced Authentication Types
    public type AuthenticationLevel = {
        #Basic;           // Internet Identity only
        #Enhanced;        // II + SMS/Email verification
        #Enterprise;      // II + Hardware token + Biometric
    };
    
    public type AuthSession = {
        principal: Principal;
        authLevel: AuthenticationLevel;
        sessionId: Text;
        createdAt: Int;
        expiresAt: Int;
        ipAddress: Text;
        userAgent: Text;
        mfaVerified: Bool;
        riskScore: Float;
        deviceFingerprint: Text;
        geoLocation: ?Text;
        refreshCount: Nat;
    };
    
    public type SessionSecurity = {
        encryptedToken: Text;
        rotationInterval: Int;
        maxIdleTime: Int;
        deviceFingerprint: Text;
        geoLocation: ?Text;
        suspiciousActivity: Bool;
        lastActivity: Int;
    };
    
    // Audit and Compliance Types
    public type AuditEvent = {
        eventId: Text;
        timestamp: Int;
        principal: Principal;
        action: AuditAction;
        resource: Text;
        outcome: AuditOutcome;
        metadata: [(Text, Text)];
        riskLevel: RiskLevel;
        complianceFlags: [Text];
        sessionId: ?Text;
        ipAddress: Text;
    };
    
    public type AuditAction = {
        #UserLogin;
        #UserLogout;
        #PaymentProcessed;
        #DataAccessed;
        #ConfigurationChanged;
        #SecurityEvent;
        #ComplianceViolation;
        #SessionCreated;
        #SessionExpired;
        #MFAVerified;
        #SuspiciousActivity;
    };
    
    public type AuditOutcome = {
        #Success;
        #Failure;
        #Warning;
        #Blocked;
    };
    
    public type RiskLevel = {
        #Low;
        #Medium;
        #High;
        #Critical;
    };
    
    // Security Anomaly Detection
    public type SecurityAnomaly = {
        anomalyId: Text;
        detectedAt: Int;
        principal: Principal;
        anomalyType: AnomalyType;
        riskScore: Float;
        indicators: [SecurityIndicator];
        recommendedAction: SecurityAction;
        resolved: Bool;
    };
    
    public type AnomalyType = {
        #UnusualLogin;               // Login from new location/device
        #SuspiciousPayment;          // Unusual payment patterns
        #DataAccessAnomaly;          // Abnormal data access patterns
        #APIAbuse;                   // API rate limiting violations
        #SecurityViolation;          // Policy violations
        #SessionAnomaly;             // Unusual session behavior
    };
    
    public type SecurityIndicator = {
        indicator: Text;
        severity: Float;
        description: Text;
    };
    
    public type SecurityAction = {
        #BlockUser;                  // Temporary user suspension
        #RequireReauth;             // Force re-authentication
        #LimitAccess;               // Restrict access permissions
        #AlertAdmin;                // Notify administrators
        #LogEvent;                  // Log for investigation
        #RequireMFA;                // Require additional MFA
    };
    
    // Data Encryption Types
    public type EncryptionConfig = {
        algorithm: Text;               // AES-256-GCM
        keyDerivation: Text;          // PBKDF2-SHA256
        keyRotationInterval: Int;     // 90 days
        backupEncryption: Bool;       // Encrypted backups
        transitEncryption: Text;      // TLS 1.3
    };
    
    public type DataClassification = {
        #Public;                      // No encryption required
        #Internal;                    // Standard encryption
        #Confidential;               // Enhanced encryption
        #Restricted;                 // Maximum security
    };
    
    // Error Types
    public type SecurityError = {
        #Unauthorized;
        #SessionExpired;
        #InvalidCredentials;
        #MFARequired;
        #SuspiciousActivity;
        #RateLimitExceeded;
        #ComplianceViolation;
        #InternalError: Text;
    };
    
    // Storage
    private stable var sessionsEntries: [(Text, AuthSession)] = [];
    private var activeSessions = HashMap.HashMap<Text, AuthSession>(10, Text.equal, Text.hash);
    
    private stable var auditLogEntries: [AuditEvent] = [];
    private var auditLog: [AuditEvent] = [];
    
    private stable var anomaliesEntries: [(Text, SecurityAnomaly)] = [];
    private var detectedAnomalies = HashMap.HashMap<Text, SecurityAnomaly>(10, Text.equal, Text.hash);
    
    private stable var userRiskScores: [(Principal, Float)] = [];
    private var riskScoreMap = HashMap.HashMap<Principal, Float>(10, Principal.equal, Principal.hash);
    
    // Security Configuration
    private let MAX_SESSION_DURATION: Int = 24 * 60 * 60 * 1000_000_000; // 24 hours in nanoseconds
    private let MAX_IDLE_TIME: Int = 2 * 60 * 60 * 1000_000_000; // 2 hours in nanoseconds
    private let SESSION_ROTATION_INTERVAL: Int = 60 * 60 * 1000_000_000; // 1 hour in nanoseconds
    private let HIGH_RISK_THRESHOLD: Float = 0.7;
    private let CRITICAL_RISK_THRESHOLD: Float = 0.9;
    
    // System upgrade hooks
    system func preupgrade() {
        sessionsEntries := Iter.toArray(activeSessions.entries());
        auditLogEntries := auditLog;
        anomaliesEntries := Iter.toArray(detectedAnomalies.entries());
        userRiskScores := Iter.toArray(riskScoreMap.entries());
    };
    
    system func postupgrade() {
        activeSessions := HashMap.fromIter<Text, AuthSession>(
            sessionsEntries.vals(), 
            sessionsEntries.size(), 
            Text.equal, 
            Text.hash
        );
        auditLog := auditLogEntries;
        detectedAnomalies := HashMap.fromIter<Text, SecurityAnomaly>(
            anomaliesEntries.vals(),
            anomaliesEntries.size(),
            Text.equal,
            Text.hash
        );
        riskScoreMap := HashMap.fromIter<Principal, Float>(
            userRiskScores.vals(),
            userRiskScores.size(),
            Principal.equal,
            Principal.hash
        );
        sessionsEntries := [];
        auditLogEntries := [];
        anomaliesEntries := [];
        userRiskScores := [];
    };
    
    // Session Management Functions
    public func createSession(
        principal: Principal,
        authLevel: AuthenticationLevel,
        ipAddress: Text,
        userAgent: Text,
        deviceFingerprint: Text,
        geoLocation: ?Text
    ): async Result.Result<AuthSession, SecurityError> {
        let now = Time.now();
        let sessionId = generateSessionId(principal, now);
        let riskScore = calculateRiskScore(principal, ipAddress, deviceFingerprint, geoLocation);
        
        let session: AuthSession = {
            principal = principal;
            authLevel = authLevel;
            sessionId = sessionId;
            createdAt = now;
            expiresAt = now + MAX_SESSION_DURATION;
            ipAddress = ipAddress;
            userAgent = userAgent;
            mfaVerified = false;
            riskScore = riskScore;
            deviceFingerprint = deviceFingerprint;
            geoLocation = geoLocation;
            refreshCount = 0;
        };
        
        // Store session
        activeSessions.put(sessionId, session);
        
        // Update user risk score
        riskScoreMap.put(principal, riskScore);
        
        // Log session creation
        await logAuditEvent({
            eventId = generateEventId();
            timestamp = now;
            principal = principal;
            action = #SessionCreated;
            resource = "session:" # sessionId;
            outcome = #Success;
            metadata = [
                ("authLevel", authLevelToText(authLevel)),
                ("ipAddress", ipAddress),
                ("riskScore", Float.toText(riskScore))
            ];
            riskLevel = riskScoreToLevel(riskScore);
            complianceFlags = [];
            sessionId = ?sessionId;
            ipAddress = ipAddress;
        });
        
        // Check for anomalies
        await detectAnomalies(principal, session);
        
        #ok(session)
    };
    
    public func validateSession(sessionId: Text): async Result.Result<AuthSession, SecurityError> {
        switch (activeSessions.get(sessionId)) {
            case null { #err(#SessionExpired) };
            case (?session) {
                let now = Time.now();
                
                // Check if session expired
                if (now > session.expiresAt) {
                    activeSessions.delete(sessionId);
                    await logAuditEvent({
                        eventId = generateEventId();
                        timestamp = now;
                        principal = session.principal;
                        action = #SessionExpired;
                        resource = "session:" # sessionId;
                        outcome = #Warning;
                        metadata = [("reason", "expired")];
                        riskLevel = #Low;
                        complianceFlags = [];
                        sessionId = ?sessionId;
                        ipAddress = session.ipAddress;
                    });
                    #err(#SessionExpired)
                } else {
                    #ok(session)
                }
            };
        }
    };
    
    public func refreshSession(sessionId: Text): async Result.Result<AuthSession, SecurityError> {
        switch (activeSessions.get(sessionId)) {
            case null { #err(#SessionExpired) };
            case (?session) {
                let now = Time.now();
                
                // Create new session with extended expiration
                let refreshedSession: AuthSession = {
                    session with
                    expiresAt = now + MAX_SESSION_DURATION;
                    refreshCount = session.refreshCount + 1;
                };
                
                activeSessions.put(sessionId, refreshedSession);
                
                await logAuditEvent({
                    eventId = generateEventId();
                    timestamp = now;
                    principal = session.principal;
                    action = #SessionCreated;
                    resource = "session:" # sessionId;
                    outcome = #Success;
                    metadata = [("action", "refresh"), ("refreshCount", Int.toText(refreshedSession.refreshCount))];
                    riskLevel = #Low;
                    complianceFlags = [];
                    sessionId = ?sessionId;
                    ipAddress = session.ipAddress;
                });
                
                #ok(refreshedSession)
            };
        }
    };
    
    public func terminateSession(sessionId: Text): async Result.Result<(), SecurityError> {
        switch (activeSessions.get(sessionId)) {
            case null { #err(#SessionExpired) };
            case (?session) {
                activeSessions.delete(sessionId);
                
                await logAuditEvent({
                    eventId = generateEventId();
                    timestamp = Time.now();
                    principal = session.principal;
                    action = #UserLogout;
                    resource = "session:" # sessionId;
                    outcome = #Success;
                    metadata = [("action", "manual_logout")];
                    riskLevel = #Low;
                    complianceFlags = [];
                    sessionId = ?sessionId;
                    ipAddress = session.ipAddress;
                });
                
                #ok(())
            };
        }
    };
    
    // MFA Verification
    public func verifyMFA(sessionId: Text, mfaToken: Text): async Result.Result<AuthSession, SecurityError> {
        switch (activeSessions.get(sessionId)) {
            case null { #err(#SessionExpired) };
            case (?session) {
                // In a real implementation, this would verify the MFA token
                // For now, we'll simulate successful MFA verification
                let verifiedSession: AuthSession = {
                    session with mfaVerified = true;
                };
                
                activeSessions.put(sessionId, verifiedSession);
                
                await logAuditEvent({
                    eventId = generateEventId();
                    timestamp = Time.now();
                    principal = session.principal;
                    action = #MFAVerified;
                    resource = "session:" # sessionId;
                    outcome = #Success;
                    metadata = [("mfaType", "totp")]; // Time-based One-Time Password
                    riskLevel = #Low;
                    complianceFlags = ["MFA_VERIFIED"];
                    sessionId = ?sessionId;
                    ipAddress = session.ipAddress;
                });
                
                #ok(verifiedSession)
            };
        }
    };
    
    // Audit Functions
    public func logAuditEvent(event: AuditEvent): async () {
        auditLog := Array.append<AuditEvent>(auditLog, [event]);
    };
    
    public func getAuditLog(limit: ?Nat): async [AuditEvent] {
        let logLimit = switch (limit) {
            case null { auditLog.size() };
            case (?n) { if (n > auditLog.size()) auditLog.size() else n };
        };
        
        let sortedLog = Array.sort<AuditEvent>(auditLog, func(a, b) = Int.compare(b.timestamp, a.timestamp));
        Array.take<AuditEvent>(sortedLog, logLimit)
    };
    
    public func getAuditLogForUser(principal: Principal, limit: ?Nat): async [AuditEvent] {
        let userEvents = Array.filter<AuditEvent>(auditLog, func(event) = event.principal == principal);
        let sortedEvents = Array.sort<AuditEvent>(userEvents, func(a, b) = Int.compare(b.timestamp, a.timestamp));
        
        let logLimit = switch (limit) {
            case null { sortedEvents.size() };
            case (?n) { if (n > sortedEvents.size()) sortedEvents.size() else n };
        };
        
        Array.take<AuditEvent>(sortedEvents, logLimit)
    };
    
    // Anomaly Detection
    private func detectAnomalies(principal: Principal, session: AuthSession): async () {
        var indicators: [SecurityIndicator] = [];
        var riskScore: Float = session.riskScore;
        
        // Check for unusual login patterns
        let userSessions = Array.filter<(Text, AuthSession)>(
            Iter.toArray(activeSessions.entries()),
            func((_, s)) = s.principal == principal
        );
        
        // Multiple concurrent sessions
        if (userSessions.size() > 3) {
            indicators := Array.append(indicators, [{
                indicator = "multiple_concurrent_sessions";
                severity = 0.6;
                description = "User has " # Int.toText(userSessions.size()) # " concurrent sessions";
            }]);
            riskScore := riskScore + 0.2;
        };
        
        // High risk score threshold
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            let anomalyId = generateEventId();
            let anomaly: SecurityAnomaly = {
                anomalyId = anomalyId;
                detectedAt = Time.now();
                principal = principal;
                anomalyType = #UnusualLogin;
                riskScore = riskScore;
                indicators = indicators;
                recommendedAction = if (riskScore >= CRITICAL_RISK_THRESHOLD) #BlockUser else #RequireMFA;
                resolved = false;
            };
            
            detectedAnomalies.put(anomalyId, anomaly);
            
            await logAuditEvent({
                eventId = generateEventId();
                timestamp = Time.now();
                principal = principal;
                action = #SuspiciousActivity;
                resource = "anomaly:" # anomalyId;
                outcome = #Warning;
                metadata = [
                    ("anomalyType", "unusual_login"),
                    ("riskScore", Float.toText(riskScore)),
                    ("indicators", Int.toText(indicators.size()))
                ];
                riskLevel = if (riskScore >= CRITICAL_RISK_THRESHOLD) #Critical else #High;
                complianceFlags = ["ANOMALY_DETECTED"];
                sessionId = ?session.sessionId;
                ipAddress = session.ipAddress;
            });
        };
    };
    
    // Security Analytics
    public func getSecurityMetrics(): async {
        totalSessions: Nat;
        activeSessions: Nat;
        totalAuditEvents: Nat;
        detectedAnomalies: Nat;
        highRiskUsers: Nat;
        complianceViolations: Nat;
    } {
        let highRiskUsers = Array.filter<(Principal, Float)>(
            Iter.toArray(riskScoreMap.entries()),
            func((_, score)) = score >= HIGH_RISK_THRESHOLD
        );
        
        let complianceViolations = Array.filter<AuditEvent>(
            auditLog,
            func(event) = event.action == #ComplianceViolation
        );
        
        {
            totalSessions = sessionsEntries.size() + activeSessions.size();
            activeSessions = activeSessions.size();
            totalAuditEvents = auditLog.size();
            detectedAnomalies = detectedAnomalies.size();
            highRiskUsers = highRiskUsers.size();
            complianceViolations = complianceViolations.size();
        }
    };
    
    public func getUserRiskScore(principal: Principal): async Float {
        switch (riskScoreMap.get(principal)) {
            case null { 0.0 };
            case (?score) { score };
        }
    };
    
    public func getActiveAnomalies(): async [SecurityAnomaly] {
        let activeAnomalies = Array.filter<(Text, SecurityAnomaly)>(
            Iter.toArray(detectedAnomalies.entries()),
            func((_, anomaly)) = not anomaly.resolved
        );
        Array.map<(Text, SecurityAnomaly), SecurityAnomaly>(activeAnomalies, func((_, anomaly)) = anomaly)
    };
    
    // Health Check
    public func healthCheck(): async { status: Text; metrics: Text } {
        let metrics = await getSecurityMetrics();
        {
            status = "Security Manager: OPERATIONAL";
            metrics = "Sessions: " # Int.toText(metrics.activeSessions) # 
                     ", Audit Events: " # Int.toText(metrics.totalAuditEvents) #
                     ", Anomalies: " # Int.toText(metrics.detectedAnomalies);
        }
    };
    
    // Helper Functions
    private func generateSessionId(principal: Principal, timestamp: Int): Text {
        Principal.toText(principal) # "-" # Int.toText(timestamp) # "-" # Int.toText(Time.now())
    };
    
    private func generateEventId(): Text {
        "evt-" # Int.toText(Time.now()) # "-" # Int.toText(auditLog.size())
    };
    
    private func calculateRiskScore(
        principal: Principal, 
        ipAddress: Text, 
        deviceFingerprint: Text, 
        geoLocation: ?Text
    ): Float {
        var score: Float = 0.1; // Base risk score
        
        // Check for known IP patterns (simplified)
        if (Text.contains(ipAddress, #text "192.168.") or Text.contains(ipAddress, #text "10.0.")) {
            score := score + 0.1; // Local network - slightly higher risk
        };
        
        // Check device fingerprint consistency (simplified)
        // In real implementation, this would check against known devices
        if (Text.size(deviceFingerprint) < 10) {
            score := score + 0.2; // Suspicious device fingerprint
        };
        
        // Geo-location risk assessment
        switch (geoLocation) {
            case null { score := score + 0.1 }; // No geo data is slightly risky
            case (?location) {
                // In real implementation, check against known safe locations
                if (Text.contains(location, #text "unknown")) {
                    score := score + 0.3;
                };
            };
        };
        
        // Cap at 1.0
        if (score > 1.0) { 1.0 } else { score }
    };
    
    private func authLevelToText(level: AuthenticationLevel): Text {
        switch (level) {
            case (#Basic) { "basic" };
            case (#Enhanced) { "enhanced" };
            case (#Enterprise) { "enterprise" };
        }
    };
    
    private func riskScoreToLevel(score: Float): RiskLevel {
        if (score >= CRITICAL_RISK_THRESHOLD) {
            #Critical
        } else if (score >= HIGH_RISK_THRESHOLD) {
            #High
        } else if (score >= 0.3) {
            #Medium
        } else {
            #Low
        }
    };
} 