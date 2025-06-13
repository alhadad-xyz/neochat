import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { AgentListProps, Agent } from '../types';

const AgentList: React.FC<AgentListProps> = ({ sessionToken, onSelectAgent, selectedAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock agents data
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'Customer Support Assistant',
      description: 'Helps customers with product inquiries and support issues',
      status: 'Active',
      created: '2024-01-15T10:30:00Z',
      config: {
        personality: {
          traits: ['helpful', 'patient', 'knowledgeable'],
          tone: 'professional',
          responseStyle: 'helpful'
        },
        knowledgeBase: {
          documents: [],
          sources: [],
          context: ''
        },
        behavior: {
          maxResponseLength: 500,
          conversationMemory: true,
          escalationRules: []
        },
        appearance: {
          avatar: 'default',
          theme: 'blue',
          welcomeMessage: 'Hello! How can I help you today?'
        }
      }
    },
    {
      id: '2',
      name: 'Sales Bot',
      description: 'Assists with product recommendations and sales inquiries',
      status: 'Inactive',
      created: '2024-01-10T14:20:00Z',
      config: {
        personality: {
          traits: ['enthusiastic', 'friendly', 'concise'],
          tone: 'casual',
          responseStyle: 'conversational'
        },
        knowledgeBase: {
          documents: [],
          sources: [],
          context: ''
        },
        behavior: {
          maxResponseLength: 300,
          conversationMemory: true,
          escalationRules: []
        },
        appearance: {
          avatar: 'default',
          theme: 'green',
          welcomeMessage: 'Hi there! Looking for something specific?'
        }
      }
    }
  ];

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAgents(mockAgents);
      } catch (err) {
        setError('Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  const toggleAgentStatus = async (agentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, status: agent.status === 'Active' ? 'Inactive' : 'Active' }
          : agent
      ));
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const deleteAgent = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      
      if (selectedAgent?.id === agentId) {
        onSelectAgent(null);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading agents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">No agents found</div>
        <p className="text-gray-400">Create your first agent to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Agents</h2>
        <div className="text-sm text-gray-500">
          {agents.length} agent{agents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
              selectedAgent?.id === agent.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => onSelectAgent(agent)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {agent.status === 'Active' ? (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-700">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-red-700">Inactive</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Created {new Date(agent.created).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAgentStatus(agent.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={agent.status === 'Active' ? 'Pause agent' : 'Activate agent'}
                  >
                    {agent.status === 'Active' ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgent(agent.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete agent"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.config.personality.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentList; 