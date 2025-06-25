/**
 * @fileoverview NeoChat Main Chat Interface Component
 * 
 * This component provides the primary chat interface for NeoChat agents.
 * It handles real-time messaging, agent interactions, and chat state management.
 * 
 * Features:
 * - Real-time chat with AI agents
 * - Message history and persistence
 * - Typing indicators and status updates
 * - Responsive design for mobile and desktop
 * - Integration with NeoChat backend services
 * - Agent selection and switching
 * - Mobile-responsive sidebar navigation
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChatInterfaceProps, Message, Agent } from '../types';
import { canisterService } from '../services/canisterService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatArea from '../components/chat/ChatArea';

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
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
            {currentAgent.config.appearance.avatar || currentAgent.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {currentAgent.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Tap to switch agents
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
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-medium">
            {currentAgent.config.appearance.avatar || currentAgent.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentAgent.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentAgent.description}
            </p>
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
                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium flex-shrink-0">
                  {currentAgent.config.appearance.avatar || currentAgent.name.charAt(0).toUpperCase()}
                </div>
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
                  {msg.sender === 'agent' ? currentAgent.name : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium flex-shrink-0">
                {currentAgent.config.appearance.avatar || currentAgent.name.charAt(0).toUpperCase()}
              </div>
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

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch agents on component mount
   */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoadingAgents(true);
        const response = await canisterService.getUserAgents();
        const convertedAgents = response.map(convertAgentResponseToAgent);
        setAgents(convertedAgents);
        
        // Auto-select first agent if available
        if (convertedAgents.length > 0 && !selectedAgent) {
          setSelectedAgent(convertedAgents[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

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
    if (!selectedAgent || !messageContent.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await canisterService.processChat(selectedAgent, messageContent, sessionToken || '');
      
      // Add agent response to chat
      const agentMessage: Message = {
        id: `agent_${Date.now()}`,
        content: response,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date()
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
    setSelectedAgent(agentId);
    setMessages([]); // Clear messages when switching agents
    setIsMobileSidebarOpen(false); // Close mobile sidebar
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Currently selected agent object */
  const currentAgent = agents.find(a => a.id === selectedAgent) || null;

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

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
  );
};

export default ChatInterface; 