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
    // ============================================================================
    // PURE SUBSCRIPTION MODEL - No Balance System
    // ============================================================================
    
    public type UserId = Principal;
    public type AgentId = Text;
    public type UsageId = Text;
    
    // Subscription tiers with monthly allowances
    public type SubscriptionTier = {
        #Free;        // 100 messages/month, $0/month
        #Base;        // 1,000 messages/month, $9.99/month
        #Pro;         // 5,000 messages/month, $29.99/month
        #Enterprise;  // 20,000 messages/month, $99.99/month
    };
    
    public type FeatureType = {
        #BasicChat;           // Standard chat functionality
        #DocumentIntegration; // Document upload and processing
        #AdvancedPrompts;     // Custom prompt templates
        #ChainFusion;         // Multi-agent conversations
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
        cost: Float; // USD cost
    };
    
    // New subscription-based user model (no balance)
    public type UserSubscription = {
        userId: UserId;
        currentTier: SubscriptionTier;
        monthlyUsage: Nat; // messages used this month
        monthlyAllowance: Nat; // messages included in subscription
        monthlyCost: Float; // USD per month
        subscriptionStartDate: Time.Time;
        lastBillingDate: Time.Time;
        overageCharges: Float; // USD charges for exceeding allowance
        lastUpdated: Time.Time;
    };
    
    public type Error = {
        #SubscriptionLimitExceeded;
        #UserNotFound;
        #InvalidUsage;
        #InternalError: Text;
    };
    
    // Storage
    private stable var nextUsageId: Nat = 0;
    private stable var usageEntries: [(UsageId, UsageRecord)] = [];
    private stable var subscriptionEntries: [(UserId, UserSubscription)] = [];
    
    private var usageRecords = HashMap.HashMap<UsageId, UsageRecord>(100, Text.equal, Text.hash);
    private var userSubscriptions = HashMap.HashMap<UserId, UserSubscription>(50, Principal.equal, Principal.hash);
    
    // System upgrade hooks
    system func preupgrade() {
        usageEntries := Iter.toArray(usageRecords.entries());
        subscriptionEntries := Iter.toArray(userSubscriptions.entries());
    };
    
    system func postupgrade() {
        usageRecords := HashMap.fromIter<UsageId, UsageRecord>(usageEntries.vals(), usageEntries.size(), Text.equal, Text.hash);
        userSubscriptions := HashMap.fromIter<UserId, UserSubscription>(subscriptionEntries.vals(), subscriptionEntries.size(), Principal.equal, Principal.hash);
        usageEntries := [];
        subscriptionEntries := [];
    };
    
    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================
    
    private func generateUsageId(): UsageId {
        nextUsageId += 1;
        "usage_" # Nat.toText(nextUsageId);
    };
    
    // Get subscription tier details
    private func getTierDetails(tier: SubscriptionTier): (Nat, Float) {
        switch (tier) {
            case (#Free) { (100, 0.0) };
            case (#Base) { (1000, 9.99) };
            case (#Pro) { (5000, 29.99) };
            case (#Enterprise) { (20000, 99.99) };
        };
    };
    
    // Get monthly allowance for a tier
    private func getMonthlyAllowance(tier: SubscriptionTier): Nat {
        let (allowance, _) = getTierDetails(tier);
        allowance;
    };
    
    // Get monthly cost for a tier
    private func getMonthlyCost(tier: SubscriptionTier): Float {
        let (_, cost) = getTierDetails(tier);
        cost;
    };
    
    // Calculate overage cost (additional charge per message over allowance)
    private func calculateOverageCost(overageMessages: Nat): Float {
        let overageRate = 0.01; // $0.01 per additional message
        Float.fromInt(overageMessages) * overageRate;
    };
    
    // Check if current month has reset (for monthly usage tracking)
    private func isNewBillingMonth(currentTime: Time.Time, lastBillingDate: Time.Time): Bool {
        // Simple month comparison - in production, use proper date library
        let currentMonth = currentTime / (30 * 24 * 60 * 60 * 1_000_000_000); // Approximate
        let lastMonth = lastBillingDate / (30 * 24 * 60 * 60 * 1_000_000_000);
        currentMonth > lastMonth;
    };
    
    // ============================================================================
    // PUBLIC API
    // ============================================================================
    
    /**
     * Record usage for a user
     * Checks subscription limits and tracks monthly usage
     */
    public func recordUsage(userId: UserId, agentId: AgentId, tokens: Nat, operation: OperationType): async Result.Result<UsageId, Error> {
        let now = Time.now();
        
        // Get or create user subscription
        let userSubscription = switch (userSubscriptions.get(userId)) {
            case (?subscription) { subscription };
            case null {
                let newSubscription: UserSubscription = {
                    userId = userId;
                    currentTier = #Free;
                    monthlyUsage = 0;
                    monthlyAllowance = getMonthlyAllowance(#Free);
                    monthlyCost = getMonthlyCost(#Free);
                    subscriptionStartDate = now;
                    lastBillingDate = now;
                    overageCharges = 0.0;
                    lastUpdated = now;
                };
                userSubscriptions.put(userId, newSubscription);
                newSubscription;
            };
        };
        
        // Check if we need to reset monthly usage (new billing month)
        let updatedSubscription = if (isNewBillingMonth(now, userSubscription.lastBillingDate)) {
            // Reset monthly usage and billing date
            {
                userSubscription with
                monthlyUsage = 0;
                lastBillingDate = now;
                overageCharges = 0.0;
                lastUpdated = now;
            };
        } else {
            userSubscription;
        };
        
        // Check if user has exceeded their monthly allowance
        let newMonthlyUsage = updatedSubscription.monthlyUsage + 1; // Count as 1 message
        let monthlyAllowance = getMonthlyAllowance(updatedSubscription.currentTier);
        
        if (newMonthlyUsage > monthlyAllowance) {
            // Calculate overage charges - safe subtraction to prevent trapping
            let overageMessages = if (newMonthlyUsage >= monthlyAllowance) {
                newMonthlyUsage - monthlyAllowance
            } else {
                0
            };
            let overageCost = calculateOverageCost(overageMessages);
            
            let finalSubscription: UserSubscription = {
                updatedSubscription with
                monthlyUsage = newMonthlyUsage;
                overageCharges = overageCost;
                lastUpdated = now;
            };
            
            userSubscriptions.put(userId, finalSubscription);
            
            // Still allow the usage but track overage
            let usageId = generateUsageId();
            let usage: UsageRecord = {
                id = usageId;
                userId = userId;
                agentId = agentId;
                timestamp = now;
                tokens = tokens;
                operation = operation;
                cost = 0.0; // No immediate cost, overage charged on next bill
            };
            
            usageRecords.put(usageId, usage);
            #ok(usageId);
        } else {
            // Within monthly allowance
            let finalSubscription: UserSubscription = {
                updatedSubscription with
                monthlyUsage = newMonthlyUsage;
                lastUpdated = now;
            };
            
            userSubscriptions.put(userId, finalSubscription);
            
            let usageId = generateUsageId();
            let usage: UsageRecord = {
                id = usageId;
                userId = userId;
                agentId = agentId;
                timestamp = now;
                tokens = tokens;
                operation = operation;
                cost = 0.0; // Included in subscription
            };
            
            usageRecords.put(usageId, usage);
            #ok(usageId);
        };
    };
    
    /**
     * Get user subscription information (replaces getUserBalance)
     */
    public query func getUserSubscription(userId: UserId): async Result.Result<UserSubscription, Error> {
        switch (userSubscriptions.get(userId)) {
            case (?subscription) { #ok(subscription) };
            case null { #err(#UserNotFound) };
        };
    };
    
    /**
     * Update user subscription tier
     */
    public func updateSubscriptionTier(userId: UserId, newTier: SubscriptionTier): async Result.Result<(), Error> {
        let now = Time.now();
        
        let userSubscription = switch (userSubscriptions.get(userId)) {
            case (?subscription) { subscription };
            case null {
                let newSubscription: UserSubscription = {
                    userId = userId;
                    currentTier = newTier;
                    monthlyUsage = 0;
                    monthlyAllowance = getMonthlyAllowance(newTier);
                    monthlyCost = getMonthlyCost(newTier);
                    subscriptionStartDate = now;
                    lastBillingDate = now;
                    overageCharges = 0.0;
                    lastUpdated = now;
                };
                userSubscriptions.put(userId, newSubscription);
                return #ok(());
            };
        };
        
        let updatedSubscription: UserSubscription = {
            userSubscription with
            currentTier = newTier;
            monthlyAllowance = getMonthlyAllowance(newTier);
            monthlyCost = getMonthlyCost(newTier);
            lastUpdated = now;
        };
        
        userSubscriptions.put(userId, updatedSubscription);
        #ok(());
    };
    
    /**
     * Get usage history for a user
     */
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
                    let startIdx = if (userUsage.size() >= l) {
                        userUsage.size() - l
                    } else {
                        0
                    };
                    let actualLength = Nat.min(l, userUsage.size());
                    Array.subArray<UsageRecord>(userUsage, startIdx, actualLength);
                };
            };
            case null { userUsage };
        };
    };
    
    /**
     * Health check for the canister
     */
    public func healthCheck(): async {
        status: Text;
        totalUsers: Nat;
        totalTransactions: Nat;
    } {
        {
            status = "Metrics Collector operational - Pure Subscription Model";
            totalUsers = userSubscriptions.size();
            totalTransactions = usageRecords.size();
        }
    };
    
    /**
     * Test function
     */
    public func test(): async Text {
        "MetricsCollector canister is running with Pure Subscription Model!";
    };
    
    // ============================================================================
    // LEGACY SUPPORT (for backward compatibility during transition)
    // ============================================================================
    
    /**
     * Legacy getUserBalance function - now returns subscription info
     * @deprecated Use getUserSubscription instead
     */
    public query func getUserBalance(userId: UserId): async Result.Result<{
        balance: Float;
        currentTier: Text;
        lastUpdated: Time.Time;
        monthlyUsage: Nat;
        userId: UserId;
    }, Error> {
        switch (userSubscriptions.get(userId)) {
            case (?subscription) {
                let tierText = switch (subscription.currentTier) {
                    case (#Free) { "Free" };
                    case (#Base) { "Base" };
                    case (#Pro) { "Pro" };
                    case (#Enterprise) { "Enterprise" };
                };
                
                #ok({
                    balance = subscription.monthlyCost; // Return monthly cost as "balance"
                    currentTier = tierText;
                    lastUpdated = subscription.lastUpdated;
                    monthlyUsage = subscription.monthlyUsage;
                    userId = subscription.userId;
                });
            };
            case null { #err(#UserNotFound) };
        };
    };
    
    /**
     * Legacy setUserTier function - now updates subscription
     * @deprecated Use updateSubscriptionTier instead
     */
    public func setUserTier(userId: UserId, tier: Text): async Result.Result<(), Error> {
        let newTier = switch (tier) {
            case ("Free") { #Free };
            case ("Base") { #Base };
            case ("Pro") { #Pro };
            case ("Enterprise") { #Enterprise };
            case _ { #Base }; // Default to Base
        };
        
        await updateSubscriptionTier(userId, newTier);
    };
} 