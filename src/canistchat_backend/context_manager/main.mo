import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Float "mo:base/Float";

actor ContextManager {
    // Types for sophisticated context management
    public type UserId = Principal;
    public type AgentId = Text;
    public type ConversationId = Text;
    public type ContextId = Text;
    public type MessageId = Text;
    
    public type MessageRole = {
        #User;
        #Agent;
        #System;
    };
    
    public type Message = {
        id: MessageId;
        role: MessageRole;
        content: Text;
        timestamp: Time.Time;
        tokens: Nat;
        metadata: [(Text, Text)];
        importance: Float; // 0.0-1.0 for context compression
        sentiment: ?Text; // positive, negative, neutral
    };
    
    public type ConversationContext = {
        id: ContextId;
        conversationId: ConversationId;
        agentId: AgentId;
        userId: UserId;
        messages: [Message];
        summary: ?Text; // AI-generated summary for compression
        totalTokens: Nat;
        maxTokens: Nat;
        compressionThreshold: Nat;
        retentionHours: Nat;
        created: Time.Time;
        lastAccessed: Time.Time;
        isActive: Bool;
        compressionLevel: Float; // 0.0-1.0, higher = more compressed
        metadata: [(Text, Text)];
    };
    
    public type ContextSummary = {
        contextId: ContextId;
        messageCount: Nat;
        tokenCount: Nat;
        timeSpan: Nat; // seconds
        lastActivity: Time.Time;
        compressionRatio: Float;
        keyTopics: [Text];
    };
    
    public type CompressionResult = {
        originalMessages: Nat;
        compressedMessages: Nat;
        tokenSaved: Nat;
        summaryGenerated: Bool;
        compressionRatio: Float;
    };
    
    public type Error = {
        #NotFound;
        #Unauthorized;
        #InvalidInput: Text;
        #CompressionError: Text;
        #StorageError: Text;
        #TokenLimitExceeded;
    };
    
    // Enhanced storage with performance optimization
    private var contexts = HashMap.HashMap<ContextId, ConversationContext>(100, Text.equal, Text.hash);
    private var userContexts = HashMap.HashMap<UserId, [ContextId]>(50, Principal.equal, Principal.hash);
    private var agentContexts = HashMap.HashMap<AgentId, [ContextId]>(50, Text.equal, Text.hash);
    private var conversationContexts = HashMap.HashMap<ConversationId, ContextId>(100, Text.equal, Text.hash);
    
    private stable var nextContextId: Nat = 0;
    private stable var nextMessageId: Nat = 0;
    private stable var totalContexts: Nat = 0;
    private stable var totalMessages: Nat = 0;
    
    // Stable storage for upgrades
    private stable var contextEntries: [(ContextId, ConversationContext)] = [];
    private stable var userContextEntries: [(UserId, [ContextId])] = [];
    private stable var agentContextEntries: [(AgentId, [ContextId])] = [];
    private stable var conversationContextEntries: [(ConversationId, ContextId)] = [];
    
    // System upgrade hooks
    system func preupgrade() {
        contextEntries := contexts.entries() |> Array.fromIter<(ContextId, ConversationContext)>(_);
        userContextEntries := userContexts.entries() |> Array.fromIter<(UserId, [ContextId])>(_);
        agentContextEntries := agentContexts.entries() |> Array.fromIter<(AgentId, [ContextId])>(_);
        conversationContextEntries := conversationContexts.entries() |> Array.fromIter<(ConversationId, ContextId)>(_);
    };
    
    system func postupgrade() {
        contexts := HashMap.fromIter<ContextId, ConversationContext>(contextEntries.vals(), contextEntries.size(), Text.equal, Text.hash);
        userContexts := HashMap.fromIter<UserId, [ContextId]>(userContextEntries.vals(), userContextEntries.size(), Principal.equal, Principal.hash);
        agentContexts := HashMap.fromIter<AgentId, [ContextId]>(agentContextEntries.vals(), agentContextEntries.size(), Text.equal, Text.hash);
        conversationContexts := HashMap.fromIter<ConversationId, ContextId>(conversationContextEntries.vals(), conversationContextEntries.size(), Text.equal, Text.hash);
        
        contextEntries := [];
        userContextEntries := [];
        agentContextEntries := [];
        conversationContextEntries := [];
    };
    
    // Helper functions
    private func generateContextId(): ContextId {
        nextContextId += 1;
        "ctx_" # Nat.toText(nextContextId)
    };
    
    private func generateMessageId(): MessageId {
        nextMessageId += 1;
        "msg_" # Nat.toText(nextMessageId)
    };
    
    private func calculateTokens(text: Text): Nat {
        let chars = text.size();
        (chars + 3) / 4 // Rough estimation: 4 chars per token
    };
    
    private func calculateMessageImportance(message: Message, position: Nat, totalMessages: Nat): Float {
        var importance: Float = 0.5; // Base importance
        
        // Recent messages are more important
        let recencyBonus = Float.fromInt(totalMessages - position) / Float.fromInt(totalMessages);
        importance += recencyBonus * 0.3;
        
        // Longer messages might be more important
        if (message.tokens > 50) {
            importance += 0.2;
        };
        
        // System messages are usually important
        switch (message.role) {
            case (#System) { importance += 0.3; };
            case (#Agent) { importance += 0.1; };
            case (#User) { importance += 0.0; };
        };
        
        // Cap at 1.0
        if (importance > 1.0) { 1.0 } else { importance }
    };
    
    private func generateContextSummary(messages: [Message]): Text {
        if (messages.size() == 0) {
            return "Empty conversation";
        };
        
        let messageCount = messages.size();
        let recentMessages = if (messageCount > 5) {
            Array.subArray<Message>(messages, messageCount - 5, 5)
        } else {
            messages
        };
        
        let summaryBuffer = Buffer.Buffer<Text>(10);
        summaryBuffer.add("Summary of " # Nat.toText(messageCount) # " messages:");
        
        var userMessages = 0;
        var agentMessages = 0;
        
        for (msg in messages.vals()) {
            switch (msg.role) {
                case (#User) { userMessages += 1; };
                case (#Agent) { agentMessages += 1; };
                case (#System) { };
            };
        };
        
        summaryBuffer.add("User messages: " # Nat.toText(userMessages));
        summaryBuffer.add("Agent responses: " # Nat.toText(agentMessages));
        
        if (recentMessages.size() > 0) {
            summaryBuffer.add("Recent context: ");
            for (msg in recentMessages.vals()) {
                let role = switch (msg.role) {
                    case (#User) { "User" };
                    case (#Agent) { "Agent" };
                    case (#System) { "System" };
                };
                let preview = if (Text.size(msg.content) > 50) {
                    Text.take(msg.content, 50) # "..."
                } else {
                    msg.content
                };
                summaryBuffer.add(role # ": " # preview);
            };
        };
        
        Text.join(" | ", summaryBuffer.vals())
    };
    
    // Core context management functions
    public shared(msg) func createContext(
        conversationId: ConversationId,
        agentId: AgentId,
        maxTokens: ?Nat,
        retentionHours: ?Nat
    ): async Result.Result<ContextId, Error> {
        let caller = msg.caller;
        
        // Check if context already exists for this conversation
        switch (conversationContexts.get(conversationId)) {
            case (?existingContextId) {
                return #ok(existingContextId);
            };
            case null {};
        };
        
        let contextId = generateContextId();
        let now = Time.now();
        
        let context: ConversationContext = {
            id = contextId;
            conversationId = conversationId;
            agentId = agentId;
            userId = caller;
            messages = [];
            summary = null;
            totalTokens = 0;
            maxTokens = Option.get(maxTokens, 4000);
            compressionThreshold = Option.get(maxTokens, 4000) * 80 / 100; // 80% of max
            retentionHours = Option.get(retentionHours, 24);
            created = now;
            lastAccessed = now;
            isActive = true;
            compressionLevel = 0.0;
            metadata = [];
        };
        
        contexts.put(contextId, context);
        conversationContexts.put(conversationId, contextId);
        
        // Update user contexts
        switch (userContexts.get(caller)) {
            case (?existing) {
                userContexts.put(caller, Array.append(existing, [contextId]));
            };
            case null {
                userContexts.put(caller, [contextId]);
            };
        };
        
        // Update agent contexts
        switch (agentContexts.get(agentId)) {
            case (?existing) {
                agentContexts.put(agentId, Array.append(existing, [contextId]));
            };
            case null {
                agentContexts.put(agentId, [contextId]);
            };
        };
        
        totalContexts += 1;
        #ok(contextId)
    };
    
    public shared(msg) func addMessage(
        contextId: ContextId,
        role: MessageRole,
        content: Text,
        metadata: ?[(Text, Text)]
    ): async Result.Result<MessageId, Error> {
        let caller = msg.caller;
        
        if (Text.size(content) == 0) {
            return #err(#InvalidInput("Message content cannot be empty"));
        };
        
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) {
                if (context.userId != caller) {
                    return #err(#Unauthorized);
                };
                
                let messageId = generateMessageId();
                let now = Time.now();
                let tokens = calculateTokens(content);
                
                let newMessage: Message = {
                    id = messageId;
                    role = role;
                    content = content;
                    timestamp = now;
                    tokens = tokens;
                    metadata = Option.get(metadata, []);
                    importance = calculateMessageImportance({
                        id = messageId;
                        role = role;
                        content = content;
                        timestamp = now;
                        tokens = tokens;
                        metadata = Option.get(metadata, []);
                        importance = 0.5;
                        sentiment = null;
                    }, context.messages.size(), context.messages.size() + 1);
                    sentiment = null; // TODO: Implement sentiment analysis
                };
                
                var updatedMessages = Array.append(context.messages, [newMessage]);
                var newTotalTokens = context.totalTokens + tokens;
                var compressionResult: ?CompressionResult = null;
                
                // Check if compression is needed
                if (newTotalTokens > context.compressionThreshold) {
                    switch (await compressContext(contextId)) {
                        case (#ok(result)) {
                            compressionResult := ?result;
                            // Reload context after compression
                            switch (contexts.get(contextId)) {
                                case (?compressedContext) {
                                    updatedMessages := Array.append(compressedContext.messages, [newMessage]);
                                    newTotalTokens := compressedContext.totalTokens + tokens;
                                };
                                case null {
                                    return #err(#StorageError("Context lost during compression"));
                                };
                            };
                        };
                        case (#err(_)) {
                            // Continue without compression if it fails
                        };
                    };
                };
                
                let updatedContext: ConversationContext = {
                    context with
                    messages = updatedMessages;
                    totalTokens = newTotalTokens;
                    lastAccessed = now;
                };
                
                contexts.put(contextId, updatedContext);
                totalMessages += 1;
                
                #ok(messageId)
            };
        }
    };
    
    public func compressContext(contextId: ContextId): async Result.Result<CompressionResult, Error> {
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) {
                if (context.messages.size() < 5) {
                    return #err(#CompressionError("Not enough messages to compress"));
                };
                
                let originalCount = context.messages.size();
                let originalTokens = context.totalTokens;
                
                // Simple compression: keep most important messages and generate summary
                let sortedMessages = Array.sort<Message>(context.messages, func(a, b) {
                    if (a.importance > b.importance) { #less }
                    else if (a.importance < b.importance) { #greater }
                    else { #equal }
                });
                
                // Keep top 50% of messages by importance, minimum 3 messages
                let keepCount = Nat.max(3, originalCount / 2);
                let compressedMessages = Array.subArray<Message>(sortedMessages, 0, keepCount);
                
                // Generate summary of removed messages
                let removedMessages = Array.subArray<Message>(sortedMessages, keepCount, originalCount - keepCount);
                let summary = generateContextSummary(removedMessages);
                
                let newTokenCount = Array.foldLeft<Message, Nat>(compressedMessages, 0, func(acc, msg) {
                    acc + msg.tokens
                }) + calculateTokens(summary);
                
                let updatedContext: ConversationContext = {
                    context with
                    messages = compressedMessages;
                    summary = ?summary;
                    totalTokens = newTokenCount;
                    compressionLevel = Float.fromInt(originalCount - compressedMessages.size()) / Float.fromInt(originalCount);
                    lastAccessed = Time.now();
                };
                
                contexts.put(contextId, updatedContext);
                
                #ok({
                    originalMessages = originalCount;
                    compressedMessages = compressedMessages.size();
                    tokenSaved = Int.abs(originalTokens - newTokenCount);
                    summaryGenerated = true;
                    compressionRatio = updatedContext.compressionLevel;
                })
            };
        }
    };
    
    public query func getContext(contextId: ContextId): async Result.Result<ConversationContext, Error> {
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) { #ok(context) };
        }
    };
    
    public func getContextSummary(contextId: ContextId): async Result.Result<ContextSummary, Error> {
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) {
                let timeSpan = if (context.messages.size() > 0) {
                    let firstMessage = context.messages[0];
                    let lastMessage = context.messages[context.messages.size() - 1];
                    Int.abs(lastMessage.timestamp - firstMessage.timestamp) / 1_000_000_000 // Convert to seconds
                } else { 0 };
                
                // Extract key topics (simple implementation)
                let keyTopics = if (Option.isSome(context.summary)) {
                    ["conversation", "context", "messages"] // Placeholder
                } else {
                    ["active", "ongoing"]
                };
                
                #ok({
                    contextId = contextId;
                    messageCount = context.messages.size();
                    tokenCount = context.totalTokens;
                    timeSpan = timeSpan;
                    lastActivity = context.lastAccessed;
                    compressionRatio = context.compressionLevel;
                    keyTopics = keyTopics;
                })
            };
        }
    };
    
    public query func getUserContexts(userId: UserId): async [ContextSummary] {
        switch (userContexts.get(userId)) {
            case (null) { [] };
            case (?contextIds) {
                Array.mapFilter<ContextId, ContextSummary>(contextIds, func(contextId) {
                    switch (contexts.get(contextId)) {
                        case (null) { null };
                        case (?context) {
                            let timeSpan = if (context.messages.size() > 0) {
                                let firstMessage = context.messages[0];
                                let lastMessage = context.messages[context.messages.size() - 1];
                                Int.abs(lastMessage.timestamp - firstMessage.timestamp) / 1_000_000_000
                            } else { 0 };
                            
                            ?{
                                contextId = contextId;
                                messageCount = context.messages.size();
                                tokenCount = context.totalTokens;
                                timeSpan = timeSpan;
                                lastActivity = context.lastAccessed;
                                compressionRatio = context.compressionLevel;
                                keyTopics = ["conversation"];
                            }
                        };
                    }
                })
            };
        }
    };
    
    public func cleanupExpiredContexts(): async Nat {
        let now = Time.now();
        let oneHour = 3_600_000_000_000; // 1 hour in nanoseconds
        var cleanedCount = 0;
        
        for ((contextId, context) in contexts.entries()) {
            let expirationTime = context.created + (Int.abs(context.retentionHours) * oneHour);
            if (now > expirationTime and not context.isActive) {
                contexts.delete(contextId);
                conversationContexts.delete(context.conversationId);
                cleanedCount += 1;
            };
        };
        
        cleanedCount
    };
    
    public func healthCheck(): async {
        status: Text;
        totalContexts: Nat;
        activeContexts: Nat;
        totalMessages: Nat;
        averageMessagesPerContext: Float;
    } {
        var activeCount = 0;
        for ((_, context) in contexts.entries()) {
            if (context.isActive) {
                activeCount += 1;
            };
        };
        
        let avgMessages = if (contexts.size() > 0) {
            Float.fromInt(totalMessages) / Float.fromInt(contexts.size())
        } else { 0.0 };
        
        {
            status = "Context Manager operational";
            totalContexts = contexts.size();
            activeContexts = activeCount;
            totalMessages = totalMessages;
            averageMessagesPerContext = avgMessages;
        }
    };
    
    public func test(): async Text {
        "Context Manager with sophisticated conversation handling is running!"
    };
} 