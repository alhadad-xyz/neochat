import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

// Auth types
export interface AuthState {
  authClient: AuthClient | null;
  identity: Identity | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive' | 'Draft';
  created: string;
  lastUpdated?: string;
  avatar?: string;
  config: {
    personality: {
      traits: string[];
      tone: string;
      responseStyle: string;
    };
    knowledgeBase: {
      documents: string[];
      sources: Array<{
        type: 'Manual' | 'URL' | 'Document' | 'API' | 'Database';
        content: string;
        url?: string;
        metadata?: {
          fileName?: string;
          fileSize?: number;
          fileType?: string;
          apiEndpoint?: string;
          hasApiKey?: boolean;
          database?: string;
          query?: string;
        };
      }>;
      context: string;
    };
    behavior: {
      maxResponseLength: number;
      conversationMemory: boolean;
      escalationRules: string[];
    };
    appearance: {
      avatar?: string;
      theme: string;
      welcomeMessage: string;
    };
  };
}

// Agent creation form types
export interface AgentFormData {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  personality: {
    traits: string[];
    tone: string;
    responseStyle: string;
    communicationStyle: 'Conversational' | 'Creative' | 'Educational' | 'Professional' | 'Technical';
    responsePattern: 'Concise' | 'Detailed' | 'Narrative' | 'Structured';
  };
  knowledgeBase: {
    documents: string[];
    sources: Array<{
      type: 'Manual' | 'URL' | 'Document' | 'API' | 'Database';
      content: string;
      url?: string;
      metadata?: {
        fileName?: string;
        fileSize?: number;
        fileType?: string;
        apiEndpoint?: string;
        hasApiKey?: boolean;
        database?: string;
        query?: string;
      };
    }>;
    context: string;
  };
  behavior: {
    maxResponseLength: number;
    conversationMemory: boolean;
    escalationRules: string[];
    temperature: number;
    creativity: number;
    topP: number;
    contextWindow: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
    systemPromptTemplate: string;
  };
  appearance: {
    avatar: string;
    theme: string;
    welcomeMessage: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    borderRadius: string;
    customCSS: string;
    fontFamily: string;
    fontSize: string;
  };
  contextSettings: {
    enableLearning: boolean;
    enableMemory: boolean;
    maxContextMessages: number;
    memoryDuration: number;
  };
  integrationSettings: {
    allowedOrigins: string[];
    rateLimiting: {
      enabled: boolean;
      maxRequestsPerHour: number;
      maxTokensPerHour: number;
    };
    webhooks: Array<{
      enabled: boolean;
      events: string[];
      url: string;
    }>;
  };
}

// Message types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
  isError?: boolean;
}

// User profile types
export interface UserProfile {
  userId: string;
  tier: string;
  balance: number;
  currency: string;
  joinDate: string;
  totalAgents: number;
  totalConversations: number;
  totalMessages: number;
}

export interface UsageData {
  currentMonth: {
    messages: number;
    tokensUsed: number;
    cost: number;
  };
  lastMonth: {
    messages: number;
    tokensUsed: number;
    cost: number;
  };
  billing: {
    date: string;
    amount: number;
    description: string;
  }[];
}

// Component prop types
export interface AgentCreatorProps {
  sessionToken: string | null;
  onAgentCreated: () => void;
}

export interface AgentListProps {
  sessionToken: string | null;
  onSelectAgent: (agent: Agent | null) => void;
  selectedAgent: Agent | null;
}

export interface ChatInterfaceProps {
  sessionToken: string | null;
  agent: Agent;
}

export interface UserProfileProps {
  sessionToken: string | null;
  identity: Identity | null;
}

// Theme types
export interface Theme {
  id: string;
  name: string;
  color: string;
}

export interface PersonalityTrait {
  id: string;
  name: string;
}

// Tab types
export interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// Navigation types for enterprise sidebar
export interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  disabled?: boolean;
  count?: number;
}

// Analytics types
export interface AnalyticsData {
  totalAgents: Array<{
    agentId: string;
    agentName: string;
    messages: number;
    conversations: number;
    avgResponseTime: number;
    satisfaction: number;
  }>;
  totalMessages: Array<{
    date: string;
    count: number;
  }>;
  activeUsers: Array<{
    date: string;
    count: number;
  }>;
  systemUptime: number;
  averageResponseTime: Array<{
    date: string;
    time: number;
  }>;
  errorRate: number;
} 