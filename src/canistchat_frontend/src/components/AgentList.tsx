import React, { useState, useEffect } from "react";
import { PlayIcon, PauseIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { AgentListProps, Agent } from "../types";
import { canisterService, AgentResponse } from "../services/canisterService";
import AgentDetail from "./AgentDetail";

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
          status: "Active" in response.status ? "Active" : "Inactive" in response.status ? "Inactive" : "Draft",
          created: new Date(Number(response.created) / 1000000).toISOString(),
          config: {
            personality: {
              traits: response.config.personality.traits,
              tone: response.config.personality.tone,
              responseStyle: response.config.personality.style,
            },
            knowledgeBase: {
              documents: [],
              sources: response.config.knowledgeBase.map((kb) => ({
                type: "Manual" in kb.sourceType ? "Manual" : "URL" in kb.sourceType ? "URL" : "Document" in kb.sourceType ? "Document" : "API" in kb.sourceType ? "API" : "Database",
                content: kb.content,
                metadata: kb.metadata.reduce(
                  (acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                  },
                  {} as Record<string, string>
                ),
              })),
              context: response.config.knowledgeBase.map((kb) => kb.content).join(" "),
            },
            behavior: {
              maxResponseLength: 500,
              conversationMemory: true,
              escalationRules: [],
            },
            appearance: {
              avatar: (Array.isArray(response.config.appearance.avatar) && response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : "default") as string,
              theme: response.config.appearance.primaryColor,
              welcomeMessage: "Hello! How can I help you today?",
            },
          },
          avatar: Array.isArray(response.config.appearance.avatar) && response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : "",
          lastUpdated: new Date().toISOString(),
        }));

        setAgents(realAgents);
      } catch (error) {
        console.error("Error loading agents:", error);
        setError("Failed to load agents. Please try again.");
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
      const currentAgent = agents.find((a) => a.id === agentId);
      if (!currentAgent) return;

      // Merge the updates
      const mergedAgent = { ...currentAgent, ...updatedAgent };

      // Convert to canister format
      const canisterConfig = {
        personality: {
          traits: mergedAgent.config.personality.traits,
          tone: mergedAgent.config.personality.tone,
          style: mergedAgent.config.personality.responseStyle,
          communicationStyle: { Conversational: null },
          responsePattern: { Detailed: null },
        },
        behavior: {
          responseLength: { Medium: null },
          temperature: 0.7,
          creativity: 0.5,
          topP: 0.9,
          contextWindow: BigInt(4000),
          maxTokens: BigInt(1000),
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
          systemPromptTemplate: "You are a helpful AI assistant.",
        },
        appearance: {
          primaryColor: mergedAgent.config.appearance.theme,
          secondaryColor: "#ffffff",
          accentColor: "#3b82f6",
          borderRadius: "8px",
          avatar: mergedAgent.config.appearance.avatar ? ([mergedAgent.config.appearance.avatar] as [string]) : ([] as []),
          customCSS: [] as [],
          fontFamily: "Inter",
          fontSize: "14px",
          theme: { Auto: null },
        },
        contextSettings: {
          enableLearning: true,
          enableMemory: true,
          maxContextMessages: BigInt(10),
          memoryDuration: BigInt(3600),
        },
        integrationSettings: {
          allowedOrigins: [],
          rateLimiting: {
            enabled: false,
            maxRequestsPerHour: BigInt(100),
            maxTokensPerHour: BigInt(10000),
          },
          webhooks: [],
        },
        knowledgeBase: mergedAgent.config.knowledgeBase.sources.map((source) => ({
          id: Math.random().toString(36).substr(2, 9),
          content: source.content,
          sourceType: source.type === "Manual" ? { Manual: null } : source.type === "URL" ? { URL: null } : source.type === "Document" ? { Document: null } : source.type === "API" ? { API: null } : { Database: null },
          metadata: source.metadata
            ? Object.entries(source.metadata)
                .filter(([key, value]) => key && value !== undefined)
                .map(([key, value]) => [key, String(value)] as [string, string])
            : [],
          isActive: true,
          lastUpdated: BigInt(Date.now()),
          priority: BigInt(1),
          version: BigInt(1),
        })),
        version: BigInt(1),
      };

      // Update the agent in the canister
      await canisterService.updateAgent(agentId, canisterConfig);

      // Update the local state
      setAgents((prevAgents) => prevAgents.map((agent) => (agent.id === agentId ? mergedAgent : agent)));

      // Update the viewing agent if it's the same one
      if (viewingAgent?.id === agentId) {
        setViewingAgent(mergedAgent);
      }

      // Update the selected agent if it's the same one
      if (selectedAgent?.id === agentId) {
        onSelectAgent(mergedAgent);
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      setError("Failed to update agent");
    }
  };

  const handleStatusToggle = async (agentId: string, currentStatus: string) => {
    try {
      // Determine the new status
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      console.log(`Toggling status for agent ${agentId} from ${currentStatus} to ${newStatus}`);

      // Call the canister to update the agent status
      await canisterService.updateAgentStatus(agentId, newStatus);

      // Reload agents to reflect the changes
      const agentResponses = await canisterService.getUserAgents();
      const realAgents: Agent[] = agentResponses.map((response) => ({
        id: response.id,
        name: response.name,
        description: response.description,
        status: "Active" in response.status ? "Active" : "Inactive" in response.status ? "Inactive" : "Draft",
        created: new Date(Number(response.created) / 1000000).toISOString(),
        config: {
          personality: {
            traits: response.config.personality.traits,
            tone: response.config.personality.tone,
            responseStyle: response.config.personality.style,
          },
          knowledgeBase: {
            documents: [],
            sources: response.config.knowledgeBase.map((kb) => ({
              type: "Manual" in kb.sourceType ? "Manual" : "URL" in kb.sourceType ? "URL" : "Document" in kb.sourceType ? "Document" : "API" in kb.sourceType ? "API" : "Database",
              content: kb.content,
              metadata: kb.metadata.reduce(
                (acc, [key, value]) => {
                  acc[key] = value;
                  return acc;
                },
                {} as Record<string, string>
              ),
            })),
            context: response.config.knowledgeBase.map((kb) => kb.content).join(" "),
          },
          behavior: {
            maxResponseLength: 500,
            conversationMemory: true,
            escalationRules: [],
          },
          appearance: {
            avatar: response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : "",
            theme: response.config.appearance.primaryColor,
            welcomeMessage: "Hello! How can I help you today?",
          },
        },
        avatar: response.config.appearance.avatar.length > 0 ? response.config.appearance.avatar[0] : "",
        lastUpdated: new Date(Number(response.updated) / 1000000).toISOString(),
      }));
      setAgents(realAgents);
    } catch (error) {
      console.error("Error toggling agent status:", error);
      setError("Failed to update agent status");
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Call the canister service to delete the agent
      await canisterService.deleteAgent(agentId);
      console.log(`Agent ${agentId} deleted successfully`);

      // Remove the agent from the local state
      setAgents((prevAgents) => prevAgents.filter((agent) => agent.id !== agentId));

      // If the deleted agent was selected, clear the selection
      if (selectedAgent?.id === agentId) {
        onSelectAgent(null);
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      setError("Failed to delete agent");
    }
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
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
        <button onClick={() => onNavigate("create")} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Agent
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">My Agents</h2>
          <p className="mt-1 text-sm text-gray-500">Manage and configure your AI agents.</p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => onNavigate("create")}
            className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create New Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`bg-white rounded-lg shadow border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedAgent?.id === agent.id ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => handleAgentSelect(agent)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">{agent.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{agent.description}</p>
              </div>
              <span
                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === "Active" ? "bg-green-100 text-green-800" : agent.status === "Inactive" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {agent.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Created: {new Date(agent.created).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAgent(agent);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusToggle(agent.id, agent.status);
                  }}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    agent.status === "Active" ? "text-orange-700 bg-orange-100 hover:bg-orange-200 focus:ring-orange-500" : "text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500"
                  }`}
                >
                  {agent.status === "Active" ? (
                    <>
                      <PauseIcon className="h-3 w-3 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-3 w-3 mr-1" />
                      Activate
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAgent(agent.id);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-3 w-3 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewingAgent && <AgentDetail agent={viewingAgent} onClose={handleCloseView} onEdit={(agent) => setViewingAgent(agent)} onUpdate={handleUpdateAgent} />}
    </div>
  );
};

export default AgentList;
