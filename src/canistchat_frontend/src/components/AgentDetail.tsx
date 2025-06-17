import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Agent } from '../types';

interface AgentDetailProps {
  agent: Agent | null;
  onClose: () => void;
  onEdit: (agent: Agent) => void;
  onUpdate: (agentId: string, updatedAgent: Partial<Agent>) => void;
}

const AgentDetail: React.FC<AgentDetailProps> = ({ agent, onClose, onEdit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null);

  if (!agent) return null;

  const handleEdit = () => {
    setEditedAgent({ ...agent });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedAgent) {
      await onUpdate(agent.id, editedAgent);
      setIsEditing(false);
      setEditedAgent(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAgent(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (editedAgent) {
      setEditedAgent({
        ...editedAgent,
        [field]: value
      });
    }
  };

  const handleConfigChange = (section: string, field: string, value: any) => {
    if (editedAgent) {
      setEditedAgent({
        ...editedAgent,
        config: {
          ...editedAgent.config,
          [section]: {
            ...editedAgent.config[section as keyof typeof editedAgent.config],
            [field]: value
          }
        }
      });
    }
  };

  const handleTraitAdd = (trait: string) => {
    if (editedAgent && trait.trim()) {
      const currentTraits = editedAgent.config.personality.traits;
      if (!currentTraits.includes(trait.trim())) {
        handleConfigChange('personality', 'traits', [...currentTraits, trait.trim()]);
      }
    }
  };

  const handleTraitRemove = (index: number) => {
    if (editedAgent) {
      const currentTraits = editedAgent.config.personality.traits;
      handleConfigChange('personality', 'traits', currentTraits.filter((_, i) => i !== index));
    }
  };

  const currentAgent = isEditing ? editedAgent : agent;

  if (!currentAgent) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Agent' : 'Agent Details'}
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentAgent.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{currentAgent.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={currentAgent.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{currentAgent.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentAgent.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : currentAgent.status === 'Inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {currentAgent.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p className="text-gray-600">
                    {new Date(currentAgent.created).toLocaleDateString()} at{' '}
                    {new Date(currentAgent.created).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Personality Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personality</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personality Traits
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a trait..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleTraitAdd((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Add a trait..."]') as HTMLInputElement;
                            if (input) {
                              handleTraitAdd(input.value);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentAgent.config.personality.traits.map((trait, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {trait}
                            <button
                              onClick={() => handleTraitRemove(index)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {currentAgent.config.personality.traits.map((trait, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentAgent.config.personality.tone}
                      onChange={(e) => handleConfigChange('personality', 'tone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{currentAgent.config.personality.tone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Style
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentAgent.config.personality.responseStyle}
                      onChange={(e) => handleConfigChange('personality', 'responseStyle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{currentAgent.config.personality.responseStyle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Configuration */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme Color
                  </label>
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={currentAgent.config.appearance.theme}
                        onChange={(e) => handleConfigChange('appearance', 'theme', e.target.value)}
                        className="w-12 h-8 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={currentAgent.config.appearance.theme}
                        onChange={(e) => handleConfigChange('appearance', 'theme', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: currentAgent.config.appearance.theme }}
                      ></div>
                      <span className="text-sm text-gray-600">{currentAgent.config.appearance.theme}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentAgent.config.appearance.avatar}
                      onChange={(e) => handleConfigChange('appearance', 'avatar', e.target.value)}
                      placeholder="Enter avatar URL or identifier"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{currentAgent.config.appearance.avatar}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message
                  </label>
                  {isEditing ? (
                    <textarea
                      value={currentAgent.config.appearance.welcomeMessage}
                      onChange={(e) => handleConfigChange('appearance', 'welcomeMessage', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{currentAgent.config.appearance.welcomeMessage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Behavior Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Behavior</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Response Length
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={currentAgent.config.behavior.maxResponseLength}
                      onChange={(e) => handleConfigChange('behavior', 'maxResponseLength', parseInt(e.target.value))}
                      min="100"
                      max="2000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{currentAgent.config.behavior.maxResponseLength} characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conversation Memory
                  </label>
                  {isEditing ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentAgent.config.behavior.conversationMemory}
                        onChange={(e) => handleConfigChange('behavior', 'conversationMemory', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enable conversation memory</span>
                    </label>
                  ) : (
                    <p className="text-gray-600">
                      {currentAgent.config.behavior.conversationMemory ? 'Enabled' : 'Disabled'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Sources */}
        {currentAgent.config.knowledgeBase.sources && currentAgent.config.knowledgeBase.sources.length > 0 && (
          <div className="mt-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentAgent.config.knowledgeBase.sources.map((source, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {source.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {source.metadata?.fileSize ? `${source.metadata.fileSize} bytes` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{source.content}</p>
                    {source.metadata && Object.keys(source.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(source.metadata).map(([key, value], idx) => (
                          <span key={idx} className="text-xs text-gray-500">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Context */}
        <div className="mt-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Base Context</h3>
            {isEditing ? (
              <textarea
                value={currentAgent.config.knowledgeBase.context}
                onChange={(e) => handleConfigChange('knowledgeBase', 'context', e.target.value)}
                rows={4}
                placeholder="Enter additional context or instructions for the agent..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-600 text-sm">
                {currentAgent.config.knowledgeBase.context || 'No knowledge base context configured'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail; 