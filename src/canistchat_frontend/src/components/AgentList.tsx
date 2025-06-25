import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { AgentListProps, Agent } from '../types';
import { canisterService, AgentResponse } from '../services/canisterService';
import AgentDetail from './AgentDetail';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHeader from './dashboard/DashboardHeader';
import { Button } from './ui/button';
import { Filter } from 'lucide-react';
import { Plus } from 'lucide-react';
import AgentCard from './my-agents/AgentCard';

// Define the agent interface that matches the AgentCard component expectations
interface AgentCardAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  traits: string[];
}

const AgentList: React.FC<AgentListProps> = ({ sessionToken, onSelectAgent, selectedAgent, onNavigate }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const loadAgents = async () => {
      if (!sessionToken) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Load real agents from canister service
        const agentResponses = await canisterService.getUserAgents();
        
        // Convert AgentResponse to Agent format
        const realAgents: Agent[] = agentResponses.map((response) => ({
          id: response.id,
          name: response.name,
          description: response.description,
          status: 'Active' in response.status ? 'Active' : 
                  'Inactive' in response.status ? 'Inactive' : 'Draft',
          created: new Date(response.created).toISOString(),
          config: {
            personality: {
              traits: response.config.personality.traits,
              tone: response.config.personality.tone,
              responseStyle: response.config.personality.style,
            },
            knowledgeBase: {
              documents: [],
              sources: response.config.knowledgeBase.map(kb => ({
                type: 'Manual' in kb.sourceType ? 'Manual' :
                      'URL' in kb.sourceType ? 'URL' :
                      'Document' in kb.sourceType ? 'Document' :
                      'API' in kb.sourceType ? 'API' : 'Database',
                content: kb.content,
                metadata: kb.metadata.reduce((acc, [key, value]) => {
                  acc[key] = value;
                  return acc;
                }, {} as Record<string, string>)
              })),
              context: response.config.knowledgeBase.map(kb => kb.content).join(' '),
            },
            behavior: {
              maxResponseLength: 500,
              conversationMemory: true,
              escalationRules: [],
            },
            appearance: {
              avatar: (Array.isArray(response.config.appearance.avatar) && response.config.appearance.avatar.length > 0 
                ? response.config.appearance.avatar[0] 
                : 'default') as string,
              theme: response.config.appearance.primaryColor,
              welcomeMessage: 'Hello! How can I help you today?',
            },
          },
          avatar: Array.isArray(response.config.appearance.avatar) && response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : '',
          lastUpdated: new Date().toISOString(),
        }));
        
        setAgents(realAgents);
      } catch (error) {
        console.error('Error loading agents:', error);
        setError('Failed to load agents. Please try again.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [sessionToken]);

  const handleAgentSelect = (agent: Agent) => {
    onSelectAgent(agent);
  };

  const handleViewAgent = (agent: Agent) => {
    setViewingAgent(agent);
  };

  const handleCloseView = () => {
    setViewingAgent(null);
  };

  const handleUpdateAgent = async (agentId: string, updatedAgent: Partial<Agent>) => {
    try {
      // Find the current agent
      const currentAgent = agents.find(a => a.id === agentId);
      if (!currentAgent) return;

      // Merge the updates
      const mergedAgent = { ...currentAgent, ...updatedAgent };

      // Convert to canister format
      const canisterConfig = {
        personality: {
          traits: mergedAgent.config.personality.traits,
          tone: mergedAgent.config.personality.tone,
          style: mergedAgent.config.personality.responseStyle,
          communicationStyle: { 'Conversational': null },
          responsePattern: { 'Detailed': null }
        },
        behavior: {
          responseLength: { 'Medium': null },
          temperature: 0.7,
          creativity: 0.5,
          topP: 0.9,
          contextWindow: BigInt(4000),
          maxTokens: BigInt(1000),
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
          systemPromptTemplate: "You are a helpful AI assistant."
        },
        appearance: {
          primaryColor: mergedAgent.config.appearance.theme,
          secondaryColor: "#ffffff",
          accentColor: "#3b82f6",
          borderRadius: "8px",
          avatar: mergedAgent.config.appearance.avatar ? [mergedAgent.config.appearance.avatar] as [string] : [] as [],
          customCSS: [] as [],
          fontFamily: "Inter",
          fontSize: "14px",
          theme: { 'Auto': null }
        },
        contextSettings: {
          enableLearning: true,
          enableMemory: true,
          maxContextMessages: BigInt(10),
          memoryDuration: BigInt(3600)
        },
        integrationSettings: {
          allowedOrigins: [],
          rateLimiting: {
            enabled: false,
            maxRequestsPerHour: BigInt(100),
            maxTokensPerHour: BigInt(10000)
          },
          webhooks: []
        },
        knowledgeBase: mergedAgent.config.knowledgeBase.sources.map(source => ({
          id: Math.random().toString(36).substr(2, 9),
          content: source.content,
          sourceType: source.type === 'Manual' ? { 'Manual': null } :
                     source.type === 'URL' ? { 'URL': null } :
                     source.type === 'Document' ? { 'Document': null } :
                     source.type === 'API' ? { 'API': null } : { 'Database': null },
          metadata: source.metadata ? Object.entries(source.metadata)
            .filter(([key, value]) => key && value !== undefined)
            .map(([key, value]) => [key, String(value)] as [string, string]) : [],
          isActive: true,
          lastUpdated: BigInt(Date.now()),
          priority: BigInt(1),
          version: BigInt(1)
        })),
        version: BigInt(1)
      };

      // Update the agent in the canister
      await canisterService.updateAgent(agentId, canisterConfig);

      // Update the local state
      setAgents(prevAgents => 
        prevAgents.map(agent => 
          agent.id === agentId ? mergedAgent : agent
        )
      );

      // Update the viewing agent if it's the same one
      if (viewingAgent?.id === agentId) {
        setViewingAgent(mergedAgent);
      }

      // Update the selected agent if it's the same one
      if (selectedAgent?.id === agentId) {
        onSelectAgent(mergedAgent);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setError('Failed to update agent');
    }
  };

  const handleStatusToggle = async (agentId: string, currentStatus: string) => {
    try {
      // Determine the new status
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      console.log(`Toggling status for agent ${agentId} from ${currentStatus} to ${newStatus}`);
      
      // Call the canister to update the agent status
      await canisterService.updateAgentStatus(agentId, newStatus);
      
      // Reload agents to reflect the changes
      const agentResponses = await canisterService.getUserAgents();
      const realAgents: Agent[] = agentResponses.map((response) => ({
        id: response.id,
        name: response.name,
        description: response.description,
        status: 'Active' in response.status ? 'Active' : 
                'Inactive' in response.status ? 'Inactive' : 'Draft',
        created: new Date(response.created).toISOString(),
        config: {
          personality: {
            traits: response.config.personality.traits,
            tone: response.config.personality.tone,
            responseStyle: response.config.personality.style,
          },
          knowledgeBase: {
            documents: [],
            sources: response.config.knowledgeBase.map(kb => ({
              type: 'Manual' in kb.sourceType ? 'Manual' :
                    'URL' in kb.sourceType ? 'URL' :
                    'Document' in kb.sourceType ? 'Document' :
                    'API' in kb.sourceType ? 'API' : 'Database',
              content: kb.content,
              metadata: kb.metadata.reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
              }, {} as Record<string, string>)
            })),
            context: response.config.knowledgeBase.map(kb => kb.content).join(' '),
          },
          behavior: {
            maxResponseLength: 500,
            conversationMemory: true,
            escalationRules: [],
          },
          appearance: {
            avatar: response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : '',
            theme: response.config.appearance.primaryColor,
            welcomeMessage: 'Hello! How can I help you today?',
          },
        },
        avatar: response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : '',
        lastUpdated: new Date(response.updated).toISOString(),
      }));
      setAgents(realAgents);
    } catch (error) {
      console.error('Error toggling agent status:', error);
      setError('Failed to update agent status');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Call the canister service to delete the agent
      await canisterService.deleteAgent(agentId);
      console.log(`Agent ${agentId} deleted successfully`);
      
      // Remove the agent from the local state
      setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId));
      
      // If the deleted agent was selected, clear the selection
      if (selectedAgent?.id === agentId) {
        onSelectAgent(null);
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      setError('Failed to delete agent');
    }
  };

  // Convert Agent to AgentCardAgent format
  const convertToAgentCardFormat = (agent: Agent): AgentCardAgent => {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status === 'Active' ? 'active' : 'inactive',
      createdDate: new Date(agent.created).toLocaleDateString(),
      traits: agent.config.personality.traits,
    };
  };

  // Handle update from AgentCard (convert back from AgentCardAgent to Agent format)
  const handleAgentCardUpdate = async (agentId: string, updatedAgentCard: Partial<AgentCardAgent>) => {
    // Convert the AgentCard format back to Agent format
    const updatedAgent: Partial<Agent> = {
      ...updatedAgentCard,
      status: updatedAgentCard.status === 'active' ? 'Active' : 
              updatedAgentCard.status === 'inactive' ? 'Inactive' : undefined,
    };
    
    // Remove the AgentCard-specific fields that don't exist in Agent
    delete (updatedAgent as any).createdDate;
    
    await handleUpdateAgent(agentId, updatedAgent);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <p className="text-sm text-gray-400 mb-6">Create your first AI agent to get started</p>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => onNavigate?.('create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Agent
        </Button>
      </div>
    );
  }

  return (
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  My Agents
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {agents.length} {agents.length === 1 ? 'agent' : 'agents'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => onNavigate?.('create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </div>
            </div>

            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <AgentCard 
                    key={agent.id} 
                    agent={convertToAgentCardFormat(agent)}
                    onStatusToggle={handleStatusToggle}
                    onDelete={handleDeleteAgent}
                    onUpdate={handleAgentCardUpdate}
                    onSelect={(agentCard) => {
                      // Convert AgentCard format back to Agent format and select
                      const fullAgent = agents.find(a => a.id === agentCard.id);
                      if (fullAgent) {
                        handleAgentSelect(fullAgent);
                      }
                    }}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No agents yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Create your first AI agent to start building intelligent conversations.
                </p>
                <Button 
                  onClick={() => onNavigate?.('create')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </div>
            )}
          </div>
        </main>
  );
};

export default AgentList; 