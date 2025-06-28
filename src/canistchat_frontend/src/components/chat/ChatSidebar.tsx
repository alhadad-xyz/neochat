import React from 'react';
import { Search, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Agent } from '../../types';

interface ChatSidebarProps {
  selectedAgent: string | null;
  onSelectAgent: (agentId: string) => void;
  agents?: Agent[];
  isLoading?: boolean;
}

const ChatSidebar = ({ selectedAgent, onSelectAgent, agents = [], isLoading = false }: ChatSidebarProps) => {
  // Default agents for demo purposes if no agents provided
  const defaultAgents: Agent[] = [
    {
      id: 'sales-bot',
      name: 'Sales Bot',
      description: 'Assists with product recommendations and sales inquiries',
      status: 'Active',
      created: new Date().toISOString(),
      config: {
        personality: {
          traits: ['helpful', 'professional'],
          tone: 'friendly',
          responseStyle: 'concise'
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
          avatar: 'S',
          theme: 'blue',
          welcomeMessage: 'Hello! How can I help you today?'
        }
      }
    }
  ];

  const displayAgents = agents.length > 0 ? agents : defaultAgents;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search agents, chats, analytics..."
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Your Agents
          </h3>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayAgents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No agents yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Create your first agent to start chatting</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedAgent === agent.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectAgent(agent.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar
                        src={agent.config?.appearance?.avatar}
                        fallback={agent.name}
                        alt={`${agent.name} avatar`}
                        size="md"
                      />
                      {agent.status === 'Active' && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </h4>
                        <Badge 
                          variant={agent.status === 'Active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
