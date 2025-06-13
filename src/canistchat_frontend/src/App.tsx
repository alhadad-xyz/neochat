import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

// Components
import AgentCreator from './components/AgentCreator';
import AgentList from './components/AgentList';
import ChatInterface from './components/ChatInterface';
import UserProfile from './components/UserProfile';

// Types
import { Agent, Tab } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('agents');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Initialize auth client
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      
      if (isAuthenticated) {
        const identity = client.getIdentity();
        setIdentity(identity);
        // In a real implementation, you'd get a session token from your auth proxy
        setSessionToken('mock_session_token_' + Date.now());
      }
    };
    
    initAuth();
  }, []);

  const handleLogin = async () => {
    if (authClient) {
      await authClient.login({
        identityProvider: process.env.REACT_APP_II_URL || "https://identity.ic0.app",
        onSuccess: () => {
          setIsAuthenticated(true);
          const identity = authClient.getIdentity();
          setIdentity(identity);
          setSessionToken('mock_session_token_' + Date.now());
        },
      });
    }
  };

  const handleLogout = async () => {
    if (authClient) {
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      setSessionToken(null);
      setSelectedAgent(null);
      setActiveTab('agents');
    }
  };

  const tabs: Tab[] = [
    { id: 'agents', name: 'My Agents', icon: Cog6ToothIcon },
    { id: 'create', name: 'Create Agent', icon: PlusIcon },
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon, disabled: !selectedAgent },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg card-shadow max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CanistChat</h1>
            <p className="text-gray-600 mb-8">AI Agent Platform on Internet Computer</p>
            <button
              onClick={handleLogin}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Login with Internet Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CanistChat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {identity?.getPrincipal() ? 
                  (typeof identity.getPrincipal().toString === 'function' ? 
                    identity.getPrincipal().toString().slice(0, 8) : 
                    'Unknown'
                  ) + '...' : 
                  'Loading...'
                }
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'agents' && (
            <AgentList
              sessionToken={sessionToken}
              onSelectAgent={setSelectedAgent}
              selectedAgent={selectedAgent}
            />
          )}
          
          {activeTab === 'create' && (
            <AgentCreator
              sessionToken={sessionToken}
              onAgentCreated={() => setActiveTab('agents')}
            />
          )}
          
          {activeTab === 'chat' && selectedAgent && (
            <ChatInterface
              sessionToken={sessionToken}
              agent={selectedAgent}
            />
          )}
          
          {activeTab === 'profile' && (
            <UserProfile
              sessionToken={sessionToken}
              identity={identity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 