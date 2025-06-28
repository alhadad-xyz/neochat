
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  traits: string[];
  config?: {
    appearance?: {
      avatar?: string;
    };
  };
}

interface AgentViewModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const AgentViewModal = ({ agent, isOpen, onClose, onEdit }: AgentViewModalProps) => {
  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Agent Details</DialogTitle>
            <Button onClick={onEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white">{agent.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <div className="mt-1">
                  <Badge variant={agent.status === 'active' ? "default" : "secondary"} className={`${
                    agent.status === 'active' 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-white">{agent.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="text-gray-900 dark:text-white">{agent.createdDate}</p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Theme Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-gray-300"></div>
                  <span className="text-gray-900 dark:text-white">#885CF6</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Avatar</label>
                <div className="mt-2">
                  <Avatar
                    src={agent.config?.appearance?.avatar}
                    fallback={agent.name}
                    alt={`${agent.name} avatar`}
                    size="lg"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Welcome Message</label>
                <p className="text-gray-900 dark:text-white">Hello! How can I help you today?</p>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Behavior</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Response Length</label>
                <p className="text-gray-900 dark:text-white">500 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversation Memory</label>
                <p className="text-gray-900 dark:text-white">Enabled</p>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personality</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Personality Traits</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agent.traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tone</label>
                <p className="text-gray-900 dark:text-white">Casual</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Style</label>
                <p className="text-gray-900 dark:text-white">Concise</p>
              </div>
            </div>
          </div>

          {/* Knowledge Sources */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Knowledge Sources</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">Manual</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Lorem ipsum dolor sit amet consectetur adipisicing elit...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Type: main-context
              </p>
            </div>
          </div>

          {/* Knowledge Base Context */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Knowledge Base Context</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Lorem ipsum dolor sit amet consectetur adipisicing elit...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentViewModal;
