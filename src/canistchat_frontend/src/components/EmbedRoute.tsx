import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import { Agent } from '../types';
import { canisterService } from '../services/canisterService';

const EmbedRoute: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters manually
  const urlParams = new URLSearchParams(window.location.search);
  const agentId = urlParams.get('agent');
  const theme = urlParams.get('theme') || 'light';
  const primaryColor = urlParams.get('color') || '#4F46E5';
  const welcomeMessage = urlParams.get('welcome') || '';
  const placeholder = urlParams.get('placeholder') || 'Type your message...';

  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) {
        setError('No agent ID provided');
        setLoading(false);
        return;
      }

      try {
        // Wait for canister service to be ready
        console.log('Waiting for canister service to initialize...');
        await canisterService.waitForReady();
        console.log('Canister service ready, loading agent:', agentId);
        
        // Use the public method that doesn't require authentication
        const agentResponse = await canisterService.getAgentPublic(agentId);
        
        // Convert canister response to frontend Agent type
        const convertedAgent: Agent = {
          id: agentResponse.id,
          name: agentResponse.name,
          description: agentResponse.description,
          status: 'Active' in agentResponse.status ? 'Active' : 
                 'Inactive' in agentResponse.status ? 'Inactive' : 'Draft',
          created: new Date(Number(agentResponse.created) / 1000000).toISOString(),
          lastUpdated: new Date().toISOString(),
          avatar: Array.isArray(agentResponse.config.appearance.avatar) && agentResponse.config.appearance.avatar.length > 0 
            ? agentResponse.config.appearance.avatar[0] 
            : 'default',
          config: {
            personality: {
              traits: agentResponse.config.personality.traits,
              tone: agentResponse.config.personality.tone,
              responseStyle: agentResponse.config.personality.style,
            },
            knowledgeBase: {
              documents: agentResponse.config.knowledgeBase.map(kb => kb.content),
              sources: [],
              context: agentResponse.config.knowledgeBase.map(kb => kb.content).join('\n')
            },
            behavior: {
              maxResponseLength: 'Long' in agentResponse.config.behavior.responseLength ? 500 : 200,
              conversationMemory: true,
              escalationRules: []
            },
            appearance: {
              avatar: (Array.isArray(agentResponse.config.appearance.avatar) && agentResponse.config.appearance.avatar.length > 0 
                ? agentResponse.config.appearance.avatar[0] 
                : 'default') || 'default',
              theme: theme || agentResponse.config.appearance.primaryColor || '#3b82f6',
              welcomeMessage: welcomeMessage || `Hello! I'm ${agentResponse.name}. How can I help you today?`
            }
          }
        };
        
        console.log('Agent loaded successfully:', convertedAgent);
        setAgent(convertedAgent);
      } catch (err) {
        console.error('Failed to load agent:', err);
        if (err instanceof Error) {
          setError(`Failed to load agent: ${err.message}`);
        } else {
          setError('Failed to load agent. Please check the agent ID and try again.');
        }
        
        // Create a demo agent for testing purposes
        console.log('Creating demo agent for testing...');
        const demoAgent: Agent = {
          id: agentId || 'demo',
          name: `Demo Agent (${agentId || 'demo'})`,
          description: 'This is a demo agent for testing embed widgets',
          status: 'Active',
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          avatar: 'default',
          config: {
            personality: {
              traits: ['helpful', 'friendly', 'knowledgeable'],
              tone: 'professional',
              responseStyle: 'conversational',
            },
            knowledgeBase: {
              documents: ['Demo knowledge base for testing'],
              sources: [],
              context: 'This is a demo agent created for testing embed widgets when real agents are not available.'
            },
            behavior: {
              maxResponseLength: 300,
              conversationMemory: true,
              escalationRules: []
            },
            appearance: {
              avatar: 'default',
              theme: theme || '#3b82f6',
              welcomeMessage: welcomeMessage || `Hello! I'm ${agentId || 'Demo Agent'}. This is a demo mode for testing embed widgets.`
            }
          }
        };
        
        setAgent(demoAgent);
        setError('Demo mode: Real agent not available. Showing demo functionality.');
      } finally {
        setLoading(false);
      }
    };

    loadAgent();
  }, [agentId, welcomeMessage]);

  // Add custom CSS for embed styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --primary-color: ${primaryColor};
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
        background: ${theme === 'dark' ? '#1F2937' : '#FFFFFF'};
      }
      
      .embed-header {
        background: var(--primary-color);
        color: white;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        flex-shrink: 0;
      }
      
      .embed-avatar {
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        font-size: 14px;
      }
      
      .embed-info h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      
      .embed-info p {
        margin: 0;
        font-size: 12px;
        opacity: 0.9;
      }
      
      .embed-chat {
        flex: 1;
        overflow: hidden;
      }
      
      .embed-footer {
        padding: 8px 16px;
        text-align: center;
        border-top: 1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'};
        background: ${theme === 'dark' ? '#111827' : '#F9FAFB'};
        flex-shrink: 0;
      }
      
      .embed-footer p {
        margin: 0;
        font-size: 10px;
        color: ${theme === 'dark' ? '#9CA3AF' : '#6B7280'};
      }
      
      .embed-footer a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
      }
      
      .embed-footer a:hover {
        text-decoration: underline;
      }
      
      .embed-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: ${theme === 'dark' ? '#1F2937' : '#F9FAFB'};
        color: ${theme === 'dark' ? '#E5E7EB' : '#374151'};
      }
      
      .embed-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: ${theme === 'dark' ? '#1F2937' : '#F9FAFB'};
        color: ${theme === 'dark' ? '#E5E7EB' : '#374151'};
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
      
      @media (max-width: 768px) {
        .embed-header {
          padding: 8px 12px;
        }
        
        .embed-avatar {
          width: 28px;
          height: 28px;
          margin-right: 8px;
        }
        
        .embed-info h3 {
          font-size: 13px;
        }
        
        .embed-info p {
          font-size: 11px;
        }
        
        .embed-footer {
          padding: 6px 12px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [theme, primaryColor]);

  if (loading) {
    return (
      <div className="embed-loading">
        <div className="spinner"></div>
        <span>Loading CanistChat...</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="embed-container">
      {loading && (
        <div className="loading-state">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading agent...</span>
          </div>
        </div>
      )}

      {error && !agent && (
        <div className="error-state">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Not Available</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="text-sm text-gray-500">
                <p>Please check:</p>
                <ul className="mt-2 text-left">
                  <li>• Agent ID is correct</li>
                  <li>• Agent is active and accessible</li>
                  <li>• Network connection is stable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Chat Interface */}
      {agent && (
        <div className="embed-chat h-full flex flex-col">
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
            <ChatInterface agent={agent} sessionToken={null} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedRoute; 