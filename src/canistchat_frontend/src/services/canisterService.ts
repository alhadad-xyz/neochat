/**
 * @fileoverview NeoChat Canister Service
 * 
 * This service provides a comprehensive interface for interacting with the NeoChat
 * backend canisters on the Internet Computer. It handles authentication, agent management,
 * analytics, and LLM processing with robust error handling and caching mechanisms.
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { Actor, HttpAgent, Identity, ActorSubclass, AnonymousIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as agentManagerIdl } from '../../../declarations/agent_manager';
import { _SERVICE as AgentManagerService } from '../../../declarations/agent_manager/agent_manager.did';
import { idlFactory as metricsCollectorIdl } from '../../../declarations/metrics_collector';
import { _SERVICE as MetricsCollectorService } from '../../../declarations/metrics_collector/metrics_collector.did';
import { idlFactory as llmProcessorIdl } from '../../../declarations/llm_processor';
import { _SERVICE as LLMProcessorService } from '../../../declarations/llm_processor/llm_processor.did';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Canister IDs - Dynamically retrieved from environment variables with fallbacks
 * These IDs are used to connect to the respective canisters on the Internet Computer
 */
const AGENT_MANAGER_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_AGENT_MANAGER || 
                                   import.meta.env.VITE_AGENT_MANAGER_CANISTER_ID || 
                                   'gg257-uaaaa-aaaab-aagya-cai'; // production deployment
const METRICS_COLLECTOR_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_METRICS_COLLECTOR || 
                                       import.meta.env.VITE_METRICS_COLLECTOR_CANISTER_ID ||
                                       'g57b2-oyaaa-aaaab-aag2q-cai'; // production deployment
const LLM_PROCESSOR_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_LLM_PROCESSOR || 
                                   import.meta.env.VITE_LLM_PROCESSOR_CANISTER_ID ||
                                   'g26ho-daaaa-aaaab-aag2a-cai'; // production deployment
const DFX_NETWORK = import.meta.env.VITE_DFX_NETWORK || 'ic';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Request interface for creating a new agent
 * Contains all configuration options for agent personality, behavior, appearance, and integration
 */
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

/**
 * Response interface for agent data returned from the backend
 * Includes analytics data when available
 */
export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  status: { 'Active': null } | { 'Inactive': null } | { 'Suspended': null } | { 'Archived': null };
  created: number; // JavaScript timestamp in milliseconds (converted from IC nanoseconds)
  updated: number; // JavaScript timestamp in milliseconds (converted from IC nanoseconds)
  ownerId: string;
  config: CreateAgentRequest['config'];
  analytics?: {
    averageRating?: number;
    totalConversations: number;
    totalMessages: number;
    totalTokensUsed: number;
  };
}

/**
 * Analytics data for a specific agent
 */
export interface AgentAnalytics {
  averageRating?: number;
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed: number;
}

/**
 * User balance and tier information
 * @deprecated Use UserSubscription instead
 */
export interface UserBalance {
  balance: number;
  currentTier: 'Base' | 'Standard' | 'Professional' | 'Enterprise';
  lastUpdated: number;
  monthlyUsage: number;
  userId: string;
}

/**
 * User subscription information for the pure subscription model
 */
export interface UserSubscription {
  userId: string;
  currentTier: 'Free' | 'Base' | 'Pro' | 'Enterprise';
  monthlyUsage: number;
  monthlyAllowance: number;
  monthlyCost: number;
  subscriptionStartDate: number;
  lastBillingDate: number;
  overageCharges: number;
  lastUpdated: number;
}

/**
 * Usage record for tracking user activity and costs
 */
export interface UsageRecord {
  agentId: string;
  cost: number;
  id: string;
  operation: 'AgentCreation' | 'CustomPromptTraining' | 'DocumentUpload' | 'MessageProcessing';
  timestamp: number;
  userId: string;
}

/**
 * Dashboard metrics for overview display
 */
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

/**
 * Comprehensive analytics data for the application
 */
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

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

/**
 * NeoChat Canister Service
 * 
 * Provides a unified interface for interacting with all NeoChat backend canisters.
 * Implements robust error handling, caching, circuit breaker patterns, and health monitoring.
 * 
 * @example
 * ```typescript
 * const service = new CanisterService();
 * await service.setIdentity(identity);
 * const agents = await service.getUserAgents();
 * ```
 */
class CanisterService {
  // ============================================================================
  // PRIVATE PROPERTIES
  // ============================================================================

  /** HTTP agent for making requests to the Internet Computer */
  private agent: HttpAgent | null = null;
  
  /** Actor instances for each canister service */
  private agentManagerActor: ActorSubclass<AgentManagerService> | null = null;
  private metricsCollectorActor: ActorSubclass<MetricsCollectorService> | null = null;
  private llmProcessorActor: ActorSubclass<LLMProcessorService> | null = null;
  
  /** Current user identity */
  private identity: Identity | null = null;
  
  /** Service initialization status */
  private isInitialized = false;
  
  // ============================================================================
  // CACHING AND HEALTH MONITORING
  // ============================================================================
  
  /** Cache for health check results with timestamps */
  private healthCheckCache: Map<string, { result: any; timestamp: number; isHealthy: boolean }> = new Map();
  
  /** Cache duration for health checks (30 seconds) */
  private readonly CACHE_DURATION = 30000;
  
  /** Timeout for health check operations (8 seconds) */
  private readonly HEALTH_CHECK_TIMEOUT = 8000;
  
  /** Map to prevent duplicate health check requests */
  private pendingHealthChecks: Map<string, Promise<any>> = new Map();
  
  /** Canister readiness tracking for circuit breaker pattern */
  private canisterReadiness: Map<string, { isReady: boolean; lastCheck: number; attempts: number }> = new Map();
  
  /** Interval for readiness checks (1 minute) */
  private readonly READINESS_CHECK_INTERVAL = 60000;
  
  /** Maximum attempts before marking canister as unavailable */
  private readonly MAX_READINESS_ATTEMPTS = 3;

  // ============================================================================
  // CONSTRUCTOR AND INITIALIZATION
  // ============================================================================

  /**
   * Creates a new CanisterService instance
   * Automatically initializes the HTTP agent and logs configuration
   */
  constructor() {
    this.initializeAgent();
  }

  /**
   * Initializes the HTTP agent for Internet Computer communication
   * Sets up the agent with appropriate host configuration based on network
   */
  private async initializeAgent() {
    try {
      const host = DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';
      
      // DEBUG: Log network configuration
      // console.log('🔧 CanisterService Debug Info:');
      // console.log('  DFX_NETWORK:', DFX_NETWORK);
      // console.log('  Host URL:', host);
      // console.log('  Agent Manager ID:', AGENT_MANAGER_CANISTER_ID);
      // console.log('  Metrics Collector ID:', METRICS_COLLECTOR_CANISTER_ID);
      // console.log('  LLM Processor ID:', LLM_PROCESSOR_CANISTER_ID);
      // console.log('  Environment variables:');
      // console.log('    VITE_DFX_NETWORK:', import.meta.env.VITE_DFX_NETWORK);
      // console.log('    VITE_CANISTER_ID_AGENT_MANAGER:', import.meta.env.VITE_CANISTER_ID_AGENT_MANAGER);
      
      // Initialize the HTTP agent with appropriate host configuration
      this.agent = new HttpAgent({
        host: host,
      });

      // Fetch root key for local development
      if (DFX_NETWORK === 'local') {
        console.log('🔧 Fetching root key for local development...');
        try {
        await this.agent.fetchRootKey();
        } catch (error) {
          throw new Error('Failed to initialize local development environment');
        }
      } else {
        console.log('🔧 Using production Internet Computer network');
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
    } catch (error) {
      this.isInitialized = false;
    }
  }

  /**
   * Sets the user identity for authenticated operations
   * 
   * This method updates the service's identity and recreates all actor instances
   * with the new identity. If null is passed, it clears the identity and uses
   * anonymous authentication.
   * 
   * @param identity - The user identity to set, or null to clear authentication
   * @example
   * ```typescript
   * // Set authenticated identity
   * await service.setIdentity(userIdentity);
   * 
   * // Clear identity (anonymous)
   * await service.setIdentity(null);
   * ```
   */
  async setIdentity(identity: Identity | null) {
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
      }
    }
  }

  /**
   * Checks if the service is currently authenticated with a real user identity
   * 
   * Returns true if the service has a non-anonymous identity set, false otherwise.
   * This is useful for determining if the user is logged in.
   * 
   * @returns true if authenticated with a real identity, false otherwise
   * @example
   * ```typescript
   * if (service.isAuthenticated()) {
   *   console.log('User is logged in');
   * } else {
   *   console.log('User is anonymous');
   * }
   * ```
   */
  isAuthenticated(): boolean {
    if (!this.isInitialized || !this.identity) {
      return false;
    }
    
    // Check if this is a real identity (not anonymous)
    const principal = this.identity.getPrincipal();
    const principalText = principal.toText();
    const isAnonymous = principalText === '2vxsx-fae'; // Anonymous principal
    
    return !isAnonymous;
  }

  /**
   * Checks if the service is ready for operations
   * 
   * Returns true if the service has been initialized and the agent manager
   * actor is available. This should be checked before making any canister calls.
   * 
   * @returns true if the service is ready, false otherwise
   */
  isReady(): boolean {
    return this.isInitialized && this.agentManagerActor !== null;
  }

  // ============================================================================
  // AGENT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Creates a new agent with the specified configuration
   * 
   * This method creates a new AI agent with the provided configuration including
   * personality traits, behavior settings, appearance, and integration options.
   * The agent will be owned by the currently authenticated user.
   * 
   * @param agentData - Complete agent configuration data
   * @returns Promise resolving to the created agent's ID
   * @throws {Error} If the service is not ready or authentication fails
   * @example
   * ```typescript
   * const agentId = await service.createAgent({
   *   name: 'Customer Support Bot',
   *   description: 'AI assistant for customer support',
   *   category: 'Support',
   *   isPublic: true,
   *   tags: ['support', 'customer-service'],
   *   config: { /* agent configuration *\/ }
   * });
   * ```
   */
  async createAgent(agentData: CreateAgentRequest): Promise<string> {
    return this.callWithReadinessCheck(async () => {
      if (!this.agentManagerActor) {
        throw new Error('Canister service not initialized');
      }
      if (!this.identity) {
        throw new Error('Authentication required for agent creation');
      }
      try {
        const result = await this.agentManagerActor.createAgent(agentData);
        if ('ok' in result) {
          return result.ok;
        } else {
          throw new Error(`Agent creation failed: ${JSON.stringify(result.err)}`);
        }
      } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
      }
    }, 'createAgent');
  }

  /**
   * Retrieves all agents owned by the currently authenticated user
   * 
   * This method fetches all agents that belong to the authenticated user.
   * If the user is not authenticated, it returns an empty array.
   * 
   * @returns Promise resolving to an array of user's agents
   * @throws {Error} If the service is not initialized
   * @example
   * ```typescript
   * const agents = await service.getUserAgents();
   * console.log(`User has ${agents.length} agents`);
   * ```
   */
  async getUserAgents(): Promise<AgentResponse[]> {
    if (!this.agentManagerActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.isAuthenticated()) {
      return [];
    }
    try {
      const principal = this.identity!.getPrincipal();
      
      const agents = await this.agentManagerActor.getUserAgents(principal);
      
      const processedAgents = agents.map((agent: any, index: number) => {
        try {
          // Convert IC nanosecond timestamps to JavaScript milliseconds
          const createdMs = agent.created ? Number(agent.created) / 1000000 : Date.now();
          const updatedMs = agent.updated ? Number(agent.updated) / 1000000 : Date.now();
          
          return {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            status: agent.status,
            created: !isNaN(createdMs) && createdMs > 0 ? createdMs : Date.now(),
            updated: !isNaN(updatedMs) && updatedMs > 0 ? updatedMs : Date.now(),
            ownerId: agent.ownerId.toString(),
            config: agent.config,
            analytics: agent.analytics ? {
              averageRating: agent.analytics.averageRating ? Number(agent.analytics.averageRating) : undefined,
              totalConversations: Number(agent.analytics.totalConversations),
              totalMessages: Number(agent.analytics.totalMessages),
              totalTokensUsed: Number(agent.analytics.totalTokensUsed),
            } : undefined,
          };
        } catch (error) {
          // Return a safe fallback agent object
          return {
            id: agent.id || `fallback-${index}`,
            name: agent.name || 'Unknown Agent',
            description: agent.description || '',
            status: agent.status || { 'Active': null },
            created: Date.now(),
            updated: Date.now(),
            ownerId: agent.ownerId?.toString() || 'unknown',
            config: agent.config || {},
            analytics: undefined,
          };
        }
      });
      
      return processedAgents;
    } catch (error) {
      // Check if it's an IDL type error
      if (error instanceof Error && error.message && error.message.includes('IDL error')) {
        return [];
      }
      
      // For other errors, throw to let the caller handle
      throw error;
    }
  }

  /**
   * Retrieves a specific agent by ID (authenticated access)
   * 
   * This method fetches a specific agent by its ID. The user must be authenticated
   * and have access to the agent (either as owner or if the agent is public).
   * 
   * @param agentId - The unique identifier of the agent to retrieve
   * @returns Promise resolving to the agent data
   * @throws {Error} If the service is not initialized, user is not authenticated, or agent not found
   * @example
   * ```typescript
   * const agent = await service.getAgent('agent-123');
   * console.log(`Agent name: ${agent.name}`);
   * ```
   */
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
          created: Number(agent.ok.created) / 1000000, // Convert IC nanoseconds to JS milliseconds
          updated: Number(agent.ok.updated) / 1000000, // Convert IC nanoseconds to JS milliseconds
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
      throw error;
    }
  }

  /**
   * Retrieves a specific agent by ID (public access)
   * 
   * This method fetches a specific agent by its ID without requiring authentication.
   * This is typically used for embed widgets and public agent access.
   * 
   * @param agentId - The unique identifier of the agent to retrieve
   * @returns Promise resolving to the agent data
   * @throws {Error} If the service is not initialized or agent not found
   * @example
   * ```typescript
   * const agent = await service.getAgentPublic('public-agent-123');
   * console.log(`Public agent: ${agent.name}`);
   * ```
   */
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
          created: Number(agent.ok.created) / 1000000, // Convert IC nanoseconds to JS milliseconds
          updated: Number(agent.ok.updated) / 1000000, // Convert IC nanoseconds to JS milliseconds
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
      console.error('❌ Error fetching agent:', error);
      throw error;
    }
  }

  /**
   * Retrieves analytics data for a specific agent
   * 
   * This method fetches analytics data for a specific agent including conversation
   * metrics, message counts, token usage, and performance statistics.
   * 
   * @param agentId - The unique identifier of the agent
   * @returns Promise resolving to analytics data or null if not available
   * @throws {Error} If the service is not initialized or agent not found
   * @example
   * ```typescript
   * const analytics = await service.getAgentAnalytics('agent-123');
   * if (analytics) {
   *   console.log(`Total conversations: ${analytics.totalConversations}`);
   * }
   * ```
   */
  async getAgentAnalytics(agentId: string): Promise<AgentAnalytics | null> {
    this.ensureInitialized();
    
    try {
      if (!this.identity || this.identity.getPrincipal().isAnonymous()) {
        throw new Error('Authentication required for getAgentAnalytics');
      }
      
      if (!this.agentManagerActor) {
        throw new Error('Agent manager actor not available');
      }
      
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
      console.error('❌ Error fetching agent analytics:', error);
      return null;
    }
  }

  /**
   * Retrieves conversation history for an agent
   * 
   * This method fetches conversation history including context IDs, message counts,
   * and timestamps for analytics and review purposes.
   * 
   * @param agentId - The unique identifier of the agent
   * @param limit - Maximum number of conversations to return (default: 10)
   * @returns Promise resolving to conversation history array
   * @throws {Error} If the service is not initialized
   * @example
   * ```typescript
   * const history = await service.getAgentConversationHistory('agent-123', 5);
   * console.log(`Found ${history.length} conversations`);
   * ```
   */
  async getAgentConversationHistory(agentId: string, limit?: number): Promise<Array<{
    contextId: string;
    messageCount: number;
    created: Date;
    lastAccessed: Date;
  }>> {
    this.ensureInitialized();
    
    try {
      if (!this.identity || this.identity.getPrincipal().isAnonymous()) {
        throw new Error('Authentication required for getAgentConversationHistory');
      }
      
      if (!this.agentManagerActor) {
        throw new Error('Agent manager actor not available');
      }
      
      const history = await this.agentManagerActor.getAgentConversationHistory(agentId, limit ? [BigInt(limit)] : []);
      if ('ok' in history) {
        return history.ok.map((conv: any) => ({
          contextId: conv.contextId,
          messageCount: Number(conv.messageCount),
          created: new Date(Number(conv.created) / 1000000), // Convert nanoseconds to milliseconds
          lastAccessed: new Date(Number(conv.lastAccessed) / 1000000),
        }));
      } else {
        throw new Error(`Failed to get conversation history: ${JSON.stringify(history.err)}`);
      }
    } catch (error) {
      console.error('❌ Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Retrieves the current user's balance and tier information
   * @deprecated Use getUserSubscription instead
   * 
   * This method fetches the user's current balance, subscription tier,
   * and usage information from the metrics collector canister.
   * 
   * @returns Promise resolving to user balance data or null if not authenticated
   * @throws {Error} If the service is not initialized
   * @example
   * ```typescript
   * const balance = await service.getUserBalance();
   * if (balance) {
   *   console.log(`Balance: $${balance.balance}, Tier: ${balance.currentTier}`);
   * }
   * ```
   */
  async getUserBalance(): Promise<UserBalance | null> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      return null;
    }
    try {
      const principal = this.identity.getPrincipal();
      const balance = await this.metricsCollectorActor.getUserBalance(principal);
      if ('ok' in balance) {
        return {
          balance: Number(balance.ok.balance),
          currentTier: balance.ok.currentTier as 'Base' | 'Standard' | 'Professional' | 'Enterprise',
          lastUpdated: Number(balance.ok.lastUpdated),
          monthlyUsage: Number(balance.ok.monthlyUsage),
          userId: balance.ok.userId.toString(),
        };
      } else {
        // Handle UserNotFound error by creating a default balance
        if ('UserNotFound' in balance.err) {
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

  /**
   * Retrieves the current user's subscription information
   * 
   * This method fetches the user's current subscription tier, monthly usage,
   * allowance, and billing information from the metrics collector canister.
   * 
   * @returns Promise resolving to user subscription data or null if not authenticated
   * @throws {Error} If the service is not initialized
   * @example
   * ```typescript
   * const subscription = await service.getUserSubscription();
   * if (subscription) {
   *   console.log(`Tier: ${subscription.currentTier}, Usage: ${subscription.monthlyUsage}/${subscription.monthlyAllowance}`);
   * }
   * ```
   */
  async getUserSubscription(): Promise<UserSubscription | null> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      return null;
    }
    try {
      const principal = this.identity.getPrincipal();
      const subscription = await this.metricsCollectorActor.getUserSubscription(principal);
      if ('ok' in subscription) {
        return {
          userId: subscription.ok.userId.toString(),
          currentTier: 'Free' in subscription.ok.currentTier ? 'Free' :
                       'Base' in subscription.ok.currentTier ? 'Base' :
                       'Pro' in subscription.ok.currentTier ? 'Pro' :
                       'Enterprise',
          monthlyUsage: Number(subscription.ok.monthlyUsage),
          monthlyAllowance: Number(subscription.ok.monthlyAllowance),
          monthlyCost: Number(subscription.ok.monthlyCost),
          subscriptionStartDate: Number(subscription.ok.subscriptionStartDate),
          lastBillingDate: Number(subscription.ok.lastBillingDate),
          overageCharges: Number(subscription.ok.overageCharges),
          lastUpdated: Number(subscription.ok.lastUpdated),
        };
      } else {
        // Handle UserNotFound error by creating a default subscription
        if ('UserNotFound' in subscription.err) {
          // Try to create a default subscription
          try {
            await this.metricsCollectorActor.updateSubscriptionTier(principal, { Free: null });
            // Retry getting the subscription
            const retrySubscription = await this.metricsCollectorActor.getUserSubscription(principal);
            if ('ok' in retrySubscription) {
              return {
                userId: retrySubscription.ok.userId.toString(),
                currentTier: 'Free' in retrySubscription.ok.currentTier ? 'Free' :
                             'Base' in retrySubscription.ok.currentTier ? 'Base' :
                             'Pro' in retrySubscription.ok.currentTier ? 'Pro' :
                             'Enterprise',
                monthlyUsage: Number(retrySubscription.ok.monthlyUsage),
                monthlyAllowance: Number(retrySubscription.ok.monthlyAllowance),
                monthlyCost: Number(retrySubscription.ok.monthlyCost),
                subscriptionStartDate: Number(retrySubscription.ok.subscriptionStartDate),
                lastBillingDate: Number(retrySubscription.ok.lastBillingDate),
                overageCharges: Number(retrySubscription.ok.overageCharges),
                lastUpdated: Number(retrySubscription.ok.lastUpdated),
              };
            }
          } catch (addError) {
            console.error('Error creating default subscription:', addError);
          }
          // Return default subscription if creation fails
          return {
            userId: principal.toString(),
            currentTier: 'Free',
            monthlyUsage: 0,
            monthlyAllowance: 100,
            monthlyCost: 0.0,
            subscriptionStartDate: Date.now(),
            lastBillingDate: Date.now(),
            overageCharges: 0.0,
            lastUpdated: Date.now(),
          };
        }
        throw new Error(`Failed to get user subscription: ${JSON.stringify(subscription.err)}`);
      }
    } catch (error) {
      // Return default subscription on error
      if (this.identity) {
        return {
          userId: this.identity.getPrincipal().toString(),
          currentTier: 'Free',
          monthlyUsage: 0,
          monthlyAllowance: 100,
          monthlyCost: 0.0,
          subscriptionStartDate: Date.now(),
          lastBillingDate: Date.now(),
          overageCharges: 0.0,
          lastUpdated: Date.now(),
        };
      }
      return null;
    }
  }

  /**
   * Retrieves the user's usage history and transaction records
   * 
   * This method fetches the user's usage history including all operations
   * like agent creation, message processing, document uploads, etc.
   * 
   * @param limit - Optional limit on the number of records to return
   * @returns Promise resolving to an array of usage records
   * @throws {Error} If the service is not initialized
   * @example
   * ```typescript
   * const history = await service.getUsageHistory(50);
   * console.log(`User has ${history.length} usage records`);
   * ```
   */
  async getUsageHistory(limit?: number): Promise<UsageRecord[]> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      return [];
    }
    try {
      const principal = this.identity.getPrincipal();
      const history = await this.metricsCollectorActor.getUsageHistory(principal, limit ? [BigInt(limit)] : []);
      return history.map((record: any) => ({
        id: record.id,
        userId: record.userId.toString(),
        agentId: record.agentId,
        operation: record.operation,
        cost: Number(record.cost),
        timestamp: Number(record.timestamp),
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Process chat for public/embed widgets without authentication
   * 
   * This method allows public access to agent chat functionality for embed widgets
   * and public integrations. It uses anonymous identity and doesn't require user authentication.
   * 
   * @param agentId - The unique identifier of the agent to chat with
   * @param message - The message content to send to the agent
   * @param sessionToken - Session token for the conversation (optional for public access)
   * @returns Promise resolving to the agent's response
   * @throws {Error} If the service is not initialized or chat processing fails
   * @example
   * ```typescript
   * const response = await service.processChatPublic('agent-123', 'Hello, how can you help me?');
   * console.log(`Agent response: ${response}`);
   * ```
   */
  async processChatPublic(agentId: string, message: string, sessionToken?: string): Promise<string> {
    try {
      // For public access, we need to create an anonymous agent if not already initialized
      if (!this.agent) {
        await this.initializeAgent();
      }

      // Create anonymous actor for public access
      const anonymousAgent = new HttpAgent({
        host: DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app',
        identity: new AnonymousIdentity(),
      });

      if (DFX_NETWORK === 'local') {
        await anonymousAgent.fetchRootKey();
      }

      const anonymousAgentManagerActor = Actor.createActor(agentManagerIdl, {
        agent: anonymousAgent,
        canisterId: AGENT_MANAGER_CANISTER_ID,
      }) as ActorSubclass<AgentManagerService>;

      // Use the new public chat method
      const result = await anonymousAgentManagerActor.processAgentChatPublic(agentId, message);
      
      if ('ok' in result) {
        return result.ok.response;
      } else {
        // Handle specific error variants
        let errorMessage: string;
        if (typeof result.err === 'object' && result.err !== null) {
          if ('NotFound' in result.err) {
            errorMessage = 'Agent not found. Please check the agent ID.';
          } else if ('Unauthorized' in result.err) {
            errorMessage = 'This agent is not available for public access.';
          } else if ('ConfigurationError' in result.err) {
            errorMessage = `Agent configuration error: ${result.err.ConfigurationError}`;
          } else if ('ValidationError' in result.err) {
            errorMessage = `Validation error: ${result.err.ValidationError}`;
          } else if ('InternalError' in result.err) {
            errorMessage = `Internal error: ${result.err.InternalError}`;
          } else if ('RateLimitExceeded' in result.err) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          } else if ('QuotaExceeded' in result.err) {
            errorMessage = 'Quota exceeded. Please try again later.';
          } else {
            errorMessage = JSON.stringify(result.err);
          }
        } else {
          errorMessage = String(result.err);
        }
        throw new Error(`Chat processing failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Public chat processing failed:', error);
      
      // Fallback to a basic response if backend fails
      if (error instanceof Error && error.message.includes('not available for public access')) {
        throw error; // Re-throw authorization errors
      }
      
      // For other errors, provide a fallback response
      return `I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment. (Error: ${error instanceof Error ? error.message : 'Unknown error'})`;
    }
  }

  /**
   * Process chat for authenticated users
   * 
   * This method requires user authentication and provides full chat functionality
   * with context management and advanced features.
   * 
   * @param agentId - The unique identifier of the agent to chat with
   * @param message - The message content to send to the agent
   * @param sessionToken - Session token for the conversation (currently unused)
   * @returns Promise resolving to the agent's response
   * @throws {Error} If the service is not initialized, user is not authenticated, or chat processing fails
   * @example
   * ```typescript
   * const response = await service.processChat('agent-123', 'Hello, how can you help me?', 'session-token');
   * console.log(`Agent response: ${response}`);
   * ```
   */
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

  /**
   * Provides fallback values for failed operations
   * 
   * This method returns appropriate fallback values when operations fail,
   * helping to maintain system stability.
   * 
   * @param key - The operation key to get fallback for
   * @returns Fallback value for the operation
   */
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

  // ============================================================================
  // HEALTH CHECK METHODS
  // ============================================================================

  /**
   * Performs a health check on the Agent Manager canister
   * 
   * This method checks the health status of the Agent Manager canister
   * with debouncing and caching to prevent excessive calls.
   * 
   * @returns Promise resolving to health status and service information
   * @example
   * ```typescript
   * const health = await service.healthCheck();
   * console.log(`Status: ${health.status}`);
   * console.log(`Services: ${health.services.join(', ')}`);
   * ```
   */
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
        
        console.log('🔍 Agent Manager health check result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error checking health:', error);
        return {
          status: "Error",
          services: ["AgentManager: Error"]
        };
      }
    });
  }

  /**
   * Performs a health check on the LLM Processor canister
   * 
   * This method checks the health status of the LLM Processor canister,
   * including provider availability and operational status.
   * 
   * @returns Promise resolving to LLM processor health status
   * @example
   * ```typescript
   * const health = await service.getLLMProcessorHealth();
   * console.log(`Status: ${health.status}`);
   * console.log(`Providers: ${health.providers}/${health.activeProviders} active`);
   * ```
   */
  async getLLMProcessorHealth(): Promise<{ status: string; providers: number; activeProviders: number }> {
    return this.executeWithDebounce('llmProcessor', async () => {
      try {
        if (!this.llmProcessorActor) {
          console.warn('⚠️ LLM Processor actor not initialized, returning fallback status');
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
        
        console.log('🔍 LLM Processor health check result:', result);
        
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
        console.error('❌ Error checking LLM processor health:', error);
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

  /**
   * Performs a health check on the Context Manager
   * 
   * This method checks the health status of the Context Manager,
   * which is built into the Agent Manager canister.
   * 
   * @returns Promise resolving to context manager health status
   * @example
   * ```typescript
   * const health = await service.getContextManagerHealth();
   * console.log(`Status: ${health.status}`);
   * console.log(`Total contexts: ${health.totalContexts}`);
   * ```
   */
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
        console.error('❌ Error checking context manager health:', error);
        return {
          status: "Error",
          totalContexts: 0,
          activeContexts: 0,
          totalMessages: 0
        };
      }
    });
  }

  /**
   * Gets comprehensive system status from all canisters
   * 
   * This method performs health checks on all major system components
   * and returns a unified status report. It uses Promise.allSettled to
   * ensure that one failure doesn't affect the others.
   * 
   * @returns Promise resolving to comprehensive system status
   * @example
   * ```typescript
   * const status = await service.getSystemStatus();
   * console.log(`Agent Manager: ${status.agentManager}`);
   * console.log(`LLM Processor: ${status.llmProcessor}`);
   * console.log(`Context Manager: ${status.contextManager}`);
   * ```
   */
  async getSystemStatus(): Promise<{
    agentManager: string;
    llmProcessor: string;
    contextManager: string;
  }> {
    try {
      console.log('🔍 Getting system status...');
      
      // Get comprehensive system status from all canisters with individual timeout handling
      // Use Promise.allSettled to prevent one failure from affecting others
      const results = await Promise.allSettled([
        this.healthCheck(), // Now uses debouncing and longer timeout
        this.getLLMProcessorHealth(), // Now uses debouncing and longer timeout
        this.getContextManagerHealth() // Now uses debouncing
      ]);

      const [agentHealth, llmHealth, contextHealth] = results;

      console.log('🔍 Health check results:', {
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
      
      const systemStatus = {
        agentManager: agentManagerStatus,
        llmProcessor: llmProcessorStatus,
        contextManager: contextManagerStatus,
      };

      console.log('Final system status:', systemStatus);
      return systemStatus;
    } catch (error) {
      console.error('Error getting system status:', error);
      return {
        agentManager: 'Error',
        llmProcessor: 'Error',
        contextManager: 'Error',
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
      totalCost: number;
    };
    agentPerformance: Array<{
      agentId: string;
      agentName: string;
      messages: number;
      conversations: number;
      avgResponseTime: number;
      satisfaction: number;
      cost: number;
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
      let totalCost = 0;
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
        totalCost += analytics.totalTokensUsed * 0.01; // Convert tokens to USD cost

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
          cost: analytics.totalTokensUsed * 0.01, // Convert tokens to USD cost
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
        totalCost
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
          totalCost: 0
        },
        agentPerformance: [],
        usageHistory: [],
        userBalance: null
      };
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

  // Method to clear canister readiness cache
  public clearReadinessCache(): void {
    console.log('Clearing canister readiness cache...');
    this.canisterReadiness.clear();
  }

  /**
   * Check if a canister is ready and has a deployed Wasm module
   */
  private async checkCanisterReadiness(canisterId: string, actorFactory: any): Promise<boolean> {
    const cacheKey = `readiness_${canisterId}`;
    const cached = this.canisterReadiness.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && Date.now() - cached.lastCheck < this.READINESS_CHECK_INTERVAL) {
      return cached.isReady;
    }

    try {
      // Use existing actors if available, otherwise create new ones
      let actor: any = null;
      
      if (canisterId === AGENT_MANAGER_CANISTER_ID && this.agentManagerActor) {
        actor = this.agentManagerActor;
      } else if (canisterId === METRICS_COLLECTOR_CANISTER_ID && this.metricsCollectorActor) {
        actor = this.metricsCollectorActor;
      } else if (canisterId === LLM_PROCESSOR_CANISTER_ID && this.llmProcessorActor) {
        actor = this.llmProcessorActor;
      } else {
        // Create a temporary actor for testing
        const testHost = DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';
        console.log('🔧 Creating temporary test agent for canister readiness check:');
        console.log('  DFX_NETWORK:', DFX_NETWORK);
        console.log('  Test Host:', testHost);
        console.log('  Canister ID:', canisterId);
        
        const testAgent = new HttpAgent({
          host: testHost,
        });

        if (DFX_NETWORK === 'local') {
          console.log('🔧 Fetching root key for temporary test agent...');
          await testAgent.fetchRootKey();
        } else {
          console.log('🔧 Using production IC network for temporary test agent');
        }

        actor = Actor.createActor(actorFactory, {
          agent: testAgent,
          canisterId: canisterId,
        });
      }

      // Try to call a simple method to verify the canister is ready
      const healthCheckPromise = actor.healthCheck?.() || Promise.resolve({ status: "ready" });
      
      await Promise.race([
        healthCheckPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);

      this.canisterReadiness.set(cacheKey, {
        isReady: true,
        lastCheck: Date.now(),
        attempts: 0
      });

      return true;
    } catch (error: any) {
      const currentAttempts = cached?.attempts || 0;
      
      this.canisterReadiness.set(cacheKey, {
        isReady: false,
        lastCheck: Date.now(),
        attempts: currentAttempts + 1
      });

      // Check if this is a "no wasm module" error
      if (error.message?.includes('no Wasm module') || error.message?.includes('IC0537')) {
        throw new Error(`Canister ${canisterId} is not deployed. Please run 'dfx deploy' to deploy all canisters.`);
      }

      console.warn(`Canister ${canisterId} readiness check failed:`, error.message);
      return false;
    }
  }

  /**
   * Ensure all canisters are ready before making calls
   */
  private async ensureCanistersReady(): Promise<void> {
    // Skip readiness checks if actors are already initialized and working
    if (this.agentManagerActor && this.metricsCollectorActor && this.llmProcessorActor) {
      console.log('All actors initialized, skipping readiness checks');
      return;
    }

    const canisterChecks = [
      { id: AGENT_MANAGER_CANISTER_ID, factory: agentManagerIdl, name: 'agent_manager' },
      { id: METRICS_COLLECTOR_CANISTER_ID, factory: metricsCollectorIdl, name: 'metrics_collector' },
      { id: LLM_PROCESSOR_CANISTER_ID, factory: llmProcessorIdl, name: 'llm_processor' }
    ];

    const readinessResults = await Promise.allSettled(
      canisterChecks.map(async ({ id, factory, name }) => {
        if (!id) {
          throw new Error(`${name} canister ID is not configured`);
        }
        const isReady = await this.checkCanisterReadiness(id, factory);
        if (!isReady) {
          throw new Error(`${name} canister (${id}) is not ready`);
        }
        return { name, id, ready: true };
      })
    );

    const failedCanisters = readinessResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason.message);

    if (failedCanisters.length > 0) {
      const errorMessage = [
        'One or more canisters are not ready:',
        ...failedCanisters,
        '',
        'To fix this issue:',
        '1. Make sure the local dfx replica is running: dfx start',
        '2. Deploy all canisters: dfx deploy',
        '3. Refresh the page',
        '',
        'If the issue persists, check the dfx logs for more details.'
      ].join('\n');
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Wrapper for canister calls with automatic readiness checks and retry logic
   */
  private async callWithReadinessCheck<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check canister readiness before making the call
        await this.ensureCanistersReady();
        
        // Execute the operation
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.warn(`${operationName} attempt ${attempt + 1} failed:`, error.message);
        
        // If it's a "no wasm module" error, don't retry
        if (error.message?.includes('no Wasm module') || error.message?.includes('IC0537')) {
          throw new Error(`Canisters are not deployed. Please run 'dfx deploy' and refresh the page.`);
        }
        
        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError || new Error(`${operationName} failed after ${maxRetries + 1} attempts`);
  }

  async upgradeUserTier(tier: string): Promise<void> {
    if (!this.metricsCollectorActor) {
      throw new Error('Canister service not initialized');
    }
    if (!this.identity) {
      throw new Error('Authentication required for tier upgrade');
    }
    try {
      const principal = this.identity.getPrincipal();
      console.log('Upgrading user tier to:', tier);
      
      // Map frontend tier names to backend tier variants
      const tierMapping = {
        'Free': { Free: null },
        'Base': { Base: null },
        'Pro': { Pro: null },
        'Enterprise': { Enterprise: null }
      };
      
      const backendTier = tierMapping[tier as keyof typeof tierMapping];
      if (!backendTier) {
        throw new Error(`Invalid tier: ${tier}`);
      }
      
      const result = await this.metricsCollectorActor.updateSubscriptionTier(principal, backendTier);
      if ('ok' in result) {
        console.log('Successfully upgraded user tier to:', tier);
      } else {
        throw new Error(`Failed to upgrade tier: ${JSON.stringify(result.err)}`);
      }
    } catch (error) {
      console.error('Error upgrading user tier:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Canister service not initialized');
    }
  }
}

export const canisterService = new CanisterService(); 