/**
 * NeoChat SDK Type Definitions
 */

// Core SDK types
export interface SDKConfig {
  network: 'local' | 'ic';
  agentManagerCanisterId: string;
  llmProcessorCanisterId?: string;
  apiKey?: string;
  host?: string;
  debug?: boolean;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  created: string;
  updated?: string;
  ownerId?: string;
  config: AgentConfig;
  metadata?: AgentMetadata;
}

export interface AgentConfig {
  personality: {
    traits: string[];
    tone: string;
    responseStyle: string;
  };
  knowledgeBase: {
    documents: string[];
    sources: string[];
    context: string;
  };
  behavior: {
    maxResponseLength: number;
    conversationMemory: boolean;
    escalationRules: string[];
  };
  appearance: {
    avatar: string;
    theme: string;
    welcomeMessage: string;
  };
}

export interface AgentMetadata {
  version: string;
  tags: string[];
  category: string;
  isPublic: boolean;
  analytics: {
    totalConversations: number;
    totalMessages: number;
    averageRating: number;
  };
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
  isError?: boolean;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  processingTime?: number;
  tokensUsed?: number;
  confidence?: number;
  contextId?: string;
  sourceProvider?: string;
}

export interface ChatSession {
  id: string;
  agentId: string;
  messages: ChatMessage[];
  created: Date;
  lastActive: Date;
  metadata?: SessionMetadata;
}

export interface SessionMetadata {
  userId?: string;
  sessionToken?: string;
  contextSize: number;
  totalTokens: number;
  cost?: number;
}

// Widget types
export interface WidgetConfig {
  agentId: string;
  agentManagerCanisterId: string;
  containerId: string;
  network?: 'local' | 'ic';
  theme?: WidgetTheme;
  position?: WidgetPosition;
  size?: WidgetSize;
  apiKey?: string;
  customStyles?: WidgetStyles;
}

export type WidgetTheme = 'light' | 'dark' | 'auto';
export type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'inline';
export type WidgetSize = 'small' | 'medium' | 'large' | 'custom';

export interface WidgetStyles {
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  width?: string;
  height?: string;
  maxHeight?: string;
  zIndex?: number;
}

// Event types
export interface SDKEventMap {
  'agent:loaded': { agent: Agent };
  'agent:error': { error: Error; agentId: string };
  'chat:message': { message: ChatMessage; sessionId: string };
  'chat:response': { message: ChatMessage; sessionId: string };
  'chat:error': { error: Error; sessionId: string };
  'widget:open': { widgetId: string };
  'widget:close': { widgetId: string };
  'widget:minimize': { widgetId: string };
  'widget:maximize': { widgetId: string };
  'session:start': { session: ChatSession };
  'session:end': { sessionId: string };
}

export type SDKEventCallback<T extends keyof SDKEventMap> = (data: SDKEventMap[T]) => void;

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  status: { 'Active': null } | { 'Inactive': null } | { 'Suspended': null };
  created: bigint;
  updated: bigint;
  ownerId: string;
  config: {
    personality: {
      traits: string[];
      tone: string;
      style: string;
    };
    behavior: {
      responseLength: { 'Short': null } | { 'Medium': null } | { 'Long': null };
      temperature: number;
      creativity: number;
    };
    appearance: {
      primaryColor: string;
      secondaryColor: string;
      borderRadius: string;
      avatar?: string;
    };
    knowledgeBase: Array<{
      content: string;
      sourceType: { 'Manual': null } | { 'Document': null } | { 'URL': null };
      metadata: Array<[string, string]>;
    }>;
  };
}

export interface ChatResponse {
  response: string;
  confidence: number;
  tokensUsed: number;
  contextId: string;
  processingTime: number;
}

// Hook types for React integration
export interface UseCanistChatOptions {
  agentManagerCanisterId: string;
  network?: 'local' | 'ic';
  apiKey?: string;
  autoConnect?: boolean;
}

export interface UseAgentOptions {
  agentId: string;
  autoLoad?: boolean;
}

export interface UseChatSessionOptions {
  agentId: string;
  autoStart?: boolean;
  persistSession?: boolean;
}

// Utility types
export type NetworkType = 'local' | 'ic';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

// Error types
export class SDKError extends Error {
  public code: string;
  public details?: any;
  
  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
    this.details = details;
  }
}

export class AgentError extends SDKError {
  constructor(message: string, agentId: string, details?: any) {
    super(message, 'AGENT_ERROR', { agentId, ...details });
    this.name = 'AgentError';
  }
}

export class ChatError extends SDKError {
  constructor(message: string, sessionId: string, details?: any) {
    super(message, 'CHAT_ERROR', { sessionId, ...details });
    this.name = 'ChatError';
  }
}

export class WidgetError extends SDKError {
  constructor(message: string, widgetId: string, details?: any) {
    super(message, 'WIDGET_ERROR', { widgetId, ...details });
    this.name = 'WidgetError';
  }
} 