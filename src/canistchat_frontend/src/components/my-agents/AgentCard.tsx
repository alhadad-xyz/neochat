import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MoreVertical, Play, Pause, Edit, Trash2, Eye, MessageSquare, Code } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AgentViewModal from './AgentViewModal';
import AgentEditModal from './AgentEditModal';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  traits: string[];
}

interface AgentCardProps {
  agent: Agent;
  onStatusToggle?: (agentId: string, currentStatus: string) => void;
  onDelete?: (agentId: string) => void;
  onUpdate?: (agentId: string, updatedAgent: Partial<Agent>) => void;
  onSelect?: (agent: Agent) => void;
  onNavigate?: (view: string) => void;
}

const AgentCard = ({ agent, onStatusToggle, onDelete, onUpdate, onSelect, onNavigate }: AgentCardProps) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const isActive = agent.status === 'active';

  const handleViewClick = () => {
    setShowViewModal(true);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleChatClick = () => {
    if (onSelect && onNavigate) {
      onSelect(agent);
      onNavigate('embed');
    }
  };

  const handleSaveAgent = (updatedAgent: Agent) => {
    if (onUpdate) {
      onUpdate(agent.id, updatedAgent);
    }
    setShowEditModal(false);
  };

  const handleStatusToggle = async () => {
    if (!onStatusToggle || isTogglingStatus) return;
    
    setIsTogglingStatus(true);
    try {
      await onStatusToggle(agent.id, agent.status === 'active' ? 'Active' : 'Inactive');
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    // Add confirmation dialog
    if (!window.confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(agent.id);
    } catch (error) {
      console.error('Error deleting agent:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full">
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {agent.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={isActive ? "default" : "secondary"} className={`${
                    isActive 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {agent.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.traits && agent.traits.length > 0 ? (
              agent.traits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                >
                  {trait}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                No traits defined
              </span>
            )}
            {agent.traits && agent.traits.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                +{agent.traits.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created {agent.createdDate}
            </span>
          </div>

          {/* Chat Button - Primary Action */}
          {isActive && onSelect && onNavigate && (
            <Button 
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 min-h-[40px]"
              onClick={handleChatClick}
            >
              <Code className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Generate Embed Code</span>
            </Button>
          )}

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full sm:flex-1 text-xs min-h-[32px]" 
              onClick={handleViewClick}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className={`w-full sm:flex-1 text-xs min-h-[32px] ${
                isActive 
                  ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }`}
              onClick={handleStatusToggle}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus ? (
                <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-current"></div>
              ) : isActive ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Activate
                </>
              )}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full sm:flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[32px]"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-3 h-3 mr-1 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AgentViewModal
        agent={agent}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        onEdit={() => {
          setShowViewModal(false);
          setShowEditModal(true);
        }}
      />

      <AgentEditModal
        agent={agent}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveAgent}
      />
    </>
  );
};

export default AgentCard;
