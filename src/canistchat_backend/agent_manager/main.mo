/**
 * @fileoverview NeoChat Agent Manager Canister
 * 
 * This canister manages the creation, storage, and retrieval of AI agents
 * for the NeoChat platform. It provides a comprehensive API for agent
 * lifecycle management, including creation, updates, deletion, and analytics.
 * 
 * Features:
 * - Agent creation and configuration management
 * - Agent status tracking and updates
 * - User agent ownership and permissions
 * - Agent analytics and usage tracking
 * - Public agent discovery and access
 * - Agent versioning and history
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import _Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Int "mo:base/Int";
import Float "mo:base/Float";

actor AgentManager {
    // Enhanced Types for Week 2: Advanced Agent Configuration & Versioning
    public type AgentId = Text;
    public type UserId = Principal;
    public type VersionId = Nat;
    public type ContextId = Text;
    
    public type AgentStatus = {
        #Active;
        #Inactive;
        #Suspended;
        #Archived;
    };
    
    // Enhanced Personality Configuration with advanced settings
    public type PersonalityConfig = {
        tone: Text; // friendly, formal, enthusiastic, professional, casual
        style: Text; // customer_support, sales, technical, educational, creative
        traits: [Text]; // helpful, analytical, empathetic, assertive, etc.
        communicationStyle: {
            #Conversational;
            #Professional;
            #Technical;
            #Creative;
            #Educational;
        };
        responsePattern: {
            #Detailed;
            #Concise;
            #Structured;
            #Narrative;
        };
    };
    
    // Enhanced Knowledge Sources with versioning and metadata
    public type KnowledgeSource = {
        id: Text;
        sourceType: {#Document; #URL; #Manual; #Database; #API};
        content: Text;
        metadata: [(Text, Text)];
        priority: Nat; // 1-10, higher is more important
        lastUpdated: Time.Time;
        version: VersionId;
        isActive: Bool;
    };
    
    // Enhanced Behavior Configuration with LLM optimization
    public type BehaviorConfig = {
        responseLength: {#Short; #Medium; #Long; #Variable};
        creativity: Float; // 0.0 to 1.0
        temperature: Float; // LLM temperature setting 0.0 to 2.0
        topP: Float; // Nucleus sampling parameter
        frequencyPenalty: Float; // Reduce repetition
        presencePenalty: Float; // Encourage topic diversity
        maxTokens: Nat; // Maximum response length
        contextWindow: Nat; // How much chat history to consider
        systemPromptTemplate: Text; // Custom system prompt template
    };
    
    // Enhanced Appearance Configuration
    public type AppearanceConfig = {
        avatar: ?Text; // URL or base64
        primaryColor: Text;
        secondaryColor: Text;
        accentColor: Text;
        borderRadius: Text;
        fontSize: Text;
        fontFamily: Text;
        theme: {#Light; #Dark; #Auto};
        customCSS: ?Text;
    };
    
    // Context Management for sophisticated conversations
    public type ConversationContext = {
        contextId: ContextId;
        agentId: AgentId;
        userId: UserId;
        messages: [ContextMessage];
        metadata: [(Text, Text)];
        created: Time.Time;
        lastAccessed: Time.Time;
        maxSize: Nat;
        compressionEnabled: Bool;
    };
    
    public type ContextMessage = {
        role: {#User; #Assistant; #System};
        content: Text;
        timestamp: Time.Time;
        metadata: [(Text, Text)];
        tokenCount: ?Nat;
    };
    
    // Agent Configuration with versioning
    public type AgentConfig = {
        version: VersionId;
        personality: PersonalityConfig;
        knowledgeBase: [KnowledgeSource];
        behavior: BehaviorConfig;
        appearance: AppearanceConfig;
        contextSettings: {
            enableMemory: Bool;
            memoryDuration: Nat; // Hours to remember context
            maxContextMessages: Nat;
            enableLearning: Bool;
        };
        integrationSettings: {
            allowedOrigins: [Text];
            rateLimiting: {
                enabled: Bool;
                maxRequestsPerHour: Nat;
                maxTokensPerHour: Nat;
            };
            webhooks: [{
                url: Text;
                events: [Text];
                enabled: Bool;
            }];
        };
    };
    
    // Enhanced Agent with versioning and analytics
    public type Agent = {
        id: AgentId;
        name: Text;
        description: Text;
        category: Text;
        tags: [Text];
        ownerId: UserId;
        config: AgentConfig;
        configHistory: [AgentConfig]; // Version history
        status: AgentStatus;
        created: Time.Time;
        updated: Time.Time;
        lastUsed: ?Time.Time;
        analytics: {
            totalConversations: Nat;
            totalMessages: Nat;
            averageRating: ?Float;
            totalTokensUsed: Nat;
        };
        permissions: {
            isPublic: Bool;
            allowedUsers: [UserId];
            accessLevel: {#Owner; #Editor; #Viewer};
        };
    };
    
    // Enhanced Agent Creation Request
    public type CreateAgentRequest = {
        name: Text;
        description: Text;
        category: Text;
        tags: [Text];
        config: AgentConfig;
        isPublic: Bool;
    };
    
    // Configuration Validation Types
    public type ValidationResult = {
        isValid: Bool;
        errors: [Text];
        warnings: [Text];
        score: Float; // 0.0 to 1.0 configuration quality score
    };
    
    public type Error = {
        #NotFound;
        #Unauthorized;
        #ValidationError: Text;
        #InternalError: Text;
        #RateLimitExceeded;
        #QuotaExceeded;
        #ConfigurationError: Text;
    };

    // Enhanced Storage with versioning and context management
    private stable var nextAgentId: Nat = 0;
    private stable var nextVersionId: Nat = 0;
    private stable var nextContextId: Nat = 0;
    private stable var agentEntries: [(AgentId, Agent)] = [];
    private stable var userAgentEntries: [(UserId, [AgentId])] = [];
    private stable var contextEntries: [(ContextId, ConversationContext)] = [];
    private stable var configVersionEntries: [(Text, [AgentConfig])] = []; // AgentId -> Config versions
    
    private var agents = HashMap.HashMap<AgentId, Agent>(50, Text.equal, Text.hash);
    private var userAgents = HashMap.HashMap<UserId, [AgentId]>(50, Principal.equal, Principal.hash);
    private var contexts = HashMap.HashMap<ContextId, ConversationContext>(100, Text.equal, Text.hash);
    private var configVersions = HashMap.HashMap<AgentId, [AgentConfig]>(50, Text.equal, Text.hash);
    
    // Inter-canister communication actor references
    private let llmProcessor = actor("g26ho-daaaa-aaaab-aag2a-cai") : actor {
        processMessage: ({
            agentId: Text;
            conversationId: Text;
            userMessage: Text;
            agentPersonality: ?Text;
            systemPrompt: ?Text;
            context: ?[{
                id: Text;
                role: {#User; #Agent; #System};
                content: Text;
                timestamp: Int;
                tokens: Nat;
                metadata: [(Text, Text)];
            }];
            temperature: ?Float;
            maxTokens: ?Nat;
            routingStrategy: ?{#Performance; #Cost; #Balanced; #Availability; #Model: Text};
            enableStreaming: ?Bool;
        }) -> async Result.Result<{
            messageId: Text;
            agentResponse: Text;
            tokens: Nat;
            confidence: Float;
            providerId: Text;
            modelUsed: Text;
            processingTime: Nat;
            cached: Bool;
            metadata: [(Text, Text)];
        }, {
            #AuthenticationError;
            #ConfigurationError: Text;
            #InvalidInput: Text;
            #NetworkError: Text;
            #NoProvidersAvailable;
            #ProcessingError: Text;
            #QuotaExceeded;
            #RateLimited;
            #ServiceUnavailable;
        }>;
        estimateTokens: (Text) -> async Nat;
        healthCheck: () -> async {
            status: Text;
            providers: Nat;
            activeProviders: Nat;
        };
    };

    private let metricsCollector = actor("b77ix-eeaaa-aaaaa-qaada-cai") : actor {
        chargeUser: (Text, Text, Nat) -> async Result.Result<(), Text>;
        getUserBalance: (Text) -> async ?Nat;
        getUserTier: (Text) -> async Text;
        recordMessage: (Text, Text, Nat) -> async Result.Result<(), Text>;
        healthCheck: () -> async {
            status: Text;
            totalUsers: Nat;
            totalTransactions: Nat;
        };
    };

    private let authProxy = actor("bd3sg-teaaa-aaaaa-qaaba-cai") : actor {
        validateSession: (Text) -> async Result.Result<Text, Text>;
        createSession: (Text) -> async Result.Result<Text, Text>;
        healthCheck: () -> async {
            status: Text;
            activeSessions: Nat;
        };
    };

    private let dataStorage = actor("br5f7-7uaaa-aaaaa-qaaca-cai") : actor {
        createConversation: (Text, Text, Text) -> async Result.Result<Text, Text>;
        addMessage: (Text, Text, Text, Text) -> async Result.Result<(), Text>;
        healthCheck: () -> async {
            status: Text;
            totalConversations: Nat;
            totalMessages: Nat;
        };
    };
    
    // System upgrade hooks
    system func preupgrade() {
        agentEntries := Iter.toArray(agents.entries());
        userAgentEntries := Iter.toArray(userAgents.entries());
        contextEntries := Iter.toArray(contexts.entries());
        configVersionEntries := Iter.toArray(configVersions.entries());
    };
    
    system func postupgrade() {
        agents := HashMap.fromIter<AgentId, Agent>(agentEntries.vals(), agentEntries.size(), Text.equal, Text.hash);
        userAgents := HashMap.fromIter<UserId, [AgentId]>(userAgentEntries.vals(), userAgentEntries.size(), Principal.equal, Principal.hash);
        contexts := HashMap.fromIter<ContextId, ConversationContext>(contextEntries.vals(), contextEntries.size(), Text.equal, Text.hash);
        configVersions := HashMap.fromIter<AgentId, [AgentConfig]>(configVersionEntries.vals(), configVersionEntries.size(), Text.equal, Text.hash);
        agentEntries := [];
        userAgentEntries := [];
        contextEntries := [];
        configVersionEntries := [];
    };
    
    // Enhanced Helper functions
    private func generateAgentId(): AgentId {
        nextAgentId += 1;
        "agent_" # Nat.toText(nextAgentId)
    };
    
    private func generateVersionId(): VersionId {
        nextVersionId += 1;
        nextVersionId
    };
    
    private func generateContextId(): ContextId {
        nextContextId += 1;
        "ctx_" # Nat.toText(nextContextId)
    };
    
    private func addToUserAgents(userId: UserId, agentId: AgentId) {
        switch (userAgents.get(userId)) {
            case (?existing) {
                userAgents.put(userId, Array.append(existing, [agentId]));
            };
            case null {
                userAgents.put(userId, [agentId]);
            };
        }
    };
    
    // Configuration Validation Functions
    private func validatePersonalityConfig(config: PersonalityConfig): [Text] {
        var errors: [Text] = [];
        
        if (Text.size(config.tone) == 0) {
            errors := Array.append(errors, ["Personality tone cannot be empty"]);
        };
        
        if (Text.size(config.style) == 0) {
            errors := Array.append(errors, ["Personality style cannot be empty"]);
        };
        
        if (config.traits.size() == 0) {
            errors := Array.append(errors, ["At least one personality trait must be specified"]);
        };
        
        errors
    };
    
    private func validateBehaviorConfig(config: BehaviorConfig): [Text] {
        var errors: [Text] = [];
        
        if (config.temperature < 0.0 or config.temperature > 2.0) {
            errors := Array.append(errors, ["Temperature must be between 0.0 and 2.0"]);
        };
        
        if (config.topP < 0.0 or config.topP > 1.0) {
            errors := Array.append(errors, ["TopP must be between 0.0 and 1.0"]);
        };
        
        if (config.creativity < 0.0 or config.creativity > 1.0) {
            errors := Array.append(errors, ["Creativity must be between 0.0 and 1.0"]);
        };
        
        if (config.maxTokens == 0 or config.maxTokens > 4096) {
            errors := Array.append(errors, ["MaxTokens must be between 1 and 4096"]);
        };
        
        if (config.contextWindow > 100) {
            errors := Array.append(errors, ["ContextWindow cannot exceed 100 messages"]);
        };
        
        errors
    };
    
    private func validateKnowledgeBase(knowledgeBase: [KnowledgeSource]): [Text] {
        var errors: [Text] = [];
        
        if (knowledgeBase.size() > 50) {
            errors := Array.append(errors, ["Knowledge base cannot have more than 50 sources"]);
        };
        
        for (source in knowledgeBase.vals()) {
            if (Text.size(source.content) == 0) {
                errors := Array.append(errors, ["Knowledge source content cannot be empty"]);
            };
            
            if (source.priority < 1 or source.priority > 10) {
                errors := Array.append(errors, ["Knowledge source priority must be between 1 and 10"]);
            };
        };
        
        errors
    };
    
    private func calculateConfigScore(config: AgentConfig): Float {
        var score: Float = 0.0;
        let maxScore: Float = 100.0;
        
        // Personality completeness (30 points)
        if (Text.size(config.personality.tone) > 0) score += 10.0;
        if (Text.size(config.personality.style) > 0) score += 10.0;
        if (config.personality.traits.size() > 0) score += 10.0;
        
        // Knowledge base quality (25 points)
        if (config.knowledgeBase.size() > 0) score += 15.0;
        if (config.knowledgeBase.size() >= 3) score += 10.0;
        
        // Behavior configuration completeness (25 points)
        if (config.behavior.temperature >= 0.1 and config.behavior.temperature <= 1.5) score += 15.0;
        if (config.behavior.maxTokens > 0 and config.behavior.maxTokens <= 2048) score += 10.0;
        
        // Integration settings (20 points)
        if (config.integrationSettings.allowedOrigins.size() > 0) score += 10.0;
        if (config.integrationSettings.rateLimiting.enabled) score += 10.0;
        
        score / maxScore
    };
    
    // ============================================================================
    // PUBLIC API FUNCTIONS
    // ============================================================================

    /**
     * Creates a new agent with advanced configuration and validation
     * 
     * This function creates a new AI agent with comprehensive configuration
     * including personality, behavior, knowledge base, and integration settings.
     * The configuration is validated before creation to ensure quality.
     * 
     * @param request - The agent creation request containing all configuration
     * @returns Result containing the new agent ID or validation error
     * 
     * @example
     * ```motoko
     * let result = await createAgentAdvanced({
     *   name = "Customer Support Bot";
     *   description = "AI assistant for customer support";
     *   category = "Support";
     *   tags = ["support", "customer-service"];
     *   config = agentConfig;
     *   isPublic = true;
     * });
     * ```
     */
    public shared(msg) func createAgentAdvanced(request: CreateAgentRequest): async Result.Result<AgentId, Error> {
        let caller = msg.caller;
        
        // Validate configuration
        let validation = await validateAgentConfiguration(request.config);
        if (not validation.isValid) {
            return #err(#ValidationError("Configuration validation failed: " # Text.join(", ", validation.errors.vals())));
        };
        
        let agentId = generateAgentId();
        let now = Time.now();
        let versionId = generateVersionId();
        
        // Create config with version
        let versionedConfig: AgentConfig = {
            request.config with version = versionId;
        };
        
        let agent: Agent = {
            id = agentId;
            name = request.name;
            description = request.description;
            category = request.category;
            tags = request.tags;
            ownerId = caller;
            config = versionedConfig;
            status = #Active;
            created = now;
            updated = now;
            lastUsed = null;
            configHistory = [versionedConfig];
            analytics = {
                totalConversations = 0;
                totalMessages = 0;
                averageRating = null;
                totalTokensUsed = 0;
            };
            permissions = {
                isPublic = request.isPublic;
                allowedUsers = [];
                accessLevel = #Owner;
            };
        };
        
        agents.put(agentId, agent);
        addToUserAgents(caller, agentId);
        configVersions.put(agentId, [versionedConfig]);
        
        #ok(agentId)
    };

    /**
     * Validates agent configuration for quality and completeness
     * 
     * Performs comprehensive validation of agent configuration including
     * personality settings, behavior parameters, knowledge base, and
     * integration settings. Returns detailed feedback with errors,
     * warnings, and a quality score.
     * 
     * @param config - The agent configuration to validate
     * @returns Validation result with errors, warnings, and quality score
     * 
     * @example
     * ```motoko
     * let validation = await validateAgentConfiguration(agentConfig);
     * if (validation.isValid) {
     *   // Configuration is valid
     * } else {
     *   // Handle validation errors
     *   for (error in validation.errors.vals()) {
     *     // Process each error
     *   };
     * };
     * ```
     */
    public func validateAgentConfiguration(config: AgentConfig): async ValidationResult {
        var allErrors: [Text] = [];
        var allWarnings: [Text] = [];
        
        // Validate personality
        let personalityErrors = validatePersonalityConfig(config.personality);
        allErrors := Array.append(allErrors, personalityErrors);
        
        // Validate behavior
        let behaviorErrors = validateBehaviorConfig(config.behavior);
        allErrors := Array.append(allErrors, behaviorErrors);
        
        // Validate knowledge base
        let knowledgeErrors = validateKnowledgeBase(config.knowledgeBase);
        allErrors := Array.append(allErrors, knowledgeErrors);
        
        // Generate warnings
        if (config.knowledgeBase.size() == 0) {
            allWarnings := Array.append(allWarnings, ["Agent has no knowledge base - responses may be generic"]);
        };
        
        if (config.behavior.temperature > 1.2) {
            allWarnings := Array.append(allWarnings, ["High temperature may result in inconsistent responses"]);
        };
        
        if (config.contextSettings.maxContextMessages > 50) {
            allWarnings := Array.append(allWarnings, ["Large context window may impact performance"]);
        };
        
        let score = calculateConfigScore(config);
        
        {
            isValid = allErrors.size() == 0;
            errors = allErrors;
            warnings = allWarnings;
            score = score;
        }
    };

    // ============================================================================
    // CONTEXT MANAGEMENT FUNCTIONS
    // ============================================================================

    /**
     * Creates a new conversation context for an agent
     * 
     * Creates a conversation context that maintains chat history and
     * conversation state for a specific user-agent interaction.
     * The context is used to provide continuity in conversations.
     * 
     * @param agentId - The ID of the agent to create context for
     * @returns Result containing the new context ID or error
     * 
     * @example
     * ```motoko
     * let contextResult = await createConversationContext("agent_123");
     * switch (contextResult) {
     *   case (#ok(contextId)) {
     *     // Use contextId for conversation
     *   };
     *   case (#err(error)) {
     *     // Handle error
     *   };
     * };
     * ```
     */
    public shared(msg) func createConversationContext(agentId: AgentId): async Result.Result<ContextId, Error> {
        let caller = msg.caller;
        
        // Verify agent exists and user has access
        switch (agents.get(agentId)) {
            case (null) { return #err(#NotFound); };
            case (?agent) {
                if (agent.ownerId != caller and not agent.permissions.isPublic) {
                    return #err(#Unauthorized);
                };
                
                let contextId = generateContextId();
                let now = Time.now();
                
                let context: ConversationContext = {
                    contextId = contextId;
                    agentId = agentId;
                    userId = caller;
                    messages = [];
                    metadata = [];
                    created = now;
                    lastAccessed = now;
                    maxSize = agent.config.contextSettings.maxContextMessages;
                    compressionEnabled = agent.config.contextSettings.enableMemory;
                };
                
                contexts.put(contextId, context);
                #ok(contextId)
            };
        }
    };

    /**
     * Adds a message to a conversation context
     * 
     * Adds a new message to the conversation context, maintaining
     * the conversation history. The context is automatically trimmed
     * if it exceeds the maximum size limit.
     * 
     * @param contextId - The context ID to add the message to
     * @param role - The role of the message sender (User, Assistant, System)
     * @param content - The message content
     * @returns Result indicating success or error
     * 
     * @example
     * ```motoko
     * let result = await addContextMessage(
     *   contextId,
     *   #User,
     *   "Hello, how can you help me?"
     * );
     * ```
     */
    public shared(msg) func addContextMessage(
        contextId: ContextId, 
        role: {#User; #Assistant; #System}, 
        content: Text
    ): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) {
                if (context.userId != caller) {
                    return #err(#Unauthorized);
                };
                
                let now = Time.now();
                let newMessage: ContextMessage = {
                    role = role;
                    content = content;
                    timestamp = now;
                    metadata = [];
                    tokenCount = null;
                };
                
                var updatedMessages = context.messages;
                
                // Add new message
                updatedMessages := Array.append(updatedMessages, [newMessage]);
                
                // Trim context if exceeds max size
                if (updatedMessages.size() > context.maxSize) {
                    let startIdx = if (updatedMessages.size() >= context.maxSize) {
                        updatedMessages.size() - context.maxSize
                    } else {
                        0
                    };
                    let actualSize = Nat.min(context.maxSize, updatedMessages.size());
                    updatedMessages := Array.tabulate<ContextMessage>(actualSize, func(i) {
                        let accessIndex = if (startIdx + i < updatedMessages.size()) {
                            startIdx + i
                        } else {
                            if (updatedMessages.size() > 0) {
                                updatedMessages.size() - 1
                            } else {
                                0
                            }
                        };
                        updatedMessages[accessIndex]
                    });
                };
                
                let updatedContext: ConversationContext = {
                    context with 
                    messages = updatedMessages;
                    lastAccessed = now;
                };
                
                contexts.put(contextId, updatedContext);
                #ok(())
            };
        }
    };
    
    public query func getConversationContext(contextId: ContextId): async Result.Result<ConversationContext, Error> {
        switch (contexts.get(contextId)) {
            case (null) { #err(#NotFound) };
            case (?context) { #ok(context) };
        }
    };
    
    // Enhanced Agent Management
    public shared(msg) func updateAgentAdvanced(
        agentId: AgentId, 
        config: AgentConfig,
        updateDescription: ?Text
    ): async Result.Result<VersionId, Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                // Validate new configuration
                let validation = await validateAgentConfiguration(config);
                if (not validation.isValid) {
                    return #err(#ValidationError("Configuration validation failed: " # Text.join(", ", validation.errors.vals())));
                };
                
                let versionId = generateVersionId();
                let versionedConfig: AgentConfig = {
                    config with version = versionId;
                };
                
                let updatedAgent: Agent = {
                    agent with 
                    config = versionedConfig;
                    description = Option.get(updateDescription, agent.description);
                    updated = Time.now();
                    configHistory = Array.append(agent.configHistory, [versionedConfig]);
                };
                
                agents.put(agentId, updatedAgent);
                
                // Update version history
                switch (configVersions.get(agentId)) {
                    case (?versions) {
                        configVersions.put(agentId, Array.append(versions, [versionedConfig]));
                    };
                    case null {
                        configVersions.put(agentId, [versionedConfig]);
                    };
                };
                
                #ok(versionId)
            };
            case null { #err(#NotFound) };
        }
    };
    
    public query func getAgentConfigHistory(agentId: AgentId): async Result.Result<[AgentConfig], Error> {
        switch (configVersions.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?versions) { #ok(versions) };
        }
    };
    
    public shared(msg) func revertAgentConfig(agentId: AgentId, versionId: VersionId): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                // Find the specified version
                switch (configVersions.get(agentId)) {
                    case (null) { #err(#NotFound) };
                    case (?versions) {
                        let targetConfig = Array.find<AgentConfig>(versions, func(config) = config.version == versionId);
                        switch (targetConfig) {
                            case (null) { #err(#NotFound) };
                            case (?config) {
                                let updatedAgent: Agent = {
                                    agent with 
                                    config = config;
                                    updated = Time.now();
                                };
                                
                                agents.put(agentId, updatedAgent);
                                #ok(())
                            };
                        }
                    };
                }
            };
        }
    };
    
    // Analytics and Metrics
    public shared(msg) func updateAgentAnalytics(
        agentId: AgentId,
        conversationIncrement: Nat,
        messageIncrement: Nat,
        tokensUsed: Nat
    ): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                let updatedAnalytics = {
                    totalConversations = agent.analytics.totalConversations + conversationIncrement;
                    totalMessages = agent.analytics.totalMessages + messageIncrement;
                    averageRating = agent.analytics.averageRating; // TODO: Implement rating system
                    totalTokensUsed = agent.analytics.totalTokensUsed + tokensUsed;
                };
                
                let updatedAgent: Agent = {
                    agent with 
                    analytics = updatedAnalytics;
                    lastUsed = ?Time.now();
                };
                
                agents.put(agentId, updatedAgent);
                #ok(())
            };
        }
    };
    
    public query func getAgentAnalytics(agentId: AgentId): async Result.Result<{
        totalConversations: Nat;
        totalMessages: Nat;
        averageRating: ?Float;
        totalTokensUsed: Nat;
    }, Error> {
        switch (agents.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?agent) { #ok(agent.analytics) };
        }
    };

    // Get conversation history for an agent (for analytics and review)
    public query func getAgentConversationHistory(agentId: AgentId, limit: ?Nat): async Result.Result<[{
        contextId: ContextId;
        messageCount: Nat;
        created: Int;
        lastAccessed: Int;
    }], Error> {
        let maxResults = Option.get(limit, 10);
        let agentContexts = Buffer.Buffer<{
            contextId: ContextId;
            messageCount: Nat;
            created: Int;
            lastAccessed: Int;
        }>(0);
        
        // Find all contexts for this agent
        for ((contextId, context) in contexts.entries()) {
            if (context.agentId == agentId and agentContexts.size() < maxResults) {
                agentContexts.add({
                    contextId = contextId;
                    messageCount = context.messages.size();
                    created = context.created;
                    lastAccessed = context.lastAccessed;
                });
            };
        };
        
        #ok(Buffer.toArray(agentContexts))
    };

    // Public API functions
    public shared(msg) func createAgent(request: CreateAgentRequest): async Result.Result<AgentId, Error> {
        let caller = msg.caller;
        let agentId = generateAgentId();
        let now = Time.now();
        
        let agent: Agent = {
            id = agentId;
            name = request.name;
            description = request.description;
            category = request.category;
            tags = request.tags;
            ownerId = caller;
            config = request.config;
            status = #Active;
            created = now;
            updated = now;
            lastUsed = null;
            configHistory = [request.config];
            analytics = {
                totalConversations = 0;
                totalMessages = 0;
                averageRating = null;
                totalTokensUsed = 0;
            };
            permissions = {
                isPublic = request.isPublic;
                allowedUsers = [];
                accessLevel = #Owner;
            };
        };
        
        agents.put(agentId, agent);
        addToUserAgents(caller, agentId);
        
        #ok(agentId)
    };
    
    public query func getAgent(agentId: AgentId): async Result.Result<Agent, Error> {
        switch (agents.get(agentId)) {
            case (?agent) { #ok(agent) };
            case null { #err(#NotFound) };
        }
    };
    
    public shared(msg) func updateAgent(agentId: AgentId, config: AgentConfig): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                let updatedAgent: Agent = {
                    agent with 
                    config = config;
                    updated = Time.now();
                    configHistory = Array.append(agent.configHistory, [config]);
                };
                
                agents.put(agentId, updatedAgent);
                #ok(())
            };
            case null { #err(#NotFound) };
        }
    };
    
    public shared(msg) func updateAgentStatus(agentId: AgentId, status: AgentStatus): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                let updatedAgent: Agent = {
                    agent with 
                    status = status;
                    updated = Time.now();
                };
                
                agents.put(agentId, updatedAgent);
                #ok(())
            };
            case null { #err(#NotFound) };
        }
    };
    
    public query func getUserAgents(userId: UserId): async [Agent] {
        switch (userAgents.get(userId)) {
            case (?agentIds) {
                Array.mapFilter<AgentId, Agent>(agentIds, func(id: AgentId): ?Agent {
                    agents.get(id)
                })
            };
            case null { [] };
        }
    };
    
    public shared(msg) func deleteAgent(agentId: AgentId): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                agents.delete(agentId);
                // TODO: Remove from userAgents array
                #ok(())
            };
            case null { #err(#NotFound) };
        }
    };
    
    // Test function for development
    public func test(): async Text {
        "AgentManager canister is running!"
    };

    // Enhanced agent creation with inter-canister integration  
    public shared(msg) func createAgentIntegrated(_sessionToken: Text, request: CreateAgentRequest): async Result.Result<Text, Text> {
        // For now, use the caller from msg context instead of session validation
        // TODO: Implement proper session validation when AuthProxy is ready
        let caller = msg.caller;
        let agentId = generateAgentId();
        let now = Time.now();
        
        let agent: Agent = {
            id = agentId;
            name = request.name;
            description = request.description;
            category = request.category;
            tags = request.tags;
            ownerId = caller;
            config = request.config;
            status = #Active;
            created = now;
            updated = now;
            lastUsed = null;
            configHistory = [request.config];
            analytics = {
                totalConversations = 0;
                totalMessages = 0;
                averageRating = null;
                totalTokensUsed = 0;
            };
            permissions = {
                isPublic = request.isPublic;
                allowedUsers = [];
                accessLevel = #Owner;
            };
        };
        
        agents.put(agentId, agent);
        addToUserAgents(caller, agentId);
        
        #ok(agentId)
    };

    // Public chat processing for embed widgets and public access
    // This method allows anonymous users to chat with public agents
    public func processAgentChatPublic(
        agentId: AgentId,
        userMessage: Text
    ) : async Result.Result<{
        response: Text;
        confidence: Float;
        tokensUsed: Nat;
        contextId: ContextId;
        processingTime: Nat;
    }, Error> {
        let startTime = Time.now();
        
        // Get agent without authentication check
        switch (agents.get(agentId)) {
            case (null) { return #err(#NotFound); };
            case (?agent) {
                // Check if agent is public and active
                if (not agent.permissions.isPublic) {
                    return #err(#Unauthorized);
                };
                
                // Check if agent is active - if not, return a friendly response
                switch (agent.status) {
                    case (#Active) { /* Agent is active, continue */ };
                    case (#Inactive) { 
                        return #ok({
                            response = "Hi there! I'm " # agent.name # " 👋 I'm currently taking a break and not available for conversations right now. Please try again later! 😊";
                            confidence = 1.0;
                            tokensUsed = 25;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                    case (#Suspended) { 
                        return #ok({
                            response = "Hello! I'm " # agent.name # " 🤖 I'm currently suspended and unable to respond to messages. Please contact my administrator for assistance. Thank you for your understanding! 🙏";
                            confidence = 1.0;
                            tokensUsed = 30;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                    case (#Archived) { 
                        return #ok({
                            response = "Greetings! I'm " # agent.name # " 📚 I've been archived and am no longer actively responding to conversations. If you need assistance, please check with my creator about reactivating me or using a different agent. Take care! 👋";
                            confidence = 1.0;
                            tokensUsed = 35;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                };
                
                // For public access, create a temporary context (no persistence for anonymous users)
                let publicContextId = generateContextId();
                
                // Build basic prompt with agent personality (simplified for public access)
                let prompt = buildPublicPrompt(agent, userMessage);
                
                // Process with LLM
                try {
                    let llmResponse = await llmProcessor.processMessage({
                        agentId = agentId;
                        conversationId = publicContextId;
                        userMessage = prompt;
                        agentPersonality = null;
                        systemPrompt = null;
                        context = null;
                        temperature = ?agent.config.behavior.temperature;
                        maxTokens = null;
                        routingStrategy = null;
                        enableStreaming = null;
                    });
                    switch (llmResponse) {
                        case (#ok(response)) {
                            // Update agent analytics (without user-specific tracking)
                            ignore updateAgentAnalytics(agentId, 0, 2, response.tokens);
                            
                            let processingTime = Int.abs(Time.now() - startTime) / 1_000_000; // milliseconds
                            
                            #ok({
                                response = response.agentResponse;
                                confidence = response.confidence;
                                tokensUsed = response.tokens;
                                contextId = publicContextId;
                                processingTime = processingTime;
                            })
                        };
                        case (#err(_)) {
                            // Fallback to a basic response if LLM fails
                            let fallbackResponse = "Hello! I'm " # agent.name # ". " # agent.description # " I received your message: \"" # userMessage # "\". I'm here to help! (Note: I'm currently running in demonstration mode)";
                            
                            let processingTime = Int.abs(Time.now() - startTime) / 1_000_000;
                            
                            #ok({
                                response = fallbackResponse;
                                confidence = 0.8;
                                tokensUsed = estimateTokens(fallbackResponse);
                                contextId = publicContextId;
                                processingTime = processingTime;
                            })
                        };
                    }
                } catch (_e) {
                    // Fallback response for any errors
                    let fallbackResponse = "Hello! I'm " # agent.name # ". Thanks for your message: \"" # userMessage # "\". I'm experiencing some technical difficulties right now, but I'm here to help! Please try again in a moment.";
                    
                    let processingTime = Int.abs(Time.now() - startTime) / 1_000_000;
                    
                    #ok({
                        response = fallbackResponse;
                        confidence = 0.5;
                        tokensUsed = estimateTokens(fallbackResponse);
                        contextId = publicContextId;
                        processingTime = processingTime;
                    })
                }
            };
        }
    };
    
    // Build a simplified prompt for public access
    private func buildPublicPrompt(agent: Agent, userMessage: Text): Text {
        let prompt = Buffer.Buffer<Text>(0);
        
        // Basic system prompt with agent personality
        prompt.add("You are " # agent.name # ", " # agent.description # "\n");
        prompt.add("Personality: " # agent.config.personality.tone # " and " # agent.config.personality.style # "\n");
        prompt.add("Traits: " # Text.join(", ", agent.config.personality.traits.vals()) # "\n");
        
        // Add response style
        prompt.add("Response style: " # (switch (agent.config.behavior.responseLength) {
            case (#Short) { "concise" };
            case (#Medium) { "moderate" };
            case (#Long) { "detailed" };
            case (#Variable) { "adaptive" };
        }) # "\n\n");
        
        // Add knowledge base context if available (limited for public access)
        if (agent.config.knowledgeBase.size() > 0) {
            prompt.add("Relevant knowledge:\n");
            var count = 0;
            for (source in agent.config.knowledgeBase.vals()) {
                if (source.isActive and count < 3) { // Limit to 3 sources for public access
                    prompt.add("- " # source.content # "\n");
                    count += 1;
                };
            };
            prompt.add("\n");
        };
        
        prompt.add("User message: " # userMessage # "\n");
        prompt.add("Respond as " # agent.name # " with the specified personality:");
        
        Text.join("", prompt.vals())
    };

    // Enhanced chat processing with end-to-end integration
    public shared(msg) func processAgentChat(
        _sessionToken: Text,
        agentId: Text,
        userMessage: Text
    ) : async Result.Result<Text, Text> {
        // TODO: Implement full session validation and inter-canister calls
        // For now, return a mock response to test the interface
        let caller = msg.caller;
        let _userIdText = Principal.toText(caller);
        
        // Get agent
        switch (agents.get(agentId)) {
            case (null) { return #err("Agent not found"); };
            case (?agent) {
                // Check user has access to agent
                if (agent.ownerId != caller) {
                    return #err("Access denied");
                };
                
                // Check if agent is active - if not, return a friendly mock response
                switch (agent.status) {
                    case (#Active) { /* Agent is active, continue */ };
                    case (#Inactive) { 
                        return #ok("Hi there! I'm " # agent.name # " 👋 I'm currently taking a break and not available for conversations right now. Please ask my creator to activate me, and I'll be right back to help you! 😊");
                    };
                    case (#Suspended) { 
                        return #ok("Hello! I'm " # agent.name # " 🤖 I'm currently suspended and unable to respond to messages. Please contact my administrator for assistance. Thank you for your understanding! 🙏");
                    };
                    case (#Archived) { 
                        return #ok("Greetings! I'm " # agent.name # " 📚 I've been archived and am no longer actively responding to conversations. If you need assistance, please check with my creator about reactivating me or using a different agent. Take care! 👋");
                    };
                };
                
                // Mock response for testing
                let response = "Hello! I'm " # agent.name # ". I received your message: \"" # userMessage # "\". This is a test response from the integrated system.";
                #ok(response)
            };
        }
    };

    // Get agent with authorization check
    public shared(msg) func getAgentAuthorized(_sessionToken: Text, agentId: Text) : async Result.Result<Agent, Text> {
        // TODO: Implement session validation, for now use caller
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (null) { #err("Agent not found"); };
            case (?agent) {
                if (agent.ownerId == caller) {
                    #ok(agent)
                } else {
                    #err("Access denied")
                }
            };
        }
    };

    // Get user's agents with session validation
    public shared(msg) func getUserAgentsAuthorized(_sessionToken: Text): async Result.Result<[Agent], Text> {
        // TODO: Implement session validation, for now use caller
        let caller = msg.caller;
        
        switch (userAgents.get(caller)) {
            case (null) { #ok([]); };
            case (?agentIds) {
                let userAgentsList = Array.mapFilter<Text, Agent>(agentIds, func(id) = agents.get(id));
                #ok(userAgentsList)
            };
        }
    };

    // Comprehensive health check with inter-canister connectivity
    public func healthCheck() : async {status: Text; services: [Text]} {
        var services: [Text] = [];
        
        // Always add AgentManager status first
        services := Array.append(services, ["AgentManager: OK"]);
        
        // Test LLM Processor
        try {
            let llmHealth = await llmProcessor.healthCheck();
            if (Text.contains(llmHealth.status, #text("operational"))) {
                services := Array.append(services, ["LLMProcessor: OK"]);
            } else {
                services := Array.append(services, ["LLMProcessor: DEGRADED"]);
            };
        } catch (_e) {
            services := Array.append(services, ["LLMProcessor: ERROR"]);
        };
        
        // Context Manager is built into Agent Manager
        services := Array.append(services, ["ContextManager: OK"]);
        
        // Test Metrics Collector
        try {
            let metricsHealth = await metricsCollector.healthCheck();
            if (Text.contains(metricsHealth.status, #text("operational"))) {
                services := Array.append(services, ["MetricsCollector: OK"]);
            } else {
                services := Array.append(services, ["MetricsCollector: DEGRADED"]);
            };
        } catch (_e) {
            services := Array.append(services, ["MetricsCollector: ERROR"]);
        };
        
        // Test Auth Proxy
        try {
            let authHealth = await authProxy.healthCheck();
            if (Text.contains(authHealth.status, #text("operational"))) {
                services := Array.append(services, ["AuthProxy: OK"]);
            } else {
                services := Array.append(services, ["AuthProxy: DEGRADED"]);
            };
        } catch (_e) {
            services := Array.append(services, ["AuthProxy: ERROR"]);
        };
        
        // Test Data Storage
        try {
            let storageHealth = await dataStorage.healthCheck();
            if (Text.contains(storageHealth.status, #text("operational"))) {
                services := Array.append(services, ["DataStorage: OK"]);
            } else {
                services := Array.append(services, ["DataStorage: DEGRADED"]);
            };
        } catch (_e) {
            services := Array.append(services, ["DataStorage: ERROR"]);
        };
        
        // Determine overall system status
        let errorCount = Array.foldLeft<Text, Nat>(services, 0, func(acc, service) {
            if (Text.contains(service, #text("ERROR"))) { acc + 1 } else { acc }
        });
        
        let degradedCount = Array.foldLeft<Text, Nat>(services, 0, func(acc, service) {
            if (Text.contains(service, #text("DEGRADED"))) { acc + 1 } else { acc }
        });
        
        let overallStatus = if (errorCount > 0) {
            "System partially operational - " # Nat.toText(errorCount) # " services down"
        } else if (degradedCount > 0) {
            "System operational with degraded performance - " # Nat.toText(degradedCount) # " services degraded"
        } else {
            "All systems operational"
        };
        
        {
            status = overallStatus;
            services = services;
        }
    };

    // Enhanced Chat Processing with Advanced Context Management
    public shared(msg) func processAgentChatAdvanced(
        agentId: AgentId,
        userMessage: Text,
        contextId: ?ContextId,
        _enableMemory: ?Bool,
        temperature: ?Float
    ): async Result.Result<{
        response: Text;
        confidence: Float;
        tokensUsed: Nat;
        contextId: ContextId;
        processingTime: Nat;
    }, Error> {
        let caller = msg.caller;
        let startTime = Time.now();
        
        // Get agent and verify access
        switch (agents.get(agentId)) {
            case (null) { return #err(#NotFound); };
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                // Check if agent is active - if not, return a friendly mock response
                switch (agent.status) {
                    case (#Active) { /* Agent is active, continue */ };
                    case (#Inactive) { 
                        return #ok({
                            response = "Hi there! I'm " # agent.name # " 👋 I'm currently taking a break and not available for conversations right now. Please ask my creator to activate me, and I'll be right back to help you! 😊";
                            confidence = 1.0;
                            tokensUsed = 25;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                    case (#Suspended) { 
                        return #ok({
                            response = "Hello! I'm " # agent.name # " 🤖 I'm currently suspended and unable to respond to messages. Please contact my administrator for assistance. Thank you for your understanding! 🙏";
                            confidence = 1.0;
                            tokensUsed = 30;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                    case (#Archived) { 
                        return #ok({
                            response = "Greetings! I'm " # agent.name # " 📚 I've been archived and am no longer actively responding to conversations. If you need assistance, please check with my creator about reactivating me or using a different agent. Take care! 👋";
                            confidence = 1.0;
                            tokensUsed = 35;
                            contextId = generateContextId();
                            processingTime = 100;
                        });
                    };
                };
                
                // Create or get context
                let useContextId = switch (contextId) {
                    case (?existingContextId) { existingContextId };
                    case null { generateContextId() };
                };
                
                // Get or create context
                let context = switch (contexts.get(useContextId)) {
                    case (?existingContext) { 
                        // Update last accessed
                        let updatedContext = {
                            existingContext with lastAccessed = Time.now();
                        };
                        contexts.put(useContextId, updatedContext);
                        updatedContext
                    };
                    case null {
                        let newContext: ConversationContext = {
                            contextId = useContextId;
                            agentId = agentId;
                            userId = caller;
                            messages = [];
                            metadata = [];
                            created = Time.now();
                            lastAccessed = Time.now();
                            maxSize = agent.config.contextSettings.maxContextMessages;
                            compressionEnabled = agent.config.contextSettings.enableMemory;
                        };
                        contexts.put(useContextId, newContext);
                        // Increment conversation count for new contexts
                        ignore updateAgentAnalytics(agentId, 1, 0, 0);
                        newContext
                    };
                };
                
                // Add user message to context
                let userContextMessage: ContextMessage = {
                    role = #User;
                    content = userMessage;
                    timestamp = Time.now();
                    metadata = [];
                    tokenCount = ?estimateTokens(userMessage);
                };
                
                let updatedMessages = Array.append(context.messages, [userContextMessage]);
                
                // Compress context if needed
                let finalMessages = if (updatedMessages.size() > context.maxSize) {
                    compressContextMessages(updatedMessages, context.maxSize)
                } else {
                    updatedMessages
                };
                
                // Build enhanced prompt with agent personality and context
                let prompt = buildEnhancedPrompt(agent, userMessage, finalMessages, temperature);
                
                // Process with LLM
                try {
                    let llmResponse = await llmProcessor.processMessage({
                        agentId = agentId;
                        conversationId = useContextId;
                        userMessage = prompt;
                        agentPersonality = null;
                        systemPrompt = null;
                        context = null;
                        temperature = temperature;
                        maxTokens = null;
                        routingStrategy = null;
                        enableStreaming = null;
                    });
                    switch (llmResponse) {
                        case (#ok(response)) {
                            // Add agent response to context
                            let agentContextMessage: ContextMessage = {
                                role = #Assistant;
                                content = response.agentResponse;
                                timestamp = Time.now();
                                metadata = [("confidence", Float.toText(response.confidence)), ("model", response.modelUsed), ("provider", response.providerId)];
                                tokenCount = ?response.tokens;
                            };
                            
                            let finalContextMessages = Array.append(finalMessages, [agentContextMessage]);
                            
                            // Update context
                            let updatedContext: ConversationContext = {
                                context with
                                messages = finalContextMessages;
                                lastAccessed = Time.now();
                            };
                            contexts.put(useContextId, updatedContext);
                            
                            // Update agent analytics - count both user message and agent response
                            ignore updateAgentAnalytics(agentId, 0, 2, response.tokens);
                            
                            let processingTime = Int.abs(Time.now() - startTime) / 1_000_000; // milliseconds
                            
                            #ok({
                                response = response.agentResponse;
                                confidence = response.confidence;
                                tokensUsed = response.tokens;
                                contextId = useContextId;
                                processingTime = processingTime;
                            })
                        };
                        case (#err(error)) {
                            let errorMessage = switch (error) {
                                case (#AuthenticationError) { "Authentication failed" };
                                case (#ConfigurationError(msg)) { "Configuration error: " # msg };
                                case (#InvalidInput(msg)) { "Invalid input: " # msg };
                                case (#NetworkError(msg)) { "Network error: " # msg };
                                case (#NoProvidersAvailable) { "No AI providers available" };
                                case (#ProcessingError(msg)) { "Processing error: " # msg };
                                case (#QuotaExceeded) { "Quota exceeded" };
                                case (#RateLimited) { "Rate limited" };
                                case (#ServiceUnavailable) { "Service unavailable" };
                            };
                            #err(#InternalError("LLM processing failed: " # errorMessage))
                        };
                    }
                } catch (_) {
                    #err(#InternalError("Inter-canister call failed"))
                }
            };
        }
    };
    
    // Enhanced prompt building with agent personality
    private func buildEnhancedPrompt(
        agent: Agent, 
        userMessage: Text, 
        contextMessages: [ContextMessage],
        temperature: ?Float
    ): Text {
        let prompt = Buffer.Buffer<Text>(0);
        
        // System prompt with agent personality
        prompt.add("You are " # agent.name # ", " # agent.description # "\n");
        prompt.add("Personality: " # agent.config.personality.tone # " and " # agent.config.personality.style # "\n");
        prompt.add("Traits: " # Text.join(", ", agent.config.personality.traits.vals()) # "\n");
        
        // Add behavior settings
        let temp = Option.get(temperature, agent.config.behavior.temperature);
        prompt.add("Response style: " # (switch (agent.config.behavior.responseLength) {
            case (#Short) { "concise" };
            case (#Medium) { "moderate" };
            case (#Long) { "detailed" };
            case (#Variable) { "adaptive" };
        }) # " with creativity level " # Float.toText(temp) # "\n\n");
        
        // Add knowledge base context if available
        if (agent.config.knowledgeBase.size() > 0) {
            prompt.add("Relevant knowledge:\n");
            for (source in agent.config.knowledgeBase.vals()) {
                if (source.isActive) {
                    prompt.add("- " # source.content # "\n");
                };
            };
            prompt.add("\n");
        };
        
        // Add conversation context
        if (contextMessages.size() > 0) {
            prompt.add("Conversation history:\n");
            for (message in contextMessages.vals()) {
                let role = switch (message.role) {
                    case (#User) { "User" };
                    case (#Assistant) { "Assistant" };
                    case (#System) { "System" };
                };
                prompt.add(role # ": " # message.content # "\n");
            };
            prompt.add("\n");
        };
        
        prompt.add("Current user message: " # userMessage # "\n");
        prompt.add("Respond as " # agent.name # " with the specified personality and knowledge:");
        
        Text.join("", prompt.vals())
    };
    
    // Context compression for memory management
    private func compressContextMessages(messages: [ContextMessage], maxSize: Nat): [ContextMessage] {
        if (messages.size() <= maxSize) {
            return messages;
        };
        
        // Keep the most recent messages and some important earlier ones
        let recentCount = (maxSize * 70) / 100; // 70% recent messages
        let importantCount = if (maxSize >= recentCount) {
            maxSize - recentCount
        } else {
            0
        }; // 30% important messages
        
        let totalMessages = messages.size();
        let recentStartIdx = if (totalMessages >= recentCount) {
            totalMessages - recentCount
        } else {
            0
        };
        let actualRecentCount = Nat.min(recentCount, totalMessages);
        let recentMessages = Array.subArray<ContextMessage>(messages, recentStartIdx, actualRecentCount);
        
        // Select important messages from earlier in conversation
        let earlierEndIdx = if (totalMessages >= recentCount) {
            totalMessages - recentCount
        } else {
            totalMessages
        };
        let actualEarlierEndIdx = Nat.min(earlierEndIdx, messages.size());
        let earlierMessages = Array.subArray<ContextMessage>(messages, 0, actualEarlierEndIdx);
        let actualImportantCount = Nat.min(importantCount, earlierMessages.size());
        let importantMessages = Array.subArray<ContextMessage>(earlierMessages, 0, actualImportantCount);
        
        Array.append(importantMessages, recentMessages)
    };
    
    // Token estimation helper
    private func estimateTokens(text: Text): Nat {
        let chars = Text.size(text);
        (chars + 3) / 4 // Rough estimation: 4 chars per token
    };
    
    // Enhanced context management functions
    public shared(msg) func getAgentContexts(agentId: AgentId): async Result.Result<[ConversationContext], Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                let agentContextsList = Buffer.Buffer<ConversationContext>(0);
                for ((contextId, context) in contexts.entries()) {
                    if (context.agentId == agentId and context.userId == caller) {
                        agentContextsList.add(context);
                    };
                };
                
                #ok(Buffer.toArray(agentContextsList))
            };
        }
    };
    
    public shared(msg) func clearAgentContext(agentId: AgentId, contextId: ContextId): async Result.Result<(), Error> {
        let caller = msg.caller;
        
        switch (agents.get(agentId)) {
            case (null) { #err(#NotFound) };
            case (?agent) {
                if (agent.ownerId != caller) {
                    return #err(#Unauthorized);
                };
                
                switch (contexts.get(contextId)) {
                    case (null) { #err(#NotFound) };
                    case (?context) {
                        if (context.userId == caller and context.agentId == agentId) {
                            contexts.delete(contextId);
                            #ok(())
                        } else {
                            #err(#Unauthorized)
                        }
                    };
                }
            };
        }
    };
    
    // Enhanced agent creation with default context settings
    public shared(msg) func createAgentWithContextSettings(
        request: CreateAgentRequest,
        contextSettings: {
            enableMemory: Bool;
            memoryDuration: Nat;
            maxContextMessages: Nat;
            enableLearning: Bool;
        }
    ): async Result.Result<AgentId, Error> {
        let caller = msg.caller;
        
        // Validate configuration
        let validation = await validateAgentConfiguration(request.config);
        if (not validation.isValid) {
            return #err(#ValidationError("Configuration validation failed: " # Text.join(", ", validation.errors.vals())));
        };
        
        let agentId = generateAgentId();
        let now = Time.now();
        let versionId = generateVersionId();
        
        // Create enhanced config with context settings
        let enhancedConfig: AgentConfig = {
            request.config with 
            version = versionId;
            contextSettings = contextSettings;
        };
        
        let agent: Agent = {
            id = agentId;
            name = request.name;
            description = request.description;
            category = request.category;
            tags = request.tags;
            ownerId = caller;
            config = enhancedConfig;
            status = #Active;
            created = now;
            updated = now;
            lastUsed = null;
            configHistory = [enhancedConfig];
            analytics = {
                totalConversations = 0;
                totalMessages = 0;
                averageRating = null;
                totalTokensUsed = 0;
            };
            permissions = {
                isPublic = request.isPublic;
                allowedUsers = [];
                accessLevel = #Owner;
            };
        };
        
        agents.put(agentId, agent);
        addToUserAgents(caller, agentId);
        configVersions.put(agentId, [enhancedConfig]);
        
        #ok(agentId)
    };
} 