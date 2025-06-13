import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";

actor AgentManager {
    // Types based on the normalized relational model from creative phase
    public type AgentId = Text;
    public type UserId = Principal;
    
    public type AgentStatus = {
        #Active;
        #Inactive;
        #Suspended;
    };
    
    public type PersonalityConfig = {
        tone: Text; // friendly, formal, enthusiastic, etc.
        style: Text; // customer_support, sales, technical, custom
        traits: [Text];
    };
    
    public type KnowledgeSource = {
        sourceType: {#Document; #URL; #Manual};
        content: Text;
        metadata: [(Text, Text)];
    };
    
    public type BehaviorConfig = {
        responseLength: {#Short; #Medium; #Long};
        creativity: Float; // 0.0 to 1.0
        temperature: Float; // LLM temperature setting
    };
    
    public type AppearanceConfig = {
        avatar: ?Text; // URL or base64
        primaryColor: Text;
        secondaryColor: Text;
        borderRadius: Text;
    };
    
    public type AgentConfig = {
        personality: PersonalityConfig;
        knowledgeBase: [KnowledgeSource];
        behavior: BehaviorConfig;
        appearance: AppearanceConfig;
    };
    
    public type Agent = {
        id: AgentId;
        name: Text;
        description: Text;
        ownerId: UserId;
        config: AgentConfig;
        status: AgentStatus;
        created: Time.Time;
        updated: Time.Time;
    };
    
    public type CreateAgentRequest = {
        name: Text;
        description: Text;
        config: AgentConfig;
    };
    
    public type Error = {
        #NotFound;
        #Unauthorized;
        #ValidationError: Text;
        #InternalError: Text;
    };
    
    // Storage - using HashMap for efficient lookups per creative phase decision
    private stable var nextAgentId: Nat = 0;
    private stable var agentEntries: [(AgentId, Agent)] = [];
    private stable var userAgentEntries: [(UserId, [AgentId])] = [];
    
    private var agents = HashMap.HashMap<AgentId, Agent>(10, Text.equal, Text.hash);
    private var userAgents = HashMap.HashMap<UserId, [AgentId]>(10, Principal.equal, Principal.hash);
    
    // System upgrade hooks
    system func preupgrade() {
        agentEntries := Iter.toArray(agents.entries());
        userAgentEntries := Iter.toArray(userAgents.entries());
    };
    
    system func postupgrade() {
        agents := HashMap.fromIter<AgentId, Agent>(agentEntries.vals(), agentEntries.size(), Text.equal, Text.hash);
        userAgents := HashMap.fromIter<UserId, [AgentId]>(userAgentEntries.vals(), userAgentEntries.size(), Principal.equal, Principal.hash);
        agentEntries := [];
        userAgentEntries := [];
    };
    
    // Helper functions
    private func generateAgentId(): AgentId {
        nextAgentId += 1;
        "agent_" # Nat.toText(nextAgentId)
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
    
    // Public API functions
    public shared(msg) func createAgent(request: CreateAgentRequest): async Result.Result<AgentId, Error> {
        let caller = msg.caller;
        let agentId = generateAgentId();
        let now = Time.now();
        
        let agent: Agent = {
            id = agentId;
            name = request.name;
            description = request.description;
            ownerId = caller;
            config = request.config;
            status = #Active;
            created = now;
            updated = now;
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
} 