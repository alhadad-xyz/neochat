
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MoreVertical, Play, Pause, Edit, Trash2, Eye } from 'lucide-react';
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
}

const AgentCard = ({ agent }: AgentCardProps) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isActive = agent.status === 'active';

  const handleViewClick = () => {
    setShowViewModal(true);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSaveAgent = (updatedAgent: Agent) => {
    // Handle agent update logic here
    console.log('Saving agent:', updatedAgent);
  };

  return (
    <>
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-4">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {agent.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
              >
                {trait}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mb-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created {agent.createdDate}
            </span>
          </div>

          <div className="flex gap-2 justify-between">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleViewClick}>
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className={`flex-1 text-xs ${
                isActive 
                  ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              {isActive ? (
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
              className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
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
