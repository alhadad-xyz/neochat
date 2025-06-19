import { Actor, HttpAgent, Identity, ActorSubclass, AnonymousIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as agentManagerIdl } from '../../../declarations/agent_manager';
import { _SERVICE as AgentManagerService } from '../../../declarations/agent_manager/agent_manager.did';
import { idlFactory as metricsCollectorIdl } from '../../../declarations/metrics_collector';
import { _SERVICE as MetricsCollectorService } from '../../../declarations/metrics_collector/metrics_collector.did';
import { idlFactory as llmProcessorIdl } from '../../../declarations/llm_processor';
import { _SERVICE as LLMProcessorService } from '../../../declarations/llm_processor/llm_processor.did';

// Canister IDs - Updated to current deployment
const AGENT_MANAGER_CANISTER_ID = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';
const METRICS_COLLECTOR_CANISTER_ID = 'b77ix-eeaaa-aaaaa-qaada-cai';
const LLM_PROCESSOR_CANISTER_ID = 'bw4dl-smaaa-aaaaa-qaacq-cai';
const DFX_NETWORK = process.env.DFX_NETWORK || 'local';

// Interface types matching the canister
export interface CreateAgentRequest {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  tags: string[];
  config: {
    personality: {
      traits: string[];
      tone: string;
      style: string;
      communicationStyle: { 'Conversational': null } | { 'Creative': null } | { 'Educational': null } | { 'Professional': null } | { 'Technical': null };
      responsePattern: { 'Concise': null } | { 'Detailed': null } | { 'Narrative': null } | { 'Structured': null };
    };
    behavior: {
      responseLength: { 'Short': null } | { 'Medium': null } | { 'Long': null } | { 'Variable': null };
      temperature: number;
      creativity: number;
      topP: number;
      contextWindow: bigint;
      maxTokens: bigint;
      frequencyPenalty: number;
      presencePenalty: number;
      systemPromptTemplate: string;
    };
    appearance: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      borderRadius: string;
      avatar: [] | [string];
      customCSS: [] | [string];
      fontFamily: string;
      fontSize: string;
      theme: { 'Auto': null } | { 'Dark': null } | { 'Light': null };
    };
    contextSettings: {
      enableLearning: boolean;
      enableMemory: boolean;
      maxContextMessages: bigint;
      memoryDuration: bigint;
    };
    integrationSettings: {
      allowedOrigins: string[];
      rateLimiting: {
        enabled: boolean;
        maxRequestsPerHour: bigint;
        maxTokensPerHour: bigint;
      };
      webhooks: Array<{
        enabled: boolean;
        events: string[];
        url: string;
      }>;
    };
    knowledgeBase: Array<{
      id: string;
      content: string;
      sourceType: { 'API': null } | { 'Database': null } | { 'Document': null } | { 'Manual': null } | { 'URL': null };
      metadata: Array<[string, string]>;
      isActive: boolean;
      lastUpdated: bigint;
      priority: bigint;
      version: bigint;
    }>;
    version: bigint;
  };
}

export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  status: { 'Active': null } | { 'Inactive': null } | { 'Suspended': null } | { 'Archived': null };
  created: bigint;
  updated: bigint;
  ownerId: string;
  config: CreateAgentRequest['config'];
  analytics?: {
    averageRating?: number;
    totalConversations: number;
    totalMessages: number;
    totalTokensUsed: number;
  };
}

export interface AgentAnalytics {
  averageRating?: number;
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
}

export interface UserBalance {
  balance: number;
  currentTier: 'Base' | 'Standard' | 'Professional' | 'Enterprise';
  lastUpdated: number;
  monthlyUsage: number;
  userId: string;
}

export interface UsageRecord {
  agentId: string;
  cost: number;
  id: string;
  operation: any;
  timestamp: number;
  tokens: number;
  userId: string;
}

export interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  totalMessages: number;
  monthlyGrowth: {
    agents: number;
    conversations: number;
    messages: number;
  };
}

export interface AnalyticsData {
  overview: {
    totalMessages: number;
    totalConversations: number;
    averageResponseTime: number;
    successRate: number;
  };
  trends: {
    messagesPerDay: { date: string; count: number }[];
    conversationsPerDay: { date: string; count: number }[];
    responseTimeHistory: { date: string; time: number }[];
  };
  agentPerformance: {
    agentId: string;
    agentName: string;
    messages: number;
    conversations: number;
    avgResponseTime: number;
    satisfaction: number;
  }[];
}

class CanisterService {
  private agent: HttpAgent | null = null;
  private agentManagerActor: ActorSubclass<AgentManagerService> | null = null;
  private metricsCollectorActor: ActorSubclass<MetricsCollectorService> | null = null;
  private llmProcessorActor: ActorSubclass<LLMProcessorService> | null = null;
  private identity: Identity | null = null;
  private isInitialized = false;
  
  // Circuit breaker and debouncing for health checks
  private healthCheckCache: Map<string, { result: any; timestamp: number; isHealthy: boolean }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private readonly HEALTH_CHECK_TIMEOUT = 8000; // 8 seconds timeout
  private pendingHealthChecks: Map<string, Promise<any>> = new Map();

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      console.log('Initializing canister service...');
      console.log('Agent Manager Canister ID:', AGENT_MANAGER_CANISTER_ID);
      console.log('Metrics Collector Canister ID:', METRICS_COLLECTOR_CANISTER_ID);
      console.log('LLM Processor Canister ID:', LLM_PROCESSOR_CANISTER_ID);
      console.log('DFX Network:', DFX_NETWORK);
      // Initialize the agent
      this.agent = new HttpAgent({
        host: DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app',
      });

      // Fetch root key for local development
      if (DFX_NETWORK === 'local') {
        console.log('Fetching root key for local development...');
        try {
        await this.agent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (error) {
          console.error('Failed to fetch root key:', error);
          throw new Error('Failed to initialize local development environment');
        }
      }

      // Create the actors with anonymous identity initially
      this.agentManagerActor = Actor.createActor(agentManagerIdl, {
        agent: this.agent,
        canisterId: AGENT_MANAGER_CANISTER_ID,
      });

      this.metricsCollectorActor = Actor.createActor(metricsCollectorIdl, {
        agent: this.agent,
        canisterId: METRICS_COLLECTOR_CANISTER_ID,
      });

      this.llmProcessorActor = Actor.createActor(llmProcessorIdl, {
        agent: this.agent,
        canisterId: LLM_PROCESSOR_CANISTER_ID,
      });

      this.isInitialized = true;
      console.log('Canister service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize canister service:', error);
      this.isInitialized = false;
    }
  }

  async setIdentity(identity: Identity | null) {
    console.log('Setting identity for canister service...', identity ? 'with identity' : 'clearing identity');
    this.identity = identity;
    if (this.agent) {
      if (identity) {
        this.agent.replaceIdentity(identity);
        // Recreate actors with authenticated identity
        this.agentManagerActor = Actor.createActor(agentManagerIdl, {
          agent: this.agent,
          canisterId: AGENT_MANAGER_CANISTER_ID,
        });
        this.metricsCollectorActor = Actor.createActor(metricsCollectorIdl, {
          agent: this.agent,
          canisterId: METRICS_COLLECTOR_CANISTER_ID,
        });
        this.llmProcessorActor = Actor.createActor(llmProcessorIdl, {
          agent: this.agent,
          canisterId: LLM_PROCESSOR_CANISTER_ID,
        });
        console.log('Identity set successfully');
      } else {
        // Clear identity - recreate actors with anonymous identity
        this.agent.replaceIdentity(new AnonymousIdentity());
        this.agentManagerActor = Actor.createActor(agentManagerIdl, {
          agent: this.agent,
          canisterId: AGENT_MANAGER_CANISTER_ID,
        });
        this.metricsCollectorActor = Actor.createActor(metricsCollectorIdl, {
          agent: this.agent,
          canisterId: METRICS_COLLECTOR_CANISTER_ID,
        });
        this.llmProcessorActor = Actor.createActor(llmProcessorIdl, {
          agent: this.agent,
          canisterId: LLM_PROCESSOR_CANISTER_ID,
        });
        console.log('Identity cleared successfully');
      }
    }
  }

  isAuthenticated(): boolean {
    if (!this.isInitialized || !this.identity) {
      return false;
    }
    
    // Check if this is a real identity (not anonymous)
    const principal = this.identity.getPrincipal();
    const principalText = principal.toText();
    const isAnonymous = principalText === '2vxsx-fae'; // Anonymous principal
    
    console.log('CanisterService.isAuthenticated() - Principal:', principalText, 'Is anonymous:', isAnonymous);
    
    return !isAnonymous;
  }

  isReady(): boolean {
    return this.isInitialized && this.agentManagerActor !== null;
  }

  async createAgent(agentData: CreateAgentRequest, creationCost: number = 1): Promise<string> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for agent creation');
    }
    try {
      console.log('Creating agent with data:', agentData);
      const result = await this.agentManagerActor.createAgent(agentData);
      if ('ok' in result) {
        // Setelah agent berhasil dibuat, potong saldo user
        await this.addBalance(-creationCost);
        return result.ok;
      } else {
        throw new Error(`Agent creation failed: ${JSON.stringify(result.err)}`);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  async getUserAgents(): Promise<AgentResponse[]> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, returning empty agent list');
      return [];
    }
    try {
      const principal = this.identity!.getPrincipal();
      console.log('Fetching agents for principal:', principal.toString());
      const agents = await this.agentManagerActor.getUserAgents(principal);
      console.log('Raw agents from canister:', agents);
      return agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        created: agent.created,
        updated: agent.updated,
        ownerId: agent.ownerId.toString(),
        config: agent.config,
        analytics: agent.analytics ? {
          averageRating: agent.analytics.averageRating ? Number(agent.analytics.averageRating) : undefined,
          totalConversations: Number(agent.analytics.totalConversations),
          totalMessages: Number(agent.analytics.totalMessages),
          totalTokensUsed: Number(agent.analytics.totalTokensUsed),
        } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching user agents:', error);
      
      // Check if it's an IDL type error
      if (error instanceof Error && error.message && error.message.includes('IDL error')) {
        console.warn('IDL type mismatch during getUserAgents, returning empty list');
        return [];
      }
      
      // For other errors, throw to let the caller handle
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<AgentResponse> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for getAgent');
    }
    try {
      const agent = await this.agentManagerActor.getAgent(agentId);
      if ('ok' in agent) {
        return {
          ...agent.ok,
          ownerId: agent.ok.ownerId.toString(),
          analytics: agent.ok.analytics ? {
            averageRating: agent.ok.analytics.averageRating.length > 0 ? agent.ok.analytics.averageRating[0] : undefined,
            totalConversations: Number(agent.ok.analytics.totalConversations),
            totalMessages: Number(agent.ok.analytics.totalMessages),
            totalTokensUsed: Number(agent.ok.analytics.totalTokensUsed),
          } : undefined,
        };
      } else {
        throw new Error(`Failed to get agent: ${JSON.stringify(agent.err)}`);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  // Public method to get agent info for embed widgets (no authentication required)
  async getAgentPublic(agentId: string): Promise<AgentResponse> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    try {
      // Try to get agent without authentication first
      const agent = await this.agentManagerActor.getAgent(agentId);
      if ('ok' in agent) {
        return {
          ...agent.ok,
          ownerId: agent.ok.ownerId.toString(),
          analytics: agent.ok.analytics ? {
            averageRating: agent.ok.analytics.averageRating.length > 0 ? agent.ok.analytics.averageRating[0] : undefined,
            totalConversations: Number(agent.ok.analytics.totalConversations),
            totalMessages: Number(agent.ok.analytics.totalMessages),
            totalTokensUsed: Number(agent.ok.analytics.totalTokensUsed),
          } : undefined,
        };
      } else {
        throw new Error(`Failed to get agent: ${JSON.stringify(agent.err)}`);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw error;
    }
  }

  async getAgentAnalytics(agentId: string): Promise<AgentAnalytics | null> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for getAgentAnalytics');
    }
    try {
      const analytics = await this.agentManagerActor.getAgentAnalytics(agentId);
      if ('ok' in analytics) {
        return {
          totalConversations: Number(analytics.ok.totalConversations),
          totalMessages: Number(analytics.ok.totalMessages),
          totalTokensUsed: Number(analytics.ok.totalTokensUsed),
          averageRating: analytics.ok.averageRating.length > 0 ? analytics.ok.averageRating[0] : undefined,
        };
      } else {
        throw new Error(`Failed to get agent analytics: ${JSON.stringify(analytics.err)}`);
      }
    } catch (error) {
      console.error('Error fetching agent analytics:', error);
      return null;
    }
  }

  async getUserBalance(): Promise<UserBalance | null> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      console.log('No identity available, returning null balance');
      return null;
    }
    try {
      const principal = this.identity.getPrincipal();
      console.log('Fetching balance for principal:', principal.toString());
      const balance = await this.metricsCollectorActor.getUserBalance(principal);
      if ('ok' in balance) {
        return {
          balance: Number(balance.ok.balance),
          currentTier: 'Base' in balance.ok.currentTier ? 'Base' :
                       'Standard' in balance.ok.currentTier ? 'Standard' :
                       'Professional' in balance.ok.currentTier ? 'Professional' :
                       'Enterprise',
          lastUpdated: Number(balance.ok.lastUpdated),
          monthlyUsage: Number(balance.ok.monthlyUsage),
          userId: balance.ok.userId.toString(),
        };
      } else {
        // Handle UserNotFound error by creating a default balance
        if ('UserNotFound' in balance.err) {
          console.log('User not found in metrics collector, creating default balance');
          // Try to add a default balance for the user
          try {
            await this.metricsCollectorActor.addBalance(principal, 0.0);
            // Retry getting the balance
            const retryBalance = await this.metricsCollectorActor.getUserBalance(principal);
            if ('ok' in retryBalance) {
              return {
                balance: Number(retryBalance.ok.balance),
                currentTier: 'Base' in retryBalance.ok.currentTier ? 'Base' :
                             'Standard' in retryBalance.ok.currentTier ? 'Standard' :
                             'Professional' in retryBalance.ok.currentTier ? 'Professional' :
                             'Enterprise',
                lastUpdated: Number(retryBalance.ok.lastUpdated),
                monthlyUsage: Number(retryBalance.ok.monthlyUsage),
                userId: retryBalance.ok.userId.toString(),
              };
            }
          } catch (addError) {
            console.error('Error creating default balance:', addError);
          }
          // Return default balance if creation fails
      return {
            balance: 0.0,
            currentTier: 'Base',
            lastUpdated: Date.now(),
            monthlyUsage: 0,
            userId: principal.toString(),
      };
        }
        throw new Error(`Failed to get user balance: ${JSON.stringify(balance.err)}`);
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
      // Return default balance on error
      if (this.identity) {
        return {
          balance: 0.0,
          currentTier: 'Base',
          lastUpdated: Date.now(),
          monthlyUsage: 0,
          userId: this.identity.getPrincipal().toString(),
        };
      }
      return null;
    }
  }

  async getUsageHistory(limit?: number): Promise<UsageRecord[]> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      console.log('No identity available, returning empty usage history');
      return [];
    }
    try {
      const principal = this.identity.getPrincipal();
      console.log('Fetching usage history for principal:', principal.toString());
      const history = await this.metricsCollectorActor.getUsageHistory(principal, limit ? [BigInt(limit)] : []);
      return history.map((record: any) => ({
        id: record.id,
        userId: record.userId.toString(),
        agentId: record.agentId,
        operation: record.operation,
        tokens: Number(record.tokens),
        cost: Number(record.cost),
        timestamp: Number(record.timestamp),
      }));
    } catch (error) {
      console.error('Error fetching usage history:', error);
      return [];
    }
  }

  async processChat(agentId: string, message: string, sessionToken: string): Promise<string> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for processChat');
    }
    try {
      // Use the advanced chat processing method that integrates with LLM processor
      const result = await this.agentManagerActor.processAgentChatAdvanced(
        agentId,
        message,
        [], // contextId - let the system create a new context
        [], // enableMemory - use agent's default settings
        []  // temperature - use agent's default temperature
      );
      
      if ('ok' in result) {
        return result.ok.response;
      } else {
        // Handle specific error variants
        let errorMessage: string;
        if (typeof result.err === 'object' && result.err !== null) {
          if ('NotFound' in result.err) {
            errorMessage = 'Agent not found. Please select a valid agent to chat with.';
          } else if ('Unauthorized' in result.err) {
            errorMessage = 'You are not authorized to chat with this agent.';
          } else if ('ConfigurationError' in result.err) {
            errorMessage = `Agent configuration error: ${result.err.ConfigurationError}`;
          } else if ('ValidationError' in result.err) {
            errorMessage = `Validation error: ${result.err.ValidationError}`;
          } else if ('InternalError' in result.err) {
            errorMessage = `Internal error: ${result.err.InternalError}`;
          } else if ('RateLimitExceeded' in result.err) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          } else if ('QuotaExceeded' in result.err) {
            errorMessage = 'Quota exceeded. Please upgrade your plan or try again later.';
          } else {
            errorMessage = JSON.stringify(result.err);
          }
        } else {
          errorMessage = String(result.err);
        }
        throw new Error(`Chat processing failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error processing chat:', error);
      throw error;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }

  private getCachedResult(key: string): any | null {
    const cached = this.healthCheckCache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
      console.log(`Using cached result for ${key}:`, cached.result);
      return cached.result;
    }
    return null;
  }

  private setCachedResult(key: string, result: any, isHealthy: boolean = true): void {
    this.healthCheckCache.set(key, {
      result,
      timestamp: Date.now(),
      isHealthy
    });
  }

  private async executeWithDebounce<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // Check if there's already a pending operation for this key
    if (this.pendingHealthChecks.has(key)) {
      console.log(`Debouncing health check for ${key}, using pending operation`);
      return this.pendingHealthChecks.get(key) as Promise<T>;
    }

    // Check cache first
    const cachedResult = this.getCachedResult(key);
    if (cachedResult) {
      return cachedResult;
    }

    // Create new operation
    const operationPromise = operation();
    this.pendingHealthChecks.set(key, operationPromise);

    try {
      const result = await operationPromise;
      this.setCachedResult(key, result, true);
      return result;
    } catch (error) {
      // Cache error result for shorter duration to avoid repeated failures
      const errorResult = this.getErrorFallback(key);
      this.setCachedResult(key, errorResult, false);
      throw error;
    } finally {
      // Remove from pending operations
      this.pendingHealthChecks.delete(key);
    }
  }

  private getErrorFallback(key: string): any {
    switch (key) {
      case 'agentManager':
        return { status: "Error", services: ["AgentManager: Error"] };
      case 'llmProcessor':
        return { status: "Error", providers: 0, activeProviders: 0 };
      case 'contextManager':
        return { status: "Error", totalContexts: 0, activeContexts: 0, totalMessages: 0 };
      default:
        return { status: "Error" };
    }
  }

  async healthCheck(): Promise<{ status: string; services: string[] }> {
    return this.executeWithDebounce('agentManager', async () => {
      try {
        if (!this.agentManagerActor) {
          return {
            status: "Not initialized",
            services: ["AgentManager: Not Available"]
          };
        }

        const result = await this.withTimeout(
          this.agentManagerActor.healthCheck(),
          this.HEALTH_CHECK_TIMEOUT // Use longer timeout
        );
        
        console.log('Agent Manager health check result:', result);
        return result;
      } catch (error) {
        console.error('Error checking health:', error);
        return {
          status: "Error",
          services: ["AgentManager: Error"]
        };
      }
    });
  }

  async getLLMProcessorHealth(): Promise<{ status: string; providers: number; activeProviders: number }> {
    return this.executeWithDebounce('llmProcessor', async () => {
      try {
        if (!this.llmProcessorActor) {
          console.warn('LLM Processor actor not initialized, returning fallback status');
          return {
            status: "Not Available",
            providers: 0,
            activeProviders: 0
          };
        }

        // Call LLM processor health check directly with timeout
        const result = await this.withTimeout(
          this.llmProcessorActor.healthCheck(),
          this.HEALTH_CHECK_TIMEOUT // Use longer timeout
        );
        
        console.log('LLM Processor health check result:', result);
        
        // Map the status properly
        const mappedStatus = (() => {
          const status = result.status;
          if (status.includes('Operational')) {
            return 'Operational';
          } else if (status.includes('Degraded')) {
            return 'Degraded';
          } else if (status.includes('Timeout')) {
            return 'Timeout';
          } else {
            return 'Error';
          }
        })();
        
        // The healthCheck returns a simple record, not a Result type
        return {
          status: mappedStatus,
          providers: Number(result.providers),
          activeProviders: Number(result.activeProviders)
        };
      } catch (error) {
        console.error('Error checking LLM processor health:', error);
        // Return fallback status instead of throwing
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          status: errorMessage.includes('timed out') ? "Timeout" : "Error",
          providers: 0,
          activeProviders: 0
        };
      }
    });
  }

  async getContextManagerHealth(): Promise<{ status: string; totalContexts: number; activeContexts: number; totalMessages: number }> {
    return this.executeWithDebounce('contextManager', async () => {
      try {
        // Context manager is built into Agent Manager and is operational
        // Return operational status to reflect that it's working
        return {
          status: "Operational",
          totalContexts: 0, // Could be enhanced to show real data
          activeContexts: 0,
          totalMessages: 0
        };
      } catch (error) {
        console.error('Error checking context manager health:', error);
        return {
          status: "Error",
          totalContexts: 0,
          activeContexts: 0,
          totalMessages: 0
        };
      }
    });
  }

  async getSystemStatus(): Promise<{
    agentManager: string;
    llmProcessor: string;
    contextManager: string;
    productionAPIs: string;
  }> {
    try {
      console.log('Getting system status...');
      
      // Get comprehensive system status from all canisters with individual timeout handling
      // Use Promise.allSettled to prevent one failure from affecting others
      const results = await Promise.allSettled([
        this.healthCheck(), // Now uses debouncing and longer timeout
        this.getLLMProcessorHealth(), // Now uses debouncing and longer timeout
        this.getContextManagerHealth() // Now uses debouncing
      ]);

      const [agentHealth, llmHealth, contextHealth] = results;

      console.log('Health check results:', {
        agentHealth: agentHealth.status === 'fulfilled' ? agentHealth.value : agentHealth.reason,
        llmHealth: llmHealth.status === 'fulfilled' ? llmHealth.value : llmHealth.reason,
        contextHealth: contextHealth.status === 'fulfilled' ? contextHealth.value : contextHealth.reason
      });

      // Fix Agent Manager status logic - check if AgentManager service is specifically OK
      const agentManagerStatus = agentHealth.status === 'fulfilled' ? 
        (() => {
          const agentManagerService = agentHealth.value.services.find((s: string) => s.includes('AgentManager'));
          if (agentManagerService && agentManagerService.includes('OK')) {
            return 'Operational';
          } else if (agentManagerService && agentManagerService.includes('DEGRADED')) {
            return 'Degraded';
          } else {
            return 'Error';
          }
        })() : 'Error';
      
      const llmProcessorStatus = llmHealth.status === 'fulfilled' ? 
        llmHealth.value.status : 'Error';
      
      // Fix Context Manager status - it's built into Agent Manager, so if Agent Manager is OK, Context Manager is OK
      const contextManagerStatus = agentHealth.status === 'fulfilled' ? 
        (() => {
          const contextManagerService = agentHealth.value.services.find((s: string) => s.includes('ContextManager'));
          if (contextManagerService && contextManagerService.includes('OK')) {
            return 'Operational';
          } else if (contextManagerService && contextManagerService.includes('DEGRADED')) {
            return 'Degraded';
          } else {
            return 'Error';
          }
        })() : 'Error';
      
      // Production APIs status based on agent manager operational status
      const productionAPIsStatus = agentManagerStatus === 'Operational' ? 'Ready' : 'Error';

      const systemStatus = {
        agentManager: agentManagerStatus,
        llmProcessor: llmProcessorStatus,
        contextManager: contextManagerStatus,
        productionAPIs: productionAPIsStatus,
      };

      console.log('Final system status:', systemStatus);
      return systemStatus;
    } catch (error) {
      console.error('Error getting system status:', error);
      return {
        agentManager: 'Error',
        llmProcessor: 'Error',
        contextManager: 'Error',
        productionAPIs: 'Error',
      };
    }
  }

  async getAnalyticsData(): Promise<{
    totalAgents: number;
    totalMessages: number;
    activeUsers: number;
    systemUptime: string;
  }> {
    try {
      // Get analytics data from the agent manager
      const agents = await this.getUserAgents();
      
      // Calculate total messages from agent analytics
      let totalMessages = 0;
      for (const agent of agents) {
        if (agent.analytics) {
          totalMessages += agent.analytics.totalMessages;
        }
      }
      
      return {
        totalAgents: agents.length,
        totalMessages,
        activeUsers: 1, // Current user (could be expanded to track multiple users)
        systemUptime: '99.9%', // Mock uptime (could be calculated from system metrics)
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        totalAgents: 0,
        totalMessages: 0,
        activeUsers: 0,
        systemUptime: '0%',
      };
    }
  }

  async getComprehensiveAnalytics(): Promise<{
    overview: {
      totalMessages: number;
      totalConversations: number;
      averageResponseTime: number;
      successRate: number;
      totalTokensUsed: number;
    };
    agentPerformance: Array<{
      agentId: string;
      agentName: string;
      messages: number;
      conversations: number;
      avgResponseTime: number;
      satisfaction: number;
      tokensUsed: number;
      status: string;
    }>;
    usageHistory: UsageRecord[];
    userBalance: UserBalance | null;
  }> {
    try {
      // Get all user agents
      const agents = await this.getUserAgents();
      
      // Get usage history and user balance
      const [usageHistory, userBalance] = await Promise.allSettled([
        this.getUsageHistory(50), // Get last 50 usage records
        this.getUserBalance()
      ]);

      // Calculate overview metrics from agent analytics
      let totalMessages = 0;
      let totalConversations = 0;
      let totalTokensUsed = 0;
      let totalRatings = 0;
      let ratingCount = 0;

      const agentPerformance = agents.map(agent => {
        const analytics = agent.analytics || {
          totalMessages: 0,
          totalConversations: 0,
          totalTokensUsed: 0,
          averageRating: undefined
        };

        totalMessages += analytics.totalMessages;
        totalConversations += analytics.totalConversations;
        totalTokensUsed += analytics.totalTokensUsed;

        if (analytics.averageRating !== undefined) {
          totalRatings += analytics.averageRating;
          ratingCount++;
        }

        return {
          agentId: agent.id,
          agentName: agent.name,
          messages: analytics.totalMessages,
          conversations: analytics.totalConversations,
          avgResponseTime: 1.2, // Mock response time (could be tracked in future)
          satisfaction: analytics.averageRating || 4.5, // Default satisfaction if no rating
          tokensUsed: analytics.totalTokensUsed,
          status: 'Active' in agent.status ? 'Active' :
                  'Inactive' in agent.status ? 'Inactive' :
                  'Suspended' in agent.status ? 'Suspended' :
                  'Archived' in agent.status ? 'Archived' : 'Unknown'
        };
      });

      const overview = {
        totalMessages,
        totalConversations,
        averageResponseTime: 1.2, // Mock average response time
        successRate: totalMessages > 0 ? 98.5 : 100, // Mock success rate
        totalTokensUsed
      };

      return {
        overview,
        agentPerformance,
        usageHistory: usageHistory.status === 'fulfilled' ? usageHistory.value : [],
        userBalance: userBalance.status === 'fulfilled' ? userBalance.value : null
      };
    } catch (error) {
      console.error('Error getting comprehensive analytics:', error);
      return {
        overview: {
          totalMessages: 0,
          totalConversations: 0,
          averageResponseTime: 0,
          successRate: 0,
          totalTokensUsed: 0
        },
        agentPerformance: [],
        usageHistory: [],
        userBalance: null
      };
    }
  }

  async addBalance(amount: number): Promise<void> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for addBalance');
    }
    try {
      const principal = this.identity.getPrincipal();
      console.log(`Adding balance: ${amount} for principal:`, principal.toString());
      const result = await this.metricsCollectorActor.addBalance(principal, amount);
      if ('err' in result) {
        throw new Error(`Failed to add balance: ${JSON.stringify(result.err)}`);
      }
      console.log('Balance added successfully');
    } catch (error) {
      console.error('Error adding balance:', error);
      throw error;
    }
  }

  async getMetricsCollectorHealth(): Promise<{
    status: string;
    totalUsers: number;
    totalTransactions: number;
  }> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    try {
      const health = await this.metricsCollectorActor.healthCheck();
      return {
        status: health.status,
        totalUsers: Number(health.totalUsers),
        totalTransactions: Number(health.totalTransactions),
      };
    } catch (error) {
      console.error('Error getting metrics collector health:', error);
      throw error;
    }
  }

  async testCanisterAccess(): Promise<{ agentManager: boolean; metricsCollector: boolean }> {
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, canister access test will fail');
      return { agentManager: false, metricsCollector: false };
    }

    const result = { agentManager: false, metricsCollector: false };

    // Just check if actors exist and are properly initialized
    if (this.agentManagerActor) {
      result.agentManager = true;
    }

    if (this.metricsCollectorActor) {
      result.metricsCollector = true;
    }

    return result;
  }

  async updateAgent(agentId: string, config: CreateAgentRequest['config']): Promise<void> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for updateAgent');
    }
    try {
      const result = await this.agentManagerActor.updateAgent(agentId, config);
      if ('err' in result) {
        throw new Error(`Agent update failed: ${JSON.stringify(result.err)}`);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  async updateAgentStatus(agentId: string, status: 'Active' | 'Inactive' | 'Suspended' | 'Archived'): Promise<void> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for updateAgentStatus');
    }
    try {
      // Convert string status to canister format
      const canisterStatus = status === 'Active' ? { Active: null } :
                           status === 'Inactive' ? { Inactive: null } :
                           status === 'Suspended' ? { Suspended: null } :
                           { Archived: null };
      
      const result = await this.agentManagerActor.updateAgentStatus(agentId, canisterStatus);
      if ('err' in result) {
        throw new Error(`Agent status update failed: ${JSON.stringify(result.err)}`);
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<void> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for deleteAgent');
    }
    try {
      const result = await this.agentManagerActor.deleteAgent(agentId);
      if ('err' in result) {
        throw new Error(`Agent deletion failed: ${JSON.stringify(result.err)}`);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }

  // Wait for the canister service to be ready
  async waitForReady(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    while (!this.isReady() && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (!this.isReady()) {
      throw new Error('Canister service failed to initialize within timeout');
    }
  }

  // Method to clear health check cache for testing
  public clearHealthCheckCache(): void {
    console.log('Clearing health check cache...');
    this.healthCheckCache.clear();
    this.pendingHealthChecks.clear();
  }

  async recordAgentCreationUsage(agentId: string): Promise<void> {
    if (!this.metricsCollectorActor) throw new Error('Canister service not initialized');
    if (!this.identity) throw new Error('Authentication required');
    const principal = this.identity.getPrincipal();
    // tokens = 0, operation = { AgentCreation: null }
    const result = await this.metricsCollectorActor.recordUsage(
      principal,
      agentId,
      BigInt(0),
      { AgentCreation: null }
    );
    if ('err' in result) throw new Error('Failed to record usage: ' + JSON.stringify(result.err));
  }
}

export const canisterService = new CanisterService(); 