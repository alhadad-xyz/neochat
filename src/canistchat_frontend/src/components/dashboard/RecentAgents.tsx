import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, ArrowRight, Users, MessageSquare } from 'lucide-react';
import { Agent } from '../../types';
import { AgentResponse } from '../../services/canisterService';

interface RecentAgentsProps {
  agents: AgentResponse[];
  onSelectAgent: (agent: Agent | null) => void;
  onNavigate: (view: string) => void;
}

const RecentAgents: React.FC<RecentAgentsProps> = ({ agents, onSelectAgent, onNavigate }) => {
  const convertAgentResponseToAgent = (agentResponse: AgentResponse): Agent => {
    return {
      ...agentResponse,
      status: 'Active' in agentResponse.status ? 'Active' as const :
              'Inactive' in agentResponse.status ? 'Inactive' as const :
              'Draft' as const,
      created: agentResponse.created.toString(),
      lastUpdated: agentResponse.updated.toString(),
      config: {
        ...agentResponse.config,
        personality: {
          ...agentResponse.config.personality,
          responseStyle: agentResponse.config.personality.style
        },
        knowledgeBase: {
          documents: [],
          sources: [],
          context: ""
        },
        behavior: {
          ...agentResponse.config.behavior,
          maxResponseLength: Number(agentResponse.config.behavior.maxTokens),
          conversationMemory: agentResponse.config.contextSettings.enableMemory,
          escalationRules: []
        },
        appearance: {
          ...agentResponse.config.appearance,
          avatar: agentResponse.config.appearance.avatar?.[0] || "",
          theme: 'Light' in agentResponse.config.appearance.theme ? 'Light' : 'Dark',
          welcomeMessage: "Hello! How can I help you today?"
        }
      }
    };
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Recent Agents</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onClick={() => onNavigate('agents')}
          >
            View all
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {agents.length > 0 ? (
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105"
                onClick={() => {
                  const convertedAgent = convertAgentResponseToAgent(agent);
                  onSelectAgent(convertedAgent);
                  onNavigate('chat');
                }}
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center border border-blue-200/50 dark:border-blue-800/30">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{agent.description.slice(0, 50)}...</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    'Active' in agent.status
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center border-2 border-blue-200/50 dark:border-blue-800/30">
                <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ready to get started?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              Create your first AI agent and start building intelligent conversations that engage your users.
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => onNavigate('create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAgents;
