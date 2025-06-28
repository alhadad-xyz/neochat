/**
 * @fileoverview NeoChat Main Chat Interface Component
 * 
 * This component provides the primary chat interface for interacting with NeoChat agents.
 * It handles real-time messaging, agent interactions, and chat state management.
 * 
 * Features:
 * - Real-time chat with AI agents
 * - Message history and persistence (localStorage + backend)
 * - Conversation history loading and restoration
 * - Typing indicators and status updates
 * - Responsive design for mobile and desktop
 * - Integration with NeoChat backend services
 * - Agent selection and switching
 * - Mobile-responsive sidebar navigation
 * - Debug logging for troubleshooting
 * 
 * @author NeoChat Development Team
 * @version 2.1.0
 * @since 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChatInterfaceProps, Message, Agent } from '../types';
import { canisterService } from '../services/canisterService';
import { Avatar } from '@/components/ui/avatar';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatArea from '../components/chat/ChatArea';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

/** Local storage key for conversation history backup */
const CONVERSATION_STORAGE_KEY = 'neochat_conversations';

/** Maximum number of messages to store per conversation */
const MAX_MESSAGES_PER_CONVERSATION = 100;

/** Debug logging configuration */
const DEBUG_LOGGING = true;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debug logging utility
 * @param context - Context identifier for the log
 * @param message - Log message
 * @param data - Optional data to log
 */
const debugLog = (context: string, message: string, data?: any) => {
  if (DEBUG_LOGGING) {
    const timestamp = new Date().toISOString();
    console.log(`[ChatInterface:${context}] ${timestamp} - ${message}`, data || '');
  }
};

/**
 * Get conversation storage key for specific agent
 * @param agentId - Agent ID
 * @returns Storage key string
 */
const getConversationStorageKey = (agentId: string): string => {
  return `${CONVERSATION_STORAGE_KEY}_${agentId}`;
};

/**
 * Save conversation to localStorage
 * @param agentId - Agent ID
 * @param messages - Messages to save
 */
const saveConversationToStorage = (agentId: string, messages: Message[]): void => {
  try {
    const storageKey = getConversationStorageKey(agentId);
    const conversationData = {
      agentId,
      messages: messages.slice(-MAX_MESSAGES_PER_CONVERSATION), // Keep only recent messages
      lastUpdated: new Date().toISOString(),
      version: '2.1.0'
    };
    localStorage.setItem(storageKey, JSON.stringify(conversationData));
    debugLog('Storage', `Saved conversation for agent ${agentId}`, { 
      messageCount: messages.length, 
      storageKey, 
      messages: messages.map((m: Message) => ({id: m.id, sender: m.sender, content: m.content.substring(0, 50)}))
    });
  } catch (error) {
    debugLog('Storage', `Failed to save conversation for agent ${agentId}`, error);
  }
};

/**
 * Load conversation from localStorage
 * @param agentId - Agent ID
 * @returns Array of messages or empty array
 */
const loadConversationFromStorage = (agentId: string): Message[] => {
  try {
    const storageKey = getConversationStorageKey(agentId);
    const storedData = localStorage.getItem(storageKey);
    
    debugLog('Storage', `Loading conversation for agent ${agentId}`, { 
      storageKey, 
      hasStoredData: !!storedData 
    });
    
    if (!storedData) {
      debugLog('Storage', `No stored conversation found for agent ${agentId}`);
      return [];
    }

    const conversationData = JSON.parse(storedData);
    
    // Validate stored data structure
    if (!conversationData.messages || !Array.isArray(conversationData.messages)) {
      debugLog('Storage', `Invalid stored conversation data for agent ${agentId}`, conversationData);
      return [];
    }

    // Validate that the stored agent ID matches the requested agent ID
    if (conversationData.agentId !== agentId) {
      debugLog('Storage', `Agent ID mismatch in stored data for ${agentId}`, { 
        requestedAgentId: agentId, 
        storedAgentId: conversationData.agentId 
      });
      return [];
    }

    // Convert timestamp strings back to Date objects
    const messages = conversationData.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    debugLog('Storage', `Loaded conversation for agent ${agentId}`, { 
      messageCount: messages.length,
      messages: messages.map((m: Message) => ({id: m.id, sender: m.sender, content: m.content.substring(0, 50)}))
    });
    return messages;
  } catch (error) {
    debugLog('Storage', `Failed to load conversation for agent ${agentId}`, error);
    return [];
  }
};

/**
 * Clear conversation from localStorage
 * @param agentId - Agent ID
 */
const clearConversationFromStorage = (agentId: string): void => {
  try {
    const storageKey = getConversationStorageKey(agentId);
    localStorage.removeItem(storageKey);
    debugLog('Storage', `Cleared conversation for agent ${agentId}`);
  } catch (error) {
    debugLog('Storage', `Failed to clear conversation for agent ${agentId}`, error);
  }
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the EnhancedChatArea component
 * 
 * This component is extracted outside the main component to prevent
 * unnecessary re-renders on every keystroke.
 */
interface EnhancedChatAreaProps {
  /** Currently selected agent ID */
  selectedAgent: string | null;
  /** Current agent object with full details */
  currentAgent: Agent | null;
  /** Array of chat messages */
  messages: Message[];
  /** Whether the chat is currently loading */
  isLoading: boolean;
  /** Current input message text */
  inputMessage: string;
  /** Reference to the input field */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Reference to the messages end for auto-scrolling */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  /** Whether mobile sidebar is open */
  isMobileSidebarOpen: boolean;
  /** Function to set mobile sidebar open state */
  setIsMobileSidebarOpen: (open: boolean) => void;
  /** Function to set input message */
  setInputMessage: (message: string) => void;
  /** Function to handle sending messages */
  handleSendMessage: (message: string) => void;
}

/**
 * Enhanced Chat Area Component
 * 
 * Renders the main chat interface with messages, input, and agent information.
 * Extracted outside main component to prevent unnecessary re-renders.
 * 
 * @param props - Component props for chat area functionality
 * @returns JSX element for the chat area
 */
const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  selectedAgent,
  currentAgent,
  messages,
  isLoading,
  inputMessage,
  inputRef,
  messagesEndRef,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  setInputMessage,
  handleSendMessage
}) => {
  // Show placeholder when no agent is selected
  if (!selectedAgent || !currentAgent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <PaperAirplaneIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select an agent to start chatting
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Choose an agent from the sidebar to begin a conversation
          </p>
          <button 
            className="mt-4 md:hidden px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            Select Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Mobile Header with Agent Selector */}
      <div className="md:hidden p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center space-x-3 w-full"
        >
          <Avatar
            src={currentAgent.config?.appearance?.avatar}
            fallback={currentAgent.name?.charAt(0).toUpperCase() || 'A'}
            alt={`${currentAgent.name} avatar`}
            size="sm"
          />
          <div className="flex-1 text-left">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {currentAgent.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Tap to switch agents • {messages.length} messages
            </p>
          </div>
          <div className="text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Desktop Chat Header */}
      <div className="hidden md:block p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar
            src={currentAgent.config?.appearance?.avatar}
            fallback={currentAgent.name}
            alt={`${currentAgent.name} avatar`}
            size="md"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentAgent.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentAgent.description} • {messages.length} messages in conversation
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {messages.length > 0 && (
              <span>Last message: {messages[messages.length - 1]?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] md:max-w-xs lg:max-w-md ${
              msg.sender === 'agent' ? 'flex-row' : 'flex-row-reverse space-x-reverse'
            }`}>
              {msg.sender === 'agent' && (
                <Avatar
                  src={msg.agentAvatar || currentAgent?.config?.appearance?.avatar}
                  fallback={msg.agentInitial || currentAgent?.name?.charAt(0).toUpperCase() || 'A'}
                  alt={`${msg.agentName || currentAgent?.name || 'Agent'} avatar`}
                  size="sm"
                  className="flex-shrink-0"
                />
              )}
              <div className={`rounded-lg px-3 md:px-4 py-2 ${
                msg.sender === 'agent'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'bg-blue-500 text-white'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'agent' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {msg.sender === 'agent' ? (msg.agentName || currentAgent.name) : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <Avatar
                src={currentAgent?.config?.appearance?.avatar}
                fallback={currentAgent?.name?.charAt(0).toUpperCase() || 'A'}
                alt={`${currentAgent?.name || 'Agent'} avatar`}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 md:px-4 py-2 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputMessage.trim()) {
                    handleSendMessage(inputMessage);
                    setInputMessage('');
                  }
                }
              }}
              placeholder="Type your message..."
              className="chat-input w-full px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => {
              if (inputMessage.trim() && !isLoading) {
                handleSendMessage(inputMessage);
                setInputMessage('');
              }
            }}
            disabled={!inputMessage.trim() || isLoading}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
              inputMessage.trim() && !isLoading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        {messages.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {messages.length} messages • Conversation auto-saved
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * NeoChat Main Chat Interface Component
 * 
 * Provides the primary chat interface for interacting with NeoChat agents.
 * Handles agent selection, message management, and real-time chat functionality.
 * 
 * @param props - Component props containing session token and agent information
 * @returns JSX element for the complete chat interface
 * 
 * @example
 * ```tsx
 * <ChatInterface 
 *   sessionToken="user-session-token"
 *   agent={selectedAgent}
 * />
 * ```
 */
const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionToken, agent }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Currently selected agent ID */
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  /** Array of available agents */
  const [agents, setAgents] = useState<Agent[]>([]);
  
  /** Array of chat messages */
  const [messages, setMessages] = useState<Message[]>([]);
  
  /** Current input message text */
  const [inputMessage, setInputMessage] = useState<string>('');
  
  /** Whether the chat is currently loading */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /** Whether mobile sidebar is open */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  /** Whether agents are being fetched */
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);

  /** Whether conversation history is being loaded */
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  /** Conversation context ID for analytics tracking */
  const [conversationId, setConversationId] = useState<string | null>(null);

  /** Performance metrics for analytics */
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalMessages: number;
    successfulMessages: number;
    failedMessages: number;
    totalResponseTime: number;
    averageResponseTime: number;
    successRate: number;
    lastMessageTime: number | null;
  }>({
    totalMessages: 0,
    successfulMessages: 0,
    failedMessages: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    successRate: 100,
    lastMessageTime: null
  });

  // ============================================================================
  // REFS
  // ============================================================================

  /** Reference to the input field for focus management */
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  /** Reference to the messages end for auto-scrolling */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Converts agent response from backend to Agent type
   * 
   * @param agentResponse - Raw agent response from backend
   * @returns Properly typed Agent object
   */
  const convertAgentResponseToAgent = (agentResponse: any): Agent => {
    const getStatusString = (status: any): 'Active' | 'Inactive' | 'Draft' => {
      if ('Active' in status) return 'Active';
      if ('Inactive' in status) return 'Inactive';
      if ('Suspended' in status) return 'Inactive'; // Treat suspended as inactive
      if ('Archived' in status) return 'Draft'; // Treat archived as draft
      return 'Draft';
    };

    return {
      id: agentResponse.id,
      name: agentResponse.name,
      description: agentResponse.description,
      status: getStatusString(agentResponse.status),
      created: new Date(agentResponse.created).toISOString(),
      config: {
        personality: {
          traits: agentResponse.config?.personality?.traits || [],
          tone: agentResponse.config?.personality?.tone || 'friendly',
          responseStyle: agentResponse.config?.personality?.responseStyle || 'balanced'
        },
        knowledgeBase: {
          documents: agentResponse.config?.knowledge?.customKnowledge || [],
          sources: agentResponse.config?.knowledge?.dataSources || [],
          context: ''
        },
        behavior: {
          maxResponseLength: 2000,
          conversationMemory: true,
          escalationRules: []
        },
        appearance: {
          avatar: agentResponse.config?.appearance?.avatar || agentResponse.name.charAt(0).toUpperCase(),
          theme: agentResponse.config?.appearance?.theme || 'default',
          welcomeMessage: `Hello! I'm ${agentResponse.name}. How can I help you today?`
        }
      }
    };
  };

  /**
   * Generate a unique conversation ID
   * @returns Unique conversation identifier
   */
  const generateConversationId = (): string => {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Load conversation history from backend and localStorage
   * @param agentId - Agent ID to load history for
   */
  const loadConversationHistory = async (agentId: string): Promise<void> => {
    debugLog('History', `Loading conversation history for agent ${agentId}`);
    debugLog('Debug', `Current localStorage for agent ${agentId}:`, getConversationStorageKey(agentId));

    try {
      // First, try to load from localStorage for immediate display
      const localMessages = loadConversationFromStorage(agentId);
      debugLog('Debug', `Loaded ${localMessages.length} messages for agent ${agentId}:`, localMessages);
      
      if (localMessages.length > 0) {
        setMessages(localMessages);
        debugLog('History', `Loaded ${localMessages.length} messages from localStorage`);
      } else {
        debugLog('Storage', `No stored conversation found for agent ${agentId}`);
        // Ensure messages are cleared when no stored conversation exists
        setMessages([]);
      }

      // Only show loading indicator and fetch from backend if we have localStorage data or expect backend data
      if (localMessages.length > 0) {
        setIsLoadingHistory(true);
        
        try {
          const backendHistory = await canisterService.getAgentConversationHistory(agentId, 50);
          if (backendHistory && backendHistory.length > 0) {
            // Convert backend conversation history to messages
            const backendMessages: Message[] = [];
            backendHistory.forEach(conversation => {
              // Add messages from conversation history
              // Note: This is a simplified conversion - you might need to adjust based on actual backend structure
              debugLog('History', `Processing conversation ${conversation.contextId}`, conversation);
            });

            // For now, keep localStorage messages as primary source
            // In a full implementation, you'd merge and deduplicate messages from both sources
            debugLog('History', `Found ${backendHistory.length} conversations in backend`);
          }
        } catch (backendError) {
          debugLog('History', 'Failed to load from backend, using localStorage only', backendError);
        } finally {
          setIsLoadingHistory(false);
        }
      }

    } catch (error) {
      debugLog('History', `Failed to load conversation history for agent ${agentId}`, error);
      setIsLoadingHistory(false);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch agents on component mount
   */
  useEffect(() => {
    const fetchAgents = async () => {
      debugLog('Init', 'Starting agent fetch');
      try {
        setIsLoadingAgents(true);
        const response = await canisterService.getUserAgents();
        const convertedAgents = response.map(convertAgentResponseToAgent);
        setAgents(convertedAgents);
        debugLog('Init', `Fetched ${convertedAgents.length} agents`);
        
        // Auto-select first agent if available
        if (convertedAgents.length > 0 && !selectedAgent) {
          const firstAgent = convertedAgents[0];
          setSelectedAgent(firstAgent.id);
          debugLog('Init', `Auto-selected agent: ${firstAgent.name} (${firstAgent.id})`);
        }
      } catch (error) {
        debugLog('Init', 'Failed to fetch agents', error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  /**
   * Load conversation history when agent changes
   */
  useEffect(() => {
    if (selectedAgent) {
      debugLog('AgentChange', `Agent changed to ${selectedAgent}`);
      
      // Clear messages immediately to prevent cross-agent contamination
      setMessages([]);
      
      // Generate new conversation ID for analytics tracking
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      debugLog('Analytics', `Generated conversation ID: ${newConversationId}`);

      // Load conversation history
      loadConversationHistory(selectedAgent);
    } else {
      setMessages([]);
      setConversationId(null);
      debugLog('AgentChange', 'No agent selected, cleared messages and conversation ID');
    }
  }, [selectedAgent]);

  /**
   * Save messages to localStorage whenever messages change
   */
  useEffect(() => {
    if (selectedAgent && messages.length > 0) {
      // Use a small delay to prevent saving during rapid agent switching
      const timeoutId = setTimeout(() => {
        saveConversationToStorage(selectedAgent, messages);
        debugLog('Persistence', `Saved ${messages.length} messages for agent ${selectedAgent}`);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedAgent, messages]);

  /**
   * Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Focus input when agent changes
   */
  useEffect(() => {
    if (selectedAgent && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedAgent]);

  // ============================================================================
  // MESSAGE HANDLING FUNCTIONS
  // ============================================================================

  /**
   * Handles sending a message to the selected agent
   * 
   * @param messageContent - The message content to send
   */
  const handleSendMessage = async (messageContent: string) => {
    if (!selectedAgent || !messageContent.trim()) {
      debugLog('SendMessage', 'Cannot send message - no agent selected or empty message');
      return;
    }

    const messageId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    const startTime = performance.now(); // Track response time

    debugLog('SendMessage', `Sending message to agent ${selectedAgent}`, { 
      messageId, 
      content: messageContent.substring(0, 100) + (messageContent.length > 100 ? '...' : ''),
      conversationId,
      startTime 
    });

    // Add user message to chat
    const userMessage: Message = {
      id: messageId,
      content: messageContent,
      sender: 'user',
      timestamp
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      debugLog('SendMessage', `Added user message, total messages: ${newMessages.length}`);
      return newMessages;
    });
    setIsLoading(true);

    try {
      // Send message to backend with analytics tracking
      debugLog('SendMessage', 'Calling canisterService.processChat', { 
        agentId: selectedAgent, 
        sessionToken: sessionToken ? 'present' : 'missing',
        conversationId 
      });

      const response = await canisterService.processChat(
        selectedAgent, 
        messageContent, 
        sessionToken || ''
      );
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      debugLog('SendMessage', 'Received response from agent', { 
        responseLength: response.length,
        responseTime: `${responseTime.toFixed(2)}ms`,
        conversationId 
      });

      // Add agent response to chat
      const agentMessageId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const currentAgentData = agents.find(a => a.id === selectedAgent);
      const agentMessage: Message = {
        id: agentMessageId,
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        agentName: currentAgentData?.name,
        agentAvatar: currentAgentData?.config?.appearance?.avatar,
        agentInitial: currentAgentData?.name?.charAt(0).toUpperCase()
      };

      setMessages(prev => {
        const newMessages = [...prev, agentMessage];
        debugLog('SendMessage', `Added agent response, total messages: ${newMessages.length}`);
        return newMessages;
      });

      // Update performance metrics for successful message
      setPerformanceMetrics(prev => {
        const newTotalMessages = prev.totalMessages + 1;
        const newSuccessfulMessages = prev.successfulMessages + 1;
        const newTotalResponseTime = prev.totalResponseTime + responseTime;
        const newAverageResponseTime = newTotalResponseTime / newSuccessfulMessages;
        const newSuccessRate = (newSuccessfulMessages / newTotalMessages) * 100;

        const newMetrics = {
          totalMessages: newTotalMessages,
          successfulMessages: newSuccessfulMessages,
          failedMessages: prev.failedMessages,
          totalResponseTime: newTotalResponseTime,
          averageResponseTime: newAverageResponseTime,
          successRate: newSuccessRate,
          lastMessageTime: responseTime
        };

        debugLog('Performance', 'Updated metrics for successful message', newMetrics);
        return newMetrics;
      });

      // Record message usage for analytics tracking
      try {
        const usageRecordId = await canisterService.recordMessageUsage(
          selectedAgent, 
          messageContent.length + response.length // Estimate tokens based on message length
        );
        debugLog('Analytics', 'Message usage recorded', { usageRecordId });
      } catch (analyticsError) {
        debugLog('Analytics', 'Failed to record message usage', analyticsError);
      }

      // Record performance metrics
      try {
        await canisterService.recordPerformanceMetrics(selectedAgent, responseTime, true);
        debugLog('Performance', 'Performance metrics recorded for successful message', { responseTime, success: true });
      } catch (performanceError) {
        debugLog('Performance', 'Failed to record performance metrics', performanceError);
      }

      debugLog('Analytics', 'Message exchange completed successfully', {
        userMessageId: messageId,
        agentMessageId,
        conversationId,
        responseTime: `${responseTime.toFixed(2)}ms`,
        totalMessages: messages.length + 2 // +2 for the messages we just added
      });

    } catch (error) {
      debugLog('SendMessage', 'Failed to send message', error);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Update performance metrics for failed message
      setPerformanceMetrics(prev => {
        const newTotalMessages = prev.totalMessages + 1;
        const newFailedMessages = prev.failedMessages + 1;
        const newSuccessRate = prev.successfulMessages > 0 ? (prev.successfulMessages / newTotalMessages) * 100 : 0;

        const newMetrics = {
          totalMessages: newTotalMessages,
          successfulMessages: prev.successfulMessages,
          failedMessages: newFailedMessages,
          totalResponseTime: prev.totalResponseTime,
          averageResponseTime: prev.averageResponseTime,
          successRate: newSuccessRate,
          lastMessageTime: responseTime
        };

        debugLog('Performance', 'Updated metrics for failed message', newMetrics);
        return newMetrics;
      });

      // Record performance metrics for failed message
      try {
        await canisterService.recordPerformanceMetrics(selectedAgent, responseTime, false);
        debugLog('Performance', 'Performance metrics recorded for failed message', { responseTime, success: false });
      } catch (performanceError) {
        debugLog('Performance', 'Failed to record performance metrics for error', performanceError);
      }
      
      // Add error message
      const currentAgentData = agents.find(a => a.id === selectedAgent);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        agentName: currentAgentData?.name,
        agentAvatar: currentAgentData?.config?.appearance?.avatar,
        agentInitial: currentAgentData?.name?.charAt(0).toUpperCase(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles selecting an agent for chat
   * 
   * @param agentId - The ID of the agent to select
   */
  const handleSelectAgent = (agentId: string) => {
    debugLog('AgentSelect', `Selecting agent: ${agentId}`);
    debugLog('Debug', `Switching from agent ${selectedAgent} to ${agentId}`);
    
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      // Save current conversation before switching (if there are messages)
      if (selectedAgent && messages.length > 0) {
        debugLog('Debug', `Saving ${messages.length} messages for agent ${selectedAgent} before switch`);
      }
      
      // Clear current state to prevent cross-contamination
      setMessages([]);
      setIsLoading(false);
      setIsLoadingHistory(false);
      
      // Set new agent
      setSelectedAgent(agentId);
      setIsMobileSidebarOpen(false); // Close mobile sidebar
      debugLog('AgentSelect', `Successfully selected agent: ${agent.name} (${agentId})`);
    } else {
      debugLog('AgentSelect', `Agent not found: ${agentId}`);
    }
  };

  /**
   * Clear conversation history for current agent
   */
  const handleClearConversation = () => {
    if (selectedAgent) {
      setMessages([]);
      clearConversationFromStorage(selectedAgent);
      
      // Generate new conversation ID
      const newConversationId = generateConversationId();
      setConversationId(newConversationId);
      
      debugLog('ClearConversation', `Cleared conversation for agent ${selectedAgent}`, { newConversationId });
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Currently selected agent object */
  const currentAgent = agents.find(a => a.id === selectedAgent) || null;

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  if (isLoadingAgents) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Chat Sidebar */}
      <ChatSidebar
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        isLoading={isLoadingAgents}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {isLoadingHistory && selectedAgent && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-2">
            <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm">Loading conversation history...</span>
            </div>
          </div>
        )}
        
        <EnhancedChatArea
          selectedAgent={selectedAgent}
          currentAgent={currentAgent}
          messages={messages}
          isLoading={isLoading}
          inputMessage={inputMessage}
          inputRef={inputRef}
          messagesEndRef={messagesEndRef}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
        />
      </div>

      {/* Debug Info (only in development) */}
      {DEBUG_LOGGING && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-3 rounded-lg opacity-90 max-w-sm border border-gray-600">
          <div className="font-bold text-green-400 mb-2">🔍 Chat Debug Panel</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Agent:</span>
              <span className="text-blue-300">{selectedAgent?.substring(0, 12) || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Messages:</span>
              <span className="text-green-300">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Conv ID:</span>
              <span className="text-yellow-300">{conversationId?.substring(0, 8) || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Session:</span>
              <span className={sessionToken ? 'text-green-300' : 'text-red-300'}>
                {sessionToken ? 'Active' : 'None'}
              </span>
            </div>
            <div className="border-t border-gray-600 pt-1 mt-1">
              <div className="font-semibold text-purple-300">Performance Metrics</div>
              <div className="flex justify-between">
                <span>Total Msgs:</span>
                <span className="text-blue-300">{performanceMetrics.totalMessages}</span>
              </div>
              <div className="flex justify-between">
                <span>Success:</span>
                <span className="text-green-300">{performanceMetrics.successfulMessages}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="text-red-300">{performanceMetrics.failedMessages}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className={performanceMetrics.successRate >= 95 ? 'text-green-300' : performanceMetrics.successRate >= 80 ? 'text-yellow-300' : 'text-red-300'}>
                  {performanceMetrics.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Response:</span>
                <span className={performanceMetrics.averageResponseTime < 2000 ? 'text-green-300' : performanceMetrics.averageResponseTime < 5000 ? 'text-yellow-300' : 'text-red-300'}>
                  {performanceMetrics.averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Response:</span>
                <span className="text-cyan-300">
                  {performanceMetrics.lastMessageTime ? `${performanceMetrics.lastMessageTime.toFixed(0)}ms` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 