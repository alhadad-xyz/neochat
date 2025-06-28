import React, { useState, useEffect, useRef } from 'react';
import { Agent, Message } from '../types';
import { canisterService } from '../services/canisterService';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui/avatar';

interface DebugInfo {
  stage?: string;
  error?: string;
  agentResponse?: any;
  convertedAgent?: Agent;
  fullError?: unknown;
}

/**
 * Embed Chat Interface Component
 * 
 * A simplified chat interface specifically designed for embed widgets.
 * It doesn't show the sidebar and automatically uses the provided agent.
 */
interface EmbedChatInterfaceProps {
  agent: Agent;
  sessionToken: string | null;
  placeholder?: string;
}

const EmbedChatInterface: React.FC<EmbedChatInterfaceProps> = ({ agent, sessionToken, placeholder = "Type your message..." }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Saves conversation history to localStorage for session persistence
   * Uses a combination of agent ID and session token as the storage key
   */
  useEffect(() => {
    if (messages.length > 0 && sessionToken && agent?.id) {
      try {
        const historyKey = `canistchat_history_${agent.id}_${sessionToken}`;
        localStorage.setItem(historyKey, JSON.stringify(messages));
      } catch (error) {
        console.error('💬 Session Debug - Error saving conversation history:', error);
      }
    }
  }, [messages, sessionToken, agent?.id]);

  /**
   * Loads conversation history and adds welcome message when agent loads
   * Prioritizes saved conversation history over welcome message
   */
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (sessionToken) {
        try {
          // Try to load conversation history from localStorage
          const historyKey = `canistchat_history_${agent.id}_${sessionToken}`;
          const savedHistory = localStorage.getItem(historyKey);
          
          if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            // Convert timestamp strings back to Date objects
            const convertedHistory = parsedHistory.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(convertedHistory);
            return; // Skip welcome message if we have history
          }
        } catch (error) {
          console.error('💬 Session Debug - Error loading conversation history:', error);
        }
      }

      // Add welcome message only if no history was loaded
      if (agent && agent.config.appearance.welcomeMessage) {
        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}`,
          content: agent.config.appearance.welcomeMessage,
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    if (agent) {
      loadConversationHistory();
    }
  }, [agent, sessionToken]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /**
   * Handles sending messages to the agent
   * Uses public chat processing for embed widgets
   * @param messageContent - The message content to send
   */
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to backend using public method for embed widgets
      const response = await canisterService.processChatPublic(agent.id, messageContent, sessionToken || '');
      
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar
            src={agent.config?.appearance?.avatar}
            fallback={agent.name?.charAt(0).toUpperCase() || 'A'}
            alt={`${agent.name} avatar`}
            size="md"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {agent.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {agent.description}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${
              msg.sender === 'agent' ? 'flex-row' : 'flex-row-reverse space-x-reverse'
            }`}>
              {msg.sender === 'agent' && (
                <Avatar
                  src={agent.config?.appearance?.avatar}
                  fallback={agent.name?.charAt(0).toUpperCase() || 'A'}
                  alt={`${agent.name} avatar`}
                  size="sm"
                  className="flex-shrink-0"
                />
              )}
              <div className={`rounded-lg px-4 py-2 ${
                msg.sender === 'agent'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'bg-blue-500 text-white'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'agent' ? 'text-gray-500' : 'text-blue-100'
                }`}>
                  {msg.sender === 'agent' ? agent.name : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <Avatar
                src={agent.config?.appearance?.avatar}
                fallback={agent.name?.charAt(0).toUpperCase() || 'A'}
                alt={`${agent.name} avatar`}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
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

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
                         placeholder={placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const EmbedRoute: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});

  /**
   * Extracts and validates URL parameters for agent ID and session
   * Generates session token if not provided
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('agentId');
    const sessionId = urlParams.get('sessionId');
    const debugMode = urlParams.get('debug') === 'true';
    const testMode = urlParams.get('test') === 'true';

    // Set session token
    setSessionToken(sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    if (!agentId) {
      setError('No agent ID provided');
      setLoading(false);
      return;
    }

    /**
     * Loads agent data from canister service
     * Handles both production and test scenarios
     */
    const loadAgent = async () => {
      try {
        setLoading(true);
        setError(null);
        
                 // Initialize canister service if needed
         if (!canisterService.isReady()) {
           await canisterService.waitForReady();
         }

        let loadedAgent: Agent;

        try {
          // Try to load the agent from the canister
          const agentResponse = await canisterService.getAgentPublic(agentId);
          
                     // Convert AgentResponse to Agent format
           const statusString = 'Active' in agentResponse.status ? 'Active' :
                               'Inactive' in agentResponse.status ? 'Inactive' : 'Draft';
           
           loadedAgent = {
             id: agentResponse.id,
             name: agentResponse.name,
             description: agentResponse.description,
             status: statusString,
             created: agentResponse.created.toString(),
            avatar: agentResponse.config.appearance.avatar?.[0],
            config: {
              personality: {
                traits: agentResponse.config.personality.traits,
                tone: agentResponse.config.personality.tone,
                responseStyle: agentResponse.config.personality.style
              },
              knowledgeBase: {
                documents: [],
                sources: agentResponse.config.knowledgeBase.map(kb => ({
                  type: Object.keys(kb.sourceType)[0] as any,
                  content: kb.content,
                  metadata: Object.fromEntries(kb.metadata)
                })),
                context: agentResponse.config.knowledgeBase[0]?.content || ''
              },
              behavior: {
                maxResponseLength: 500, // Default value
                conversationMemory: agentResponse.config.contextSettings.enableMemory,
                escalationRules: []
              },
              appearance: {
                avatar: agentResponse.config.appearance.avatar?.[0],
                theme: 'default',
                welcomeMessage: 'Hello! How can I help you today?'
              }
            }
          };
          
        } catch (err) {
          console.error('💬 Session Debug - Failed to load agent:', err);
          
          // Fallback: Create a demo agent for testing
          if (testMode) {
            loadedAgent = {
              id: agentId,
              name: 'Demo Agent',
              description: 'A demonstration agent for testing purposes',
              status: { 'Active': null } as any,
              created: Date.now().toString(),
              avatar: undefined,
              config: {
                personality: {
                  traits: ['helpful', 'friendly'],
                  tone: 'professional',
                  responseStyle: 'conversational'
                },
                knowledgeBase: {
                  documents: [],
                  sources: [],
                  context: 'I am a demo agent created for testing the embed functionality.'
                },
                behavior: {
                  maxResponseLength: 500,
                  conversationMemory: true,
                  escalationRules: []
                },
                appearance: {
                  avatar: undefined,
                  theme: 'default',
                  welcomeMessage: 'Hello! I\'m a demo agent. How can I help you today?'
                }
              }
            };
          } else {
            throw err;
          }
        }

        setAgent(loadedAgent);
        setDebugInfo({
          stage: 'agent_loaded',
          convertedAgent: loadedAgent
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load agent';
        setError(errorMessage);
        setDebugInfo({
          stage: 'error',
          error: errorMessage,
          fullError: error
        });
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, []);

  // Add debug panel in development mode
  const renderDebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 9999
      }}>
        <h4>Debug Info</h4>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    );
  };

  // Add custom CSS for embed styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
              :root {
         --primary-color: #4F46E5;
        }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }
      
      .embed-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
                 background: #FFFFFF;
      }
      
      .embed-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #F9FAFB;
        color: #374151;
      }
      
      .embed-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: #F9FAFB;
        color: #374151;
        text-align: center;
        padding: 20px;
      }
      
      .spinner {
        animation: spin 1s linear infinite;
        width: 24px;
        height: 24px;
        border: 2px solid transparent;
        border-top: 2px solid var(--primary-color);
        border-radius: 50%;
        margin-right: 12px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .error-icon {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #EF4444;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
      }, [agent]);

  if (loading) {
    return (
      <div className="embed-loading">
        <div className="spinner"></div>
        <span>Loading NeoChat...</span>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="embed-error">
        <div>
            <svg 
            className="error-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            Chat Unavailable
          </h2>
          <p style={{ margin: '0', fontSize: '14px', opacity: '0.8' }}>
            {error || 'Agent not found'}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: '0.6' }}>
            Please check the widget configuration and try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '10px', fontSize: '11px', textAlign: 'left' }}>
              <strong>Debug Info:</strong>
              <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="embed-container">
      {/* Embedded Chat Interface */}
      {agent && (
        <div className="h-full flex flex-col">
          {/* Demo Mode Indicator */}
          {error && error.includes('Demo mode') && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
      </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Demo Mode:</strong> This widget is running in demonstration mode. 
                    Real agent functionality may not be available.
        </p>
      </div>
              </div>
            </div>
          )}
          
          {/* Chat Interface */}
          <div className="flex-1 min-h-0">
            <EmbedChatInterface agent={agent} sessionToken={sessionToken} placeholder="Type your message..." />
          </div>
        </div>
      )}
      
      {renderDebugPanel()}
    </div>
  );
};

export default EmbedRoute; 