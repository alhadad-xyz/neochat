/**
 * @fileoverview NeoChat SDK - Core Client Library
 * 
 * This SDK provides a comprehensive client library for integrating NeoChat
 * agents into web applications. It handles authentication, agent management,
 * chat processing, and real-time communication with the NeoChat platform.
 * 
 * Features:
 * - Agent management and configuration
 * - Real-time chat processing
 * - Authentication and session management
 * - Error handling and retry logic
 * - TypeScript support with full type definitions
 * - Event-driven architecture
 * - Configurable settings and options
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { HttpAgent, Identity, AnonymousIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { SDKConfig, Agent, AgentResponse, ChatMessage, ChatResponse, SDKEventMap, SDKEventCallback, SDKError } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { CanistChatClient } from './CanistChatClient';
import { AgentManager } from '../agents/AgentManager';

/**
 * Configuration options for the NeoChat SDK
 */
export interface CanistChatConfig {
  /** The canister ID for the NeoChat deployment */
  canisterId: string;
  /** API key for authentication (optional for public agents) */
  apiKey?: string;
  /** Network configuration (local or mainnet) */
  network?: 'local' | 'mainnet';
  /** Custom host URL for local development */
  host?: string;
  /** Logging level for debugging */
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  /** Timeout for API requests in milliseconds */
  timeout?: number;
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
  /** Retry delay between attempts in milliseconds */
  retryDelay?: number;
}

/**
 * Agent configuration and metadata
 */
export interface Agent {
  /** Unique agent identifier */
  id: string;
  /** Agent display name */
  name: string;
  /** Agent description */
  description: string;
  /** Agent status */
  status: 'Active' | 'Inactive' | 'Suspended' | 'Archived';
  /** Agent category */
  category: string;
  /** Agent tags for categorization */
  tags: string[];
  /** Agent owner ID */
  ownerId: string;
  /** Agent configuration */
  config: AgentConfig;
  /** Agent analytics data */
  analytics?: AgentAnalytics;
  /** Agent creation timestamp */
  created: number;
  /** Last update timestamp */
  updated: number;
}

/**
 * Agent configuration settings
 */
export interface AgentConfig {
  /** Agent personality configuration */
  personality: PersonalityConfig;
  /** Agent behavior settings */
  behavior: BehaviorConfig;
  /** Agent appearance settings */
  appearance: AppearanceConfig;
  /** Knowledge base configuration */
  knowledgeBase: KnowledgeSource[];
  /** Context management settings */
  contextSettings: ContextSettings;
  /** Integration settings */
  integrationSettings: IntegrationSettings;
}

/**
 * Agent personality configuration
 */
export interface PersonalityConfig {
  /** Communication tone */
  tone: string;
  /** Communication style */
  style: string;
  /** Personality traits */
  traits: string[];
  /** Communication style type */
  communicationStyle: 'Conversational' | 'Professional' | 'Technical' | 'Creative' | 'Educational';
  /** Response pattern */
  responsePattern: 'Detailed' | 'Concise' | 'Structured' | 'Narrative';
}

/**
 * Agent behavior configuration
 */
export interface BehaviorConfig {
  /** Response length preference */
  responseLength: 'Short' | 'Medium' | 'Long' | 'Variable';
  /** Creativity level (0.0 to 1.0) */
  creativity: number;
  /** LLM temperature setting (0.0 to 2.0) */
  temperature: number;
  /** Nucleus sampling parameter */
  topP: number;
  /** Frequency penalty for repetition control */
  frequencyPenalty: number;
  /** Presence penalty for topic diversity */
  presencePenalty: number;
  /** Maximum tokens in response */
  maxTokens: number;
  /** Context window size */
  contextWindow: number;
  /** System prompt template */
  systemPromptTemplate: string;
}

/**
 * Agent appearance configuration
 */
export interface AppearanceConfig {
  /** Agent avatar URL or base64 */
  avatar?: string;
  /** Primary color for UI */
  primaryColor: string;
  /** Secondary color for UI */
  secondaryColor: string;
  /** Accent color for UI */
  accentColor: string;
  /** Border radius for UI elements */
  borderRadius: string;
  /** Font size */
  fontSize: string;
  /** Font family */
  fontFamily: string;
  /** UI theme */
  theme: 'Light' | 'Dark' | 'Auto';
  /** Custom CSS */
  customCSS?: string;
}

/**
 * Knowledge source configuration
 */
export interface KnowledgeSource {
  /** Unique source identifier */
  id: string;
  /** Source type */
  sourceType: 'Document' | 'URL' | 'Manual' | 'Database' | 'API';
  /** Source content */
  content: string;
  /** Source metadata */
  metadata: [string, string][];
  /** Source priority (1-10) */
  priority: number;
  /** Last update timestamp */
  lastUpdated: number;
  /** Source version */
  version: number;
  /** Whether source is active */
  isActive: boolean;
}

/**
 * Context management settings
 */
export interface ContextSettings {
  /** Enable conversation memory */
  enableMemory: boolean;
  /** Memory duration in hours */
  memoryDuration: number;
  /** Maximum context messages */
  maxContextMessages: number;
  /** Enable learning from conversations */
  enableLearning: boolean;
}

/**
 * Integration settings
 */
export interface IntegrationSettings {
  /** Allowed origins for CORS */
  allowedOrigins: string[];
  /** Rate limiting configuration */
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerHour: number;
    maxTokensPerHour: number;
  };
  /** Webhook configurations */
  webhooks: {
    url: string;
    events: string[];
    enabled: boolean;
  }[];
}

/**
 * Agent analytics data
 */
export interface AgentAnalytics {
  /** Total conversations */
  totalConversations: number;
  /** Total messages */
  totalMessages: number;
  /** Average rating */
  averageRating?: number;
  /** Total tokens used */
  totalTokensUsed: number;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Message content */
  content: string;
  /** Message sender */
  sender: 'user' | 'agent';
  /** Message timestamp */
  timestamp: Date;
  /** Message metadata */
  metadata?: Record<string, any>;
}

/**
 * Chat request options
 */
export interface ChatRequest {
  /** Agent ID to chat with */
  agentId: string;
  /** User message */
  message: string;
  /** Conversation context ID */
  contextId?: string;
  /** Additional options */
  options?: {
    /** Custom temperature setting */
    temperature?: number;
    /** Custom max tokens */
    maxTokens?: number;
    /** Enable streaming */
    streaming?: boolean;
  };
}

/**
 * Chat response structure
 */
export interface ChatResponse {
  /** Response message ID */
  messageId: string;
  /** Agent response content */
  response: string;
  /** Tokens used */
  tokens: number;
  /** Response confidence */
  confidence: number;
  /** Provider used */
  providerId: string;
  /** Model used */
  modelUsed: string;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Whether response was cached */
  cached: boolean;
  /** Response metadata */
  metadata: Record<string, any>;
}

/**
 * SDK event types
 */
export type CanistChatEvent = 
  | 'agent:created'
  | 'agent:updated'
  | 'agent:deleted'
  | 'chat:started'
  | 'chat:message'
  | 'chat:ended'
  | 'error'
  | 'connected'
  | 'disconnected';

/**
 * SDK event data
 */
export interface CanistChatEventData {
  'agent:created': { agent: Agent };
  'agent:updated': { agent: Agent };
  'agent:deleted': { agentId: string };
  'chat:started': { agentId: string; contextId: string };
  'chat:message': { message: ChatMessage; agentId: string };
  'chat:ended': { agentId: string; contextId: string };
  'error': { error: Error; context?: string };
  'connected': { timestamp: Date };
  'disconnected': { timestamp: Date };
}

/**
 * NeoChat SDK Client
 * 
 * Main client class for interacting with the NeoChat platform.
 * Provides methods for agent management, chat processing, and real-time
 * communication. Supports event-driven architecture for real-time updates.
 * 
 * @example
 * ```typescript
 * const sdk = new CanistChatSDK({
 *   canisterId: 'your-canister-id',
 *   apiKey: 'your-api-key',
 *   network: 'mainnet'
 * });
 * 
 * // Initialize the SDK
 * await sdk.initialize();
 * 
 * // Get available agents
 * const agents = await sdk.getAgents();
 * 
 * // Start a chat
 * const response = await sdk.sendMessage('agent-123', 'Hello!');
 * ```
 */
export class CanistChatSDK {
  private config: SDKConfig;
  private client: CanistChatClient;
  private agentManager: AgentManager;
  private eventEmitter: EventEmitter<SDKEventMap>;
  private logger: Logger;
  private agent: HttpAgent | null = null;
  private identity: Identity = new AnonymousIdentity();
  private authClient: AuthClient | null = null;
  private isInitialized = false;

  /**
   * Creates a new NeoChat SDK instance
   * 
   * @param config - SDK configuration options
   * 
   * @example
   * ```typescript
   * const sdk = new CanistChatSDK({
   *   canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
   *   apiKey: 'your-api-key',
   *   network: 'mainnet',
   *   logLevel: 'info'
   * });
   * ```
   */
  constructor(config: SDKConfig) {
    this.config = {
      debug: false,
      ...config,
    };

    this.eventEmitter = new EventEmitter();
    this.logger = new Logger(this.config.debug ? 'debug' : 'info');
    this.client = new CanistChatClient(this.config);
    this.agentManager = new AgentManager(this.client);

    this.logger.info('NeoChat SDK initialized', { config: this.config });
  }

  /**
   * Initialize the SDK and establish connection to IC network
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing NeoChat SDK...');

      // Initialize HTTP Agent
      this.agent = new HttpAgent({
        host: this.config.host || (this.config.network === 'local' ? 'http://localhost:4943' : 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io'),
      });

      // Fetch root key for local development
      if (this.config.network === 'local') {
        await this.agent.fetchRootKey();
        this.logger.debug('Root key fetched for local network');
      }

      // Initialize auth client
      this.authClient = await AuthClient.create();
      
      // Set up client with agent and identity
      await this.client.initialize(this.agent, this.identity);

      this.isInitialized = true;
      this.logger.info('NeoChat SDK initialization complete');

    } catch (error) {
      this.logger.error('Failed to initialize NeoChat SDK', { error });
      throw new SDKError('SDK initialization failed', 'INIT_ERROR', { error });
    }
  }

  /**
   * Authenticate with Internet Identity
   */
  async authenticate(): Promise<Identity> {
    if (!this.authClient) {
      throw new SDKError('SDK not initialized', 'NOT_INITIALIZED');
    }

    try {
      await this.authClient.login({
        identityProvider: this.config.network === 'local' 
          ? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
          : 'https://identity.ic0.app',
        onSuccess: async () => {
          this.identity = this.authClient!.getIdentity();
          await this.client.setIdentity(this.identity);
          this.logger.info('Authentication successful', { 
            principal: this.identity.getPrincipal().toString() 
          });
        },
      });

      return this.identity;
    } catch (error) {
      this.logger.error('Authentication failed', { error });
      throw new SDKError('Authentication failed', 'AUTH_ERROR', { error });
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string): Promise<Agent> {
    this.ensureInitialized();
    
    try {
      const agent = await this.agentManager.getAgent(agentId);
      this.eventEmitter.emit('agent:loaded', { agent });
      return agent;
    } catch (error) {
      this.logger.error(`Failed to get agent ${agentId}`, { error });
      this.eventEmitter.emit('agent:error', { error: error as Error, agentId });
      throw error;
    }
  }

  /**
   * Get all available agents for the current user
   */
  async getAgents(): Promise<Agent[]> {
    this.ensureInitialized();
    return this.agentManager.getUserAgents();
  }

  /**
   * Create a new agent
   */
  async createAgent(agentData: Partial<Agent>): Promise<string> {
    this.ensureInitialized();
    return this.agentManager.createAgent(agentData);
  }

  /**
   * Send a message to an agent and get a response
   */
  async chat(agentId: string, message: string, sessionId?: string): Promise<ChatMessage> {
    this.ensureInitialized();

    try {
      const response = await this.client.processChat(agentId, message, this.config.apiKey || '');
      
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.response,
        sender: 'agent',
        timestamp: new Date(),
        metadata: {
          processingTime: response.processingTime,
          tokensUsed: response.tokensUsed,
          confidence: response.confidence,
          contextId: response.contextId,
        },
      };

      this.eventEmitter.emit('chat:response', { 
        message: chatMessage, 
        sessionId: sessionId || 'default' 
      });

      return chatMessage;
    } catch (error) {
      this.logger.error(`Chat failed for agent ${agentId}`, { error });
      this.eventEmitter.emit('chat:error', { 
        error: error as Error, 
        sessionId: sessionId || 'default' 
      });
      throw error;
    }
  }

  /**
   * Get health status of the system
   */
  async getHealthStatus(): Promise<{
    status: string;
    services: string[];
    providers?: number;
    activeProviders?: number;
  }> {
    this.ensureInitialized();
    return this.client.healthCheck();
  }

  /**
   * Subscribe to SDK events
   */
  on<T extends keyof SDKEventMap>(event: T, callback: SDKEventCallback<T>): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * Unsubscribe from SDK events
   */
  off<T extends keyof SDKEventMap>(event: T, callback: SDKEventCallback<T>): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * Get current configuration
   */
  getConfig(): SDKConfig {
    return { ...this.config };
  }

  /**
   * Get current identity
   */
  getIdentity(): Identity {
    return this.identity;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.identity && !(this.identity instanceof AnonymousIdentity);
  }

  /**
   * Logout and clear authentication
   */
  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = new AnonymousIdentity();
      await this.client.setIdentity(this.identity);
      this.logger.info('User logged out');
    }
  }

  /**
   * Destroy the SDK instance and clean up resources
   */
  destroy(): void {
    this.eventEmitter.removeAllListeners();
    this.isInitialized = false;
    this.logger.info('NeoChat SDK destroyed');
  }

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    this.config.debug = true;
    this.logger.setLevel('debug');
    this.logger.debug('Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebug(): void {
    this.config.debug = false;
    this.logger.setLevel('info');
    this.logger.info('Debug mode disabled');
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new SDKError('SDK not initialized. Call initialize() first.', 'NOT_INITIALIZED');
    }
  }
} 