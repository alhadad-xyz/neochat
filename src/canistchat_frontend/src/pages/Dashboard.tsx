import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentAgents from '@/components/dashboard/RecentAgents';

// Import other view components
import AgentCreator from '@/components/AgentCreator';
import AgentList from '@/components/AgentList';
import ChatInterface from '@/components/ChatInterface';
import UserProfile from '@/components/UserProfile';
import EmbedGenerator from '@/components/EmbedGenerator';
import Analytics from '@/components/Analytics';
import { PricingTiers } from '@/components/PricingTiers';

import { Agent } from '../types';
import { canisterService, DashboardMetrics, AgentResponse } from '../services/canisterService';

interface DashboardProps {
  sessionToken: string | null;
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onNavigate: (view: string) => void;
  identity?: any;
  onLogout?: () => void;
  activeView?: string;
}
const AGENT_MANAGER_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_AGENT_MANAGER;

const Dashboard: React.FC<DashboardProps> = ({
  sessionToken,
  selectedAgent,
  onSelectAgent,
  onNavigate,
  identity,
  onLogout,
  activeView = 'dashboard'
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    totalMessages: 0,
    monthlyGrowth: {
      agents: 0,
      conversations: 0,
      messages: 0,
    }
  });
  const [recentAgents, setRecentAgents] = useState<AgentResponse[]>([]);
  const [allAgents, setAllAgents] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3); // Mock notification count
  const [currentTier, setCurrentTier] = useState<'Free' | 'Base' | 'Pro' | 'Enterprise'>('Free'); // Default to Free, will be updated from backend

  // Map backend tier names to frontend tier names
  const mapBackendTierToFrontend = (backendTier: string): 'Free' | 'Base' | 'Pro' | 'Enterprise' => {
    switch (backendTier) {
      case 'Base':
        return 'Base';
      case 'Standard':
        return 'Base'; // Map Standard to Base for frontend
      case 'Professional':
        return 'Pro';
      case 'Enterprise':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Search query:', query);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Function to render the active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="mb-6 md:mb-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 md:mb-3">
                    Welcome Back!
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                    Here's what's happening with your AI agents today.
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl px-4 md:px-6 py-2 md:py-3 border border-white/20 dark:border-gray-700/50">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Current Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4 md:mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Issue</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DashboardStats 
              metrics={metrics}
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 md:gap-8">
              <div className="xl:col-span-3">
                <QuickActions 
                  onNavigate={onNavigate}
                  selectedAgent={selectedAgent}
                />
              </div>
              <div className="xl:col-span-2">
                <RecentAgents 
                  agents={recentAgents}
                  onSelectAgent={onSelectAgent}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          </div>
        );
      
      case 'agents':
        return (
          <div className="space-y-4 md:space-y-6">
            <AgentList 
              onSelectAgent={onSelectAgent}
              selectedAgent={selectedAgent}
              sessionToken={sessionToken}
              onNavigate={onNavigate}
            />
          </div>
        );
      
      case 'create':
        return (
          <div className="space-y-4 md:space-y-6">
            <AgentCreator 
              sessionToken={sessionToken}
              onAgentCreated={(agent) => {
                onSelectAgent(agent);
                onNavigate('agents');
              }}
            />
          </div>
        );
      
      case 'chat':
        return (
          <div className="h-full">
            {selectedAgent ? (
              <ChatInterface 
                agent={selectedAgent} 
                sessionToken={sessionToken}
              />
            ) : allAgents.length > 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Loading Agent</div>
                  <div className="text-gray-400 dark:text-gray-500 text-sm">Selecting your agent for chat...</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Agents Available</div>
                  <div className="text-gray-400 dark:text-gray-500 text-sm mb-4">Create an agent to start chatting.</div>
                  <button
                    onClick={() => onNavigate('create')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Your First Agent
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-4 md:space-y-6">
            <Analytics 
              sessionToken={sessionToken}
              selectedAgent={selectedAgent}
            />
          </div>
        );
      
      case 'embed':
        return (
          <div className="space-y-4 md:space-y-6">
            {selectedAgent ? (
              <EmbedGenerator 
                agent={selectedAgent}
                canisterId={AGENT_MANAGER_CANISTER_ID}
              />
            ) : (
              <div className="text-center py-12 px-4">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Agent Selected</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Please select an agent to generate embed code.</div>
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-4 md:space-y-6">
            <UserProfile 
              sessionToken={sessionToken}
              identity={identity}
            />
          </div>
        );
      
      case 'billing':
        return (
          <PricingTiers
            currentTier={currentTier}
            sessionToken={sessionToken}
            onUpgrade={async (tier) => {
              try {
                console.log('Upgrading to:', tier);
                await canisterService.upgradeUserTier(tier);
                alert(`Successfully upgraded to ${tier} plan!`);
                // Refetch user tier and update UI state
                const userBalance = await canisterService.getUserBalance();
                if (userBalance) {
                  const frontendTier = mapBackendTierToFrontend(userBalance.currentTier);
                  setCurrentTier(frontendTier);
                }
              } catch (error) {
                console.error('Upgrade error:', error);
                alert('Failed to upgrade plan. Please try again.');
              }
            }}
            onDowngrade={async (tier) => {
              try {
                console.log('Downgrading to:', tier);
                await canisterService.upgradeUserTier(tier);
                alert(`Successfully downgraded to ${tier} plan!`);
                // Refetch user tier and update UI state
                const userBalance = await canisterService.getUserBalance();
                if (userBalance) {
                  const frontendTier = mapBackendTierToFrontend(userBalance.currentTier);
                  setCurrentTier(frontendTier);
                }
              } catch (error) {
                console.error('Downgrade error:', error);
                alert('Failed to downgrade plan. Please try again.');
              }
            }}
          />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">View Not Found</div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">The requested view could not be found.</div>
          </div>
        );
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!sessionToken) {
        console.log('No session token, skipping dashboard data fetch');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get user agents directly (bypassing readiness checks)
        const agents = await canisterService.getUserAgents();
        console.log('Agents:', agents);
        
        // Get user balance and tier
        const userBalance = await canisterService.getUserBalance();
        if (userBalance) {
          const frontendTier = mapBackendTierToFrontend(userBalance.currentTier);
          setCurrentTier(frontendTier);
          console.log('User tier:', userBalance.currentTier, 'mapped to frontend tier:', frontendTier);
        }
        
        const activeAgents = agents.filter(agent => 'Active' in agent.status).length;
        
        // Calculate total conversations and messages from agent analytics
        let totalConversations = 0;
        let totalMessages = 0;
        
        for (const agent of agents) {
          if (agent.analytics) {
            totalConversations += agent.analytics.totalConversations;
            totalMessages += agent.analytics.totalMessages;
          }
        }

        // Calculate monthly growth (simplified - in production this would use historical data)
        const monthlyGrowth = {
          agents: Math.max(0, Math.floor(agents.length * 0.1)), // 10% growth estimate
          conversations: Math.max(0, Math.floor(totalConversations * 0.15)), // 15% growth estimate
          messages: Math.max(0, Math.floor(totalMessages * 0.12)), // 12% growth estimate
        };

        const metrics = {
          totalAgents: agents.length,
          activeAgents,
          totalConversations,
          totalMessages,
          monthlyGrowth,
        };

        // Sort agents by created date and take the most recent 5
        const sortedAgents = agents.sort((a, b) => Number(b.created) - Number(a.created));
        const recentAgentsList = sortedAgents.slice(0, 5);

        setMetrics(metrics);
        setRecentAgents(recentAgentsList);
        setAllAgents(agents);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please check your connection and try again.');
        
        // Set fallback data
        setMetrics({
          totalAgents: 0,
          activeAgents: 0,
          totalConversations: 0,
          totalMessages: 0,
          monthlyGrowth: { agents: 0, conversations: 0, messages: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessionToken]);

  // Auto-select first available agent when navigating to chat view
  useEffect(() => {
    if (activeView === 'chat' && !selectedAgent && allAgents.length > 0) {
      // Find the first active agent, or just the first agent if none are active
      const activeAgent = allAgents.find(agent => 'Active' in agent.status);
      const agentToSelect = activeAgent || allAgents[0];
      
      if (agentToSelect) {
        // Convert AgentResponse to Agent format
        const convertedAgent: Agent = {
          id: agentToSelect.id,
          name: agentToSelect.name,
          description: agentToSelect.description,
          status: 'Active' in agentToSelect.status ? 'Active' : 
                 'Inactive' in agentToSelect.status ? 'Inactive' : 'Draft',
          created: new Date(agentToSelect.created).toISOString(),
          lastUpdated: new Date(agentToSelect.updated).toISOString(),
          avatar: Array.isArray(agentToSelect.config.appearance.avatar) && agentToSelect.config.appearance.avatar.length > 0 
            ? agentToSelect.config.appearance.avatar[0] 
            : 'default',
          config: {
            personality: {
              traits: agentToSelect.config.personality.traits,
              tone: agentToSelect.config.personality.tone,
              responseStyle: agentToSelect.config.personality.style,
            },
            knowledgeBase: {
              documents: agentToSelect.config.knowledgeBase.map(kb => kb.content),
              sources: [],
              context: agentToSelect.config.knowledgeBase.map(kb => kb.content).join('\n')
            },
            behavior: {
              maxResponseLength: 'Long' in agentToSelect.config.behavior.responseLength ? 500 : 200,
              conversationMemory: true,
              escalationRules: []
            },
            appearance: {
              avatar: (Array.isArray(agentToSelect.config.appearance.avatar) && agentToSelect.config.appearance.avatar.length > 0 
                ? agentToSelect.config.appearance.avatar[0] 
                : 'default') || 'default',
              theme: agentToSelect.config.appearance.primaryColor || '#3b82f6',
              welcomeMessage: `Hello! I'm ${agentToSelect.name}. How can I help you today?`
            }
          }
        };
        
        console.log('Auto-selecting agent for chat:', convertedAgent.name);
        onSelectAgent(convertedAgent);
      }
    }
  }, [activeView, selectedAgent, allAgents, onSelectAgent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
        <DashboardSidebar 
          onNavigate={onNavigate}
          activeView={activeView}
          selectedAgent={selectedAgent}
        />
        <div className="flex-1 flex flex-col md:ml-64">
          <DashboardHeader 
            identity={identity}
            sessionToken={sessionToken}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            notifications={notifications}
          />
          <main className={`flex-1 ${activeView === 'chat' ? 'p-0' : 'p-4 md:p-8'}`}>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
        <DashboardSidebar 
          onNavigate={onNavigate}
          activeView={activeView}
          selectedAgent={selectedAgent}
        />
        <div className="flex-1 flex flex-col md:ml-64">
          <DashboardHeader 
            identity={identity}
            sessionToken={sessionToken}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            notifications={notifications}
          />
          <main className={`flex-1 ${activeView === 'chat' ? 'p-0' : 'p-4 md:p-8'}`}>
            <div className="flex items-center justify-center h-64">
              <div className="text-center px-4">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Authentication Required</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Please log in with Internet Identity to access the dashboard.</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
      <DashboardSidebar 
        onNavigate={onNavigate}
        activeView={activeView}
        selectedAgent={selectedAgent}
      />
      <div className="flex-1 flex flex-col md:ml-64">
        <DashboardHeader 
          identity={identity}
          sessionToken={sessionToken}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          notifications={notifications}
        />
        <main className={`flex-1 ${activeView === 'chat' ? 'p-0' : 'p-4 md:p-8'}`}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
