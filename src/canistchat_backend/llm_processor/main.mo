import LLM "mo:llm";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";

actor LLMProcessor {
    // Types
    public type AgentId = Text;
    public type ConversationId = Text;
    public type MessageId = Text;
    
    public type MessageRole = {
        #User;
        #Agent;
        #System;
    };
    
    public type Message = {
        id: MessageId;
        role: {#User; #Agent; #System};
        content: Text;
        timestamp: Time.Time;
        tokens: Nat;
        metadata: [(Text, Text)];
    };
    
    public type ProcessMessageRequest = {
        agentId: AgentId;
        conversationId: ConversationId;
        userMessage: Text;
        agentPersonality: ?Text;
        systemPrompt: ?Text;
        context: ?[Message]; // Previous conversation context
        temperature: ?Float;
        maxTokens: ?Nat;
        routingStrategy: ?Text;
        enableStreaming: ?Bool;
    };
    
    public type ProcessMessageResponse = {
        messageId: MessageId;
        agentResponse: Text;
        tokens: Nat;
        confidence: Float;
        modelUsed: Text;
        providerId: Text;
        processingTime: Nat;
        cached: Bool;
        metadata: [(Text, Text)];
    };
    
    public type Error = {
        #InvalidInput: Text;
        #ProcessingError: Text;
        #RateLimited;
        #ServiceUnavailable;
    };
    
    // Counter for generating message IDs
    private stable var nextMessageId: Nat = 0;
    
    // Helper function to generate message ID
    private func generateMessageId(): MessageId {
        nextMessageId += 1;
        "msg_" # Nat.toText(nextMessageId);
    };
    
    // Helper function to estimate token count
    private func estimateTokens(text: Text): Nat {
        // Simple token estimation: ~4 characters per token average
        let chars = text.size();
        (chars + 3) / 4;
    };

    // Build chat messages for LLM from request (simplified version)
    private func buildPrompt(request: ProcessMessageRequest): Text {
        var prompt = "";
        
        // Add system prompt if provided
        switch (request.systemPrompt) {
            case (?sysPrompt) { prompt := prompt # "System: " # sysPrompt # "\n\n" };
            case null { };
        };
        
        // Add agent personality if provided
        switch (request.agentPersonality) {
            case (?personality) { prompt := prompt # "Agent Personality: " # personality # "\n\n" };
            case null { };
        };
        
        // Add conversation context if provided
        switch (request.context) {
            case (?contextMessages) {
                for (message in contextMessages.vals()) {
                    let roleText = switch (message.role) {
                        case (#System) { "System" };
                        case (#User) { "User" };
                        case (#Agent) { "Assistant" };
                    };
                    prompt := prompt # roleText # ": " # message.content # "\n";
                };
                prompt := prompt # "\n";
                        };
            case null { };
                    };
        
        // Add current user message
        prompt := prompt # "User: " # request.userMessage # "\nAssistant: ";
        
        prompt
    };

    // Core LLM processing function using DFINITY's LLM canister
    public func processWithLLM(prompt: Text): async Result.Result<Text, Error> {
        try {
            let response = await LLM.prompt(#Llama3_1_8B, prompt);
            #ok(response)
        } catch (_) {
            #err(#ProcessingError("LLM request failed"))
        }
    };

    // Main public API for processing messages
    public func processMessage(request: ProcessMessageRequest): async Result.Result<ProcessMessageResponse, Error> {
        let startTime = Time.now();
        
        // Validate input
        if (Text.size(request.userMessage) == 0) {
            return #err(#InvalidInput("User message cannot be empty"));
        };
        
        if (Text.size(request.userMessage) > 4000) {
            return #err(#InvalidInput("Message too long (max 4000 characters)"));
        };
        
        // Build prompt for LLM
        let prompt = buildPrompt(request);
        
        // Process with LLM
        switch (await processWithLLM(prompt)) {
            case (#ok(response)) {
                let messageId = generateMessageId();
                let inputTokens = estimateTokens(request.userMessage);
                let outputTokens = estimateTokens(response);
                let totalTokens = inputTokens + outputTokens;
                let processingTime = Int.abs(Time.now() - startTime) / 1_000_000; // Convert to milliseconds
                
                #ok({
                    messageId = messageId;
                    agentResponse = response;
                    tokens = totalTokens;
                    confidence = 0.95; // High confidence for DFINITY LLM canister
                    modelUsed = "llama3.1:8b";
                    providerId = "dfinity-llm";
                    processingTime = processingTime;
                    cached = false;
                    metadata = [
                        ("provider", "dfinity-llm"),
                        ("model", "llama3.1:8b"),
                        ("input_tokens", Nat.toText(inputTokens)),
                        ("output_tokens", Nat.toText(outputTokens))
                    ];
                });
            };
            case (#err(error)) {
                #err(error);
            };
        };
    };

    // Simple prompt processing (for backwards compatibility)
    public func processPrompt(prompt: Text): async Result.Result<Text, Error> {
        if (Text.size(prompt) == 0) {
            return #err(#InvalidInput("Prompt cannot be empty"));
        };

        await processWithLLM(prompt)
        };
        
    // Get processor status
    public query func getProcessorStatus(): async {healthy: Bool; version: Text; provider: Text} {
        {
            healthy = true;
            version = "3.0.0-dfinity-llm";
            provider = "dfinity";
        }
        };
        
    // Test function
    public func test(): async Text {
        "LLMProcessor canister is running with DFINITY LLM integration!"
    };

    // Health check with actual LLM test
    public func healthCheck(): async {status: Text; providers: Nat; activeProviders: Nat} {
        try {
            let testResponse = await processPrompt("Hello, respond with 'Health check passed'");
            switch (testResponse) {
                case (#ok(_)) { 
                    {
                        status = "Operational - LLM integration active";
                        providers = 1; // DFINITY LLM
                        activeProviders = 1; // DFINITY LLM is active
                    }
                };
                case (#err(_)) { 
                    {
                        status = "Error - LLM integration failed";
                        providers = 1;
                        activeProviders = 0;
                    }
                };
            }
        } catch (_) {
        {
                status = "Error - Health check failed";
                providers = 1;
                activeProviders = 0;
            }
        }
    };
};