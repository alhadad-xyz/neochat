import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";

actor DataStorage {
    // Types based on the normalized relational model from creative phase
    public type ConversationId = Text;
    public type MessageId = Text;
    public type SessionId = Text;
    public type AgentId = Text;
    public type UserId = Principal;
    
    public type MessageRole = {
        #User;
        #Agent;
        #System;
    };
    
    public type ConversationStatus = {
        #Active;
        #Completed;
        #Archived;
    };
    
    public type Conversation = {
        id: ConversationId;
        agentId: AgentId;
        sessionId: SessionId;
        participantId: ?Text;
        status: ConversationStatus;
        created: Time.Time;
        updated: Time.Time;
    };
    
    public type Message = {
        id: MessageId;
        conversationId: ConversationId;
        role: MessageRole;
        content: Text;
        tokens: Nat;
        timestamp: Time.Time;
        metadata: [(Text, Text)];
    };
    
    public type Error = {
        #NotFound;
        #Unauthorized;
        #ValidationError: Text;
        #StorageError: Text;
    };
    
    // Storage
    private stable var nextConversationId: Nat = 0;
    private stable var nextMessageId: Nat = 0;
    private stable var conversationEntries: [(ConversationId, Conversation)] = [];
    private stable var messageEntries: [(MessageId, Message)] = [];
    
    private var conversations = HashMap.HashMap<ConversationId, Conversation>(100, Text.equal, Text.hash);
    private var messages = HashMap.HashMap<MessageId, Message>(1000, Text.equal, Text.hash);
    
    // System upgrade hooks
    system func preupgrade() {
        conversationEntries := Iter.toArray(conversations.entries());
        messageEntries := Iter.toArray(messages.entries());
    };
    
    system func postupgrade() {
        conversations := HashMap.fromIter<ConversationId, Conversation>(conversationEntries.vals(), conversationEntries.size(), Text.equal, Text.hash);
        messages := HashMap.fromIter<MessageId, Message>(messageEntries.vals(), messageEntries.size(), Text.equal, Text.hash);
        conversationEntries := [];
        messageEntries := [];
    };
    
    // Helper functions
    private func generateConversationId(): ConversationId {
        nextConversationId += 1;
        "conv_" # Nat.toText(nextConversationId);
    };
    
    private func generateMessageId(): MessageId {
        nextMessageId += 1;
        "msg_" # Nat.toText(nextMessageId);
    };
    
    // Public API
    public func createConversation(agentId: AgentId, sessionId: SessionId, participantId: ?Text): async Result.Result<ConversationId, Error> {
        let conversationId = generateConversationId();
        let now = Time.now();
        
        let conversation: Conversation = {
            id = conversationId;
            agentId = agentId;
            sessionId = sessionId;
            participantId = participantId;
            status = #Active;
            created = now;
            updated = now;
        };
        
        conversations.put(conversationId, conversation);
        #ok(conversationId);
    };
    
    public query func getConversation(conversationId: ConversationId): async Result.Result<Conversation, Error> {
        switch (conversations.get(conversationId)) {
            case (?conversation) { #ok(conversation) };
            case null { #err(#NotFound) };
        };
    };
    
    public func storeMessage(conversationId: ConversationId, role: MessageRole, content: Text, tokens: Nat, metadata: [(Text, Text)]): async Result.Result<MessageId, Error> {
        // Verify conversation exists
        switch (conversations.get(conversationId)) {
            case (?conversation) {
                let messageId = generateMessageId();
                let now = Time.now();
                
                let message: Message = {
                    id = messageId;
                    conversationId = conversationId;
                    role = role;
                    content = content;
                    tokens = tokens;
                    timestamp = now;
                    metadata = metadata;
                };
                
                messages.put(messageId, message);
                
                // Update conversation timestamp
                let updatedConversation: Conversation = {
                    conversation with
                    updated = now;
                };
                conversations.put(conversationId, updatedConversation);
                
                #ok(messageId);
            };
            case null { #err(#NotFound) };
        };
    };
    
    public query func getConversationMessages(conversationId: ConversationId): async Result.Result<[Message], Error> {
        // Verify conversation exists
        switch (conversations.get(conversationId)) {
            case (?_) {
                let allMessages = Iter.toArray(messages.vals());
                let conversationMessages = Array.filter<Message>(allMessages, func(message: Message): Bool {
                    message.conversationId == conversationId
                });
                
                // Sort by timestamp (basic sort)
                #ok(conversationMessages);
            };
            case null { #err(#NotFound) };
        };
    };
    
    public func updateConversationStatus(conversationId: ConversationId, status: ConversationStatus): async Result.Result<(), Error> {
        switch (conversations.get(conversationId)) {
            case (?conversation) {
                let updatedConversation: Conversation = {
                    conversation with
                    status = status;
                    updated = Time.now();
                };
                conversations.put(conversationId, updatedConversation);
                #ok(());
            };
            case null { #err(#NotFound) };
        };
    };
    
    public query func getAgentConversations(agentId: AgentId, limit: ?Nat): async [Conversation] {
        let allConversations = Iter.toArray(conversations.vals());
        let agentConversations = Array.filter<Conversation>(allConversations, func(conv: Conversation): Bool {
            conv.agentId == agentId
        });
        
        // Apply limit if specified
        switch (limit) {
            case (?l) {
                if (agentConversations.size() <= l) {
                    agentConversations
                } else {
                    let actualLimit = Nat.min(l, agentConversations.size());
                    Array.subArray<Conversation>(agentConversations, 0, actualLimit);
                };
            };
            case null { agentConversations };
        };
    };
    
    public func test(): async Text {
        "DataStorage canister is running!";
    };

    public func healthCheck(): async {
        status: Text;
        totalConversations: Nat;
        totalMessages: Nat;
    } {
        {
            status = "Data Storage operational";
            totalConversations = conversations.size();
            totalMessages = messages.size();
        }
    };
} 