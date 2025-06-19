
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  traits: string[];
}

interface AgentEditModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAgent: Agent) => void;
}

const AgentEditModal = ({ agent, isOpen, onClose, onSave }: AgentEditModalProps) => {
  const [formData, setFormData] = useState<Agent | null>(null);
  const [newTrait, setNewTrait] = useState('');

  useEffect(() => {
    if (agent) {
      setFormData({ ...agent });
    }
  }, [agent]);

  if (!agent || !formData) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({ ...agent });
    onClose();
  };

  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData({
        ...formData,
        traits: [...formData.traits, newTrait.trim()]
      });
      setNewTrait('');
    }
  };

  const removeTrait = (traitToRemove: string) => {
    setFormData({
      ...formData,
      traits: formData.traits.filter(trait => trait !== traitToRemove)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Edit Agent</DialogTitle>
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{formData.createdDate}</p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Color</Label>
                <Input
                  type="color"
                  defaultValue="#885CF6"
                  className="mt-1 h-10 w-20"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</Label>
                <Input
                  defaultValue="default"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                <Textarea
                  defaultValue="Hello! How can I help you today?"
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Behavior</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Response Length</Label>
                <Input
                  type="number"
                  defaultValue="500"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="conversation-memory"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="conversation-memory" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable conversation memory
                </Label>
              </div>
            </div>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personality</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Personality Traits</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {formData.traits.map((trait) => (
                    <Badge
                      key={trait}
                      variant="secondary"
                      className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      <span>{trait}</span>
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeTrait(trait)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a trait..."
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                    className="flex-1"
                  />
                  <Button onClick={addTrait} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone</Label>
                <Input
                  defaultValue="casual"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Style</Label>
                <Input
                  defaultValue="concise"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Knowledge Sources */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Knowledge Sources</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900 dark:text-white">Manual</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
              </div>
              <Textarea
                defaultValue="Lorem ipsum dolor sit amet consectetur adipisicing elit..."
                className="min-h-[60px] mb-2"
              />
              <Input
                placeholder="Type: main-context"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentEditModal;
