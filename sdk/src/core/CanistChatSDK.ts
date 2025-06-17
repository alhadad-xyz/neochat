import { HttpAgent, Identity, AnonymousIdentity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { SDKConfig, Agent, AgentResponse, ChatMessage, ChatResponse, SDKEventMap, SDKEventCallback, SDKError } from '../types';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { CanistChatClient } from './CanistChatClient';
import { AgentManager } from '../agents/AgentManager';

/**
 * Main CanistChat SDK class providing comprehensive agent integration capabilities
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

  constructor(config: SDKConfig) {
    this.config = {
      debug: false,
      ...config,
    };

    this.eventEmitter = new EventEmitter();
    this.logger = new Logger(this.config.debug ? 'debug' : 'info');
    this.client = new CanistChatClient(this.config);
    this.agentManager = new AgentManager(this.client);

    this.logger.info('CanistChat SDK initialized', { config: this.config });
  }

  /**
   * Initialize the SDK and establish connection to IC network
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing CanistChat SDK...');

      // Initialize HTTP Agent
      this.agent = new HttpAgent({
        host: this.config.host || (this.config.network === 'local' ? 'http://localhost:4943' : 'https://ic0.app'),
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
      this.logger.info('CanistChat SDK initialization complete');

    } catch (error) {
      this.logger.error('Failed to initialize CanistChat SDK', { error });
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
    this.logger.info('CanistChat SDK destroyed');
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