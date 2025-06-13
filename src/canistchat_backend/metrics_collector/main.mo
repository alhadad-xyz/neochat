import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Iter "mo:base/Iter";

actor MetricsCollector {
    // Types based on the tiered pricing model from creative phase
    public type UserId = Principal;
    public type AgentId = Text;
    public type UsageId = Text;
    
    public type PricingTier = {
        #Base;      // 0-1000 tokens/month: 0.001 ICRC per token
        #Standard;  // 1001-10000 tokens: 0.0008 ICRC per token  
        #Professional; // 10001-100000 tokens: 0.0006 ICRC per token
        #Enterprise;   // 100000+ tokens: 0.0004 ICRC per token
    };
    
    public type FeatureType = {
        #BasicChat;           // 1x multiplier
        #DocumentIntegration; // 1.5x multiplier
        #AdvancedPrompts;     // 2x multiplier
        #ChainFusion;         // 3x multiplier
    };
    
    public type OperationType = {
        #MessageProcessing: FeatureType;
        #AgentCreation;
        #DocumentUpload;
        #CustomPromptTraining;
    };
    
    public type UsageRecord = {
        id: UsageId;
        userId: UserId;
        agentId: AgentId;
        timestamp: Time.Time;
        tokens: Nat;
        operation: OperationType;
        cost: Float; // ICRC tokens
    };
    
    public type UserBalance = {
        userId: UserId;
        balance: Float; // ICRC tokens
        monthlyUsage: Nat; // tokens used this month
        currentTier: PricingTier;
        lastUpdated: Time.Time;
    };
    
    public type Error = {
        #InsufficientBalance;
        #UserNotFound;
        #InvalidUsage;
        #InternalError: Text;
    };
    
    // Storage
    private stable var nextUsageId: Nat = 0;
    private stable var usageEntries: [(UsageId, UsageRecord)] = [];
    private stable var balanceEntries: [(UserId, UserBalance)] = [];
    
    private var usageRecords = HashMap.HashMap<UsageId, UsageRecord>(100, Text.equal, Text.hash);
    private var userBalances = HashMap.HashMap<UserId, UserBalance>(50, Principal.equal, Principal.hash);
    
    // System upgrade hooks
    system func preupgrade() {
        usageEntries := Iter.toArray(usageRecords.entries());
        balanceEntries := Iter.toArray(userBalances.entries());
    };
    
    system func postupgrade() {
        usageRecords := HashMap.fromIter<UsageId, UsageRecord>(usageEntries.vals(), usageEntries.size(), Text.equal, Text.hash);
        userBalances := HashMap.fromIter<UserId, UserBalance>(balanceEntries.vals(), balanceEntries.size(), Principal.equal, Principal.hash);
        usageEntries := [];
        balanceEntries := [];
    };
    
    // Helper functions
    private func generateUsageId(): UsageId {
        nextUsageId += 1;
        "usage_" # Nat.toText(nextUsageId);
    };
    
    private func getTokenPrice(tier: PricingTier): Float {
        switch (tier) {
            case (#Base) { 0.001 };
            case (#Standard) { 0.0008 };
            case (#Professional) { 0.0006 };
            case (#Enterprise) { 0.0004 };
        };
    };
    
    private func getFeatureMultiplier(feature: FeatureType): Float {
        switch (feature) {
            case (#BasicChat) { 1.0 };
            case (#DocumentIntegration) { 1.5 };
            case (#AdvancedPrompts) { 2.0 };
            case (#ChainFusion) { 3.0 };
        };
    };
    
    private func determineTier(monthlyUsage: Nat): PricingTier {
        if (monthlyUsage <= 1000) {
            #Base
        } else if (monthlyUsage <= 10000) {
            #Standard
        } else if (monthlyUsage <= 100000) {
            #Professional
        } else {
            #Enterprise
        };
    };
    
    private func calculateCost(tokens: Nat, operation: OperationType, tier: PricingTier): Float {
        let basePrice = getTokenPrice(tier);
        let tokensFloat = Float.fromInt(tokens);
        
        switch (operation) {
            case (#MessageProcessing(feature)) {
                let multiplier = getFeatureMultiplier(feature);
                basePrice * tokensFloat * multiplier;
            };
            case (#AgentCreation) {
                5.0; // Fixed cost for agent creation
            };
            case (#DocumentUpload) {
                10.0; // Fixed cost for document upload
            };
            case (#CustomPromptTraining) {
                20.0; // Fixed cost for custom prompt training
            };
        };
    };
    
    // Public API
    public func recordUsage(userId: UserId, agentId: AgentId, tokens: Nat, operation: OperationType): async Result.Result<UsageId, Error> {
        // Get or create user balance
        let userBalance = switch (userBalances.get(userId)) {
            case (?balance) { balance };
            case null {
                let newBalance: UserBalance = {
                    userId = userId;
                    balance = 0.0;
                    monthlyUsage = 0;
                    currentTier = #Base;
                    lastUpdated = Time.now();
                };
                userBalances.put(userId, newBalance);
                newBalance;
            };
        };
        
        // Calculate cost
        let cost = calculateCost(tokens, operation, userBalance.currentTier);
        
        // Check if user has sufficient balance
        if (userBalance.balance < cost) {
            return #err(#InsufficientBalance);
        };
        
        // Create usage record
        let usageId = generateUsageId();
        let now = Time.now();
        
        let usage: UsageRecord = {
            id = usageId;
            userId = userId;
            agentId = agentId;
            timestamp = now;
            tokens = tokens;
            operation = operation;
            cost = cost;
        };
        
        usageRecords.put(usageId, usage);
        
        // Update user balance
        let newMonthlyUsage = userBalance.monthlyUsage + tokens;
        let newTier = determineTier(newMonthlyUsage);
        
        let updatedBalance: UserBalance = {
            userBalance with
            balance = userBalance.balance - cost;
            monthlyUsage = newMonthlyUsage;
            currentTier = newTier;
            lastUpdated = now;
        };
        
        userBalances.put(userId, updatedBalance);
        
        #ok(usageId);
    };
    
    public query func getUserBalance(userId: UserId): async Result.Result<UserBalance, Error> {
        switch (userBalances.get(userId)) {
            case (?balance) { #ok(balance) };
            case null { #err(#UserNotFound) };
        };
    };
    
    public func addBalance(userId: UserId, amount: Float): async Result.Result<(), Error> {
        let userBalance = switch (userBalances.get(userId)) {
            case (?balance) { balance };
            case null {
                let newBalance: UserBalance = {
                    userId = userId;
                    balance = 0.0;
                    monthlyUsage = 0;
                    currentTier = #Base;
                    lastUpdated = Time.now();
                };
                userBalances.put(userId, newBalance);
                newBalance;
            };
        };
        
        let updatedBalance: UserBalance = {
            userBalance with
            balance = userBalance.balance + amount;
            lastUpdated = Time.now();
        };
        
        userBalances.put(userId, updatedBalance);
        #ok(());
    };
    
    public query func getUsageHistory(userId: UserId, limit: ?Nat): async [UsageRecord] {
        let allUsage = Iter.toArray(usageRecords.vals());
        let userUsage = Array.filter<UsageRecord>(allUsage, func(record: UsageRecord): Bool {
            record.userId == userId
        });
        
        // Apply limit if specified
        switch (limit) {
            case (?l) {
                if (userUsage.size() <= l) {
                    userUsage
                } else {
                    Array.subArray<UsageRecord>(userUsage, userUsage.size() - l, l);
                };
            };
            case null { userUsage };
        };
    };
    
    public func test(): async Text {
        "MetricsCollector canister is running!";
    };
} 