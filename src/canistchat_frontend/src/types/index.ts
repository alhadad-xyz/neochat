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
  config: {
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
  };
}

// Agent creation form types
export interface AgentFormData {
  name: string;
  description: string;
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