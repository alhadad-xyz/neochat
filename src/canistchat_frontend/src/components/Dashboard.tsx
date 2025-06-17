import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  ClockIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types';
import { canisterService, DashboardMetrics, AgentResponse } from '../services/canisterService';

interface DashboardProps {
  sessionToken: string | null;
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  sessionToken,
  selectedAgent,
  onSelectAgent,
  onNavigate
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
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<{
    agentManager: string;
    llmProcessor: string;
    contextManager: string;
    productionAPIs: string;
  }>({
    agentManager: 'Unknown',
    llmProcessor: 'Unknown',
    contextManager: 'Unknown',
    productionAPIs: 'Unknown',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!sessionToken) {
        console.log('No session token, skipping dashboard data fetch');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Test canister connectivity first
        const canisterAccess = await canisterService.testCanisterAccess();
        console.log('Canister access test:', canisterAccess);

        // Get user agents and calculate metrics from them
        const agents = await canisterService.getUserAgents();
        console.log('Fetched agents:', agents);
        
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

        // Get real system status from canisters
        const systemStatusData = await canisterService.getSystemStatus();
        console.log('System status data:', systemStatusData);

        // Sort agents by created date and take the most recent 5
        const sortedAgents = agents.sort((a, b) => Number(b.created) - Number(a.created));
        const recentAgentsList = sortedAgents.slice(0, 5);

        setMetrics(metrics);
        setRecentAgents(recentAgentsList);
        setSystemStatus(systemStatusData);
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
        setSystemStatus({
          agentManager: 'Error',
          llmProcessor: 'Error',
          contextManager: 'Error',
          productionAPIs: 'Error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessionToken]);

  const quickActions = [
    {
      name: 'Create New Agent',
      description: 'Build a custom AI agent with personality and knowledge',
      icon: PlusIcon,
      action: () => onNavigate('create'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Start Chat',
      description: 'Chat with your existing agents',
      icon: ChatBubbleLeftRightIcon,
      action: () => onNavigate('chat'),
      color: 'bg-green-500 hover:bg-green-600',
      disabled: !selectedAgent,
    },
    {
      name: 'View Analytics',
      description: 'Analyze performance and usage metrics',
      icon: ChartBarIcon,
      action: () => onNavigate('analytics'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Manage Agents',
      description: 'Configure and organize your AI agents',
      icon: Cog6ToothIcon,
      action: () => onNavigate('agents'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const stats = [
    {
      name: 'Total Agents',
      value: metrics.totalAgents,
      change: metrics.monthlyGrowth.agents,
      changeType: metrics.monthlyGrowth.agents >= 0 ? 'increase' : 'decrease',
      icon: UsersIcon,
    },
    {
      name: 'Active Agents',
      value: metrics.activeAgents,
      change: Math.round((metrics.activeAgents / Math.max(metrics.totalAgents, 1)) * 100),
      changeType: 'increase',
      icon: CpuChipIcon,
      unit: '%',
    },
    {
      name: 'Conversations',
      value: metrics.totalConversations,
      change: metrics.monthlyGrowth.conversations,
      changeType: metrics.monthlyGrowth.conversations >= 0 ? 'increase' : 'decrease',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Total Messages',
      value: metrics.totalMessages,
      change: metrics.monthlyGrowth.messages,
      changeType: metrics.monthlyGrowth.messages >= 0 ? 'increase' : 'decrease',
      icon: DocumentTextIcon,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">Authentication Required</div>
          <div className="text-gray-400 text-sm">Please log in with Internet Identity to access the dashboard.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your AI agents.</p>
        </div>
        <div className="flex space-x-3">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Issue</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                      <dd className="text-lg font-medium text-gray-900">{metrics.totalAgents}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Agents</dt>
                      <dd className="text-lg font-medium text-gray-900">{metrics.activeAgents}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
                      <dd className="text-lg font-medium text-gray-900">{metrics.totalConversations}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Messages</dt>
                      <dd className="text-lg font-medium text-gray-900">{metrics.totalMessages}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions and Recent Agents */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.name}
                      onClick={action.action}
                      disabled={action.disabled}
                      className={`relative p-4 rounded-lg border-2 border-dashed border-gray-300 text-left hover:border-gray-400 transition-colors ${
                        action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color} text-white`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{action.name}</h4>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Agents */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recent Agents</h3>
                  <button
                    onClick={() => onNavigate('agents')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    View all
                  </button>
                </div>
                {recentAgents.length > 0 ? (
                  <div className="space-y-3">
                    {recentAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          // Convert AgentResponse to Agent for the callback
                          const convertedAgent: Agent = {
                            ...agent,
                            status: 'Active' in agent.status ? 'Active' as const :
                                    'Inactive' in agent.status ? 'Inactive' as const :
                                    'Draft' as const,
                            created: agent.created.toString(),
                            lastUpdated: agent.updated.toString(),
                            config: {
                              ...agent.config,
                              personality: {
                                ...agent.config.personality,
                                responseStyle: agent.config.personality.style
                              },
                              knowledgeBase: {
                                documents: [],
                                sources: [],
                                context: ""
                              },
                              behavior: {
                                ...agent.config.behavior,
                                maxResponseLength: Number(agent.config.behavior.maxTokens),
                                conversationMemory: agent.config.contextSettings.enableMemory,
                                escalationRules: []
                              },
                              appearance: {
                                ...agent.config.appearance,
                                avatar: agent.config.appearance.avatar?.[0] || "",
                                theme: 'Light' in agent.config.appearance.theme ? 'Light' : 'Dark',
                                welcomeMessage: "Hello! How can I help you today?"
                              }
                            }
                          };
                          onSelectAgent(convertedAgent);
                          onNavigate('chat');
                        }}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.description.slice(0, 50)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            'Active' in agent.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {'Active' in agent.status ? 'Active' :
                             'Inactive' in agent.status ? 'Inactive' :
                             'Suspended' in agent.status ? 'Suspended' :
                             'Archived' in agent.status ? 'Archived' : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No agents yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first AI agent.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => onNavigate('create')}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                      >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                        Create Agent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full animate-pulse mr-3 ${
                    systemStatus.agentManager === 'Operational' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Agent Manager: {systemStatus.agentManager}</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full animate-pulse mr-3 ${
                    systemStatus.llmProcessor === 'Operational' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">LLM Processor: {systemStatus.llmProcessor}</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full animate-pulse mr-3 ${
                    systemStatus.contextManager === 'Operational' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Context Manager: {systemStatus.contextManager}</span>
                </div>
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full animate-pulse mr-3 ${
                    systemStatus.productionAPIs === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Production APIs: {systemStatus.productionAPIs}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 