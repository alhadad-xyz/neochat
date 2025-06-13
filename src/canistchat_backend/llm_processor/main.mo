import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

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
        role: MessageRole;
        content: Text;
        timestamp: Time.Time;
        tokens: Nat;
    };
    
    public type ProcessMessageRequest = {
        agentId: AgentId;
        conversationId: ConversationId;
        userMessage: Text;
        context: ?[Message]; // Previous conversation context
    };
    
    public type ProcessMessageResponse = {
        messageId: MessageId;
        agentResponse: Text;
        tokens: Nat;
        confidence: Float;
    };
    
    public type Error = {
        #InvalidInput: Text;
        #ProcessingError: Text;
        #RateLimited;
        #ServiceUnavailable;
    };
    
    // Counter for generating message IDs
    private stable var nextMessageId: Nat = 0;
    
    // Helper functions
    private func generateMessageId(): MessageId {
        nextMessageId += 1;
        "msg_" # Nat.toText(nextMessageId);
    };
    
    private func estimateTokens(text: Text): Nat {
        // Simple token estimation: ~4 characters per token average
        let chars = text.size();
        (chars + 3) / 4;
    };
    
    // Core LLM processing function (placeholder for actual LLM integration)
    private func processWithLLM(prompt: Text, context: ?[Message]): async Result.Result<Text, Error> {
        // TODO: Integrate with actual LLM canister/service
        // For now, return a simple response based on input
        
        if (Text.size(prompt) == 0) {
            return #err(#InvalidInput("Empty prompt"));
        };
        
        // Simple response generation (placeholder)
        let response = "Thank you for your message: \"" # prompt # "\". I'm here to help! This is a placeholder response from the LLM processor.";
        
        #ok(response);
    };
    
    // Public API
    public func processMessage(request: ProcessMessageRequest): async Result.Result<ProcessMessageResponse, Error> {
        // Validate input
        if (Text.size(request.userMessage) == 0) {
            return #err(#InvalidInput("User message cannot be empty"));
        };
        
        if (Text.size(request.userMessage) > 4000) {
            return #err(#InvalidInput("Message too long (max 4000 characters)"));
        };
        
        // Process the message with LLM
        switch (await processWithLLM(request.userMessage, request.context)) {
            case (#ok(response)) {
                let messageId = generateMessageId();
                let tokens = estimateTokens(request.userMessage) + estimateTokens(response);
                
                #ok({
                    messageId = messageId;
                    agentResponse = response;
                    tokens = tokens;
                    confidence = 0.85; // Placeholder confidence score
                });
            };
            case (#err(error)) {
                #err(error);
            };
        };
    };
    
    public query func getProcessorStatus(): async {healthy: Bool; version: Text} {
        {
            healthy = true;
            version = "1.0.0";
        };
    };
    
    public func test(): async Text {
        "LLMProcessor canister is running!";
    };
} 