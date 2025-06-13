import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AgentCreatorProps, AgentFormData } from '../types';

const AgentCreator: React.FC<AgentCreatorProps> = ({ sessionToken, onAgentCreated }) => {
  const [activeConfigTab, setActiveConfigTab] = useState('basic');
  const [creating, setCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    personality: {
      traits: [],
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
  });

  const configTabs = [
    { id: 'basic', name: 'Basic Info', required: true },
    { id: 'personality', name: 'Personality', required: true },
    { id: 'knowledge', name: 'Knowledge', required: false },
    { id: 'behavior', name: 'Behavior', required: false },
    { id: 'appearance', name: 'Appearance', required: false }
  ];

  const personalityTraits = [
    'helpful', 'professional', 'friendly', 'enthusiastic', 
    'patient', 'knowledgeable', 'empathetic', 'concise'
  ];

  const themes = [
    { id: 'blue', name: 'Professional Blue', color: 'bg-blue-500' },
    { id: 'green', name: 'Success Green', color: 'bg-green-500' },
    { id: 'purple', name: 'Creative Purple', color: 'bg-purple-500' },
    { id: 'orange', name: 'Energetic Orange', color: 'bg-orange-500' }
  ];

  const handleInputChange = (section: keyof AgentFormData, field: string, value: any) => {
    setFormData(prev => {
      // Handle top-level properties (name, description)
      if (section === 'name' || section === 'description') {
        return {
          ...prev,
          [section]: String(value || '')
        };
      }
      
      // Handle nested properties
      const sectionData = prev[section] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  };

  const handleTraitToggle = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        traits: prev.personality.traits.includes(trait)
          ? prev.personality.traits.filter(t => t !== trait)
          : [...prev.personality.traits, trait]
      }
    }));
  };

  const handleCreateAgent = async () => {
    try {
      setCreating(true);
      
      // Mock agent creation - in production, call the AgentManager canister
      console.log('Creating agent with data:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        personality: { traits: [], tone: 'professional', responseStyle: 'helpful' },
        knowledgeBase: { documents: [], sources: [], context: '' },
        behavior: { maxResponseLength: 500, conversationMemory: true, escalationRules: [] },
        appearance: { avatar: 'default', theme: 'blue', welcomeMessage: 'Hello! How can I help you today?' }
      });
      
      onAgentCreated();
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setCreating(false);
    }
  };

  const isFormValid = () => {
    return (typeof formData.name === 'string' && formData.name.trim()) && 
           (typeof formData.description === 'string' && formData.description.trim()) && 
           formData.personality.traits.length > 0;
  };

  const renderBasicConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agent Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', 'name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Customer Support Assistant"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', 'description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe what your agent does and how it helps users..."
        />
      </div>
    </div>
  );

  const renderPersonalityConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personality Traits *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {personalityTraits.map(trait => (
            <button
              key={trait}
              onClick={() => handleTraitToggle(trait)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                formData.personality.traits.includes(trait)
                  ? 'bg-primary-100 border-primary-300 text-primary-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <select
            value={formData.personality.tone}
            onChange={(e) => handleInputChange('personality', 'tone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
            <option value="playful">Playful</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Response Style</label>
          <select
            value={formData.personality.responseStyle}
            onChange={(e) => handleInputChange('personality', 'responseStyle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="helpful">Helpful</option>
            <option value="detailed">Detailed</option>
            <option value="concise">Concise</option>
            <option value="conversational">Conversational</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleInputChange('appearance', 'theme', theme.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                formData.appearance.theme === theme.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className={`w-6 h-6 ${theme.color} rounded-full mx-auto mb-2`}></div>
              <span className="text-xs text-gray-700">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
        <textarea
          value={formData.appearance.welcomeMessage}
          onChange={(e) => handleInputChange('appearance', 'welcomeMessage', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="What should your agent say when starting a conversation?"
        />
      </div>
    </div>
  );

  const renderKnowledgeConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
        <textarea
          value={formData.knowledgeBase.context}
          onChange={(e) => handleInputChange('knowledgeBase', 'context', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Provide background context for your agent..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Sources</label>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add a knowledge source URL"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button className="text-sm text-primary-600 hover:text-primary-700">
            + Add Source
          </button>
        </div>
      </div>
    </div>
  );

  const renderBehaviorConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Max Response Length</label>
        <input
          type="number"
          value={formData.behavior.maxResponseLength}
          onChange={(e) => handleInputChange('behavior', 'maxResponseLength', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          min="100"
          max="2000"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="conversationMemory"
          checked={formData.behavior.conversationMemory}
          onChange={(e) => handleInputChange('behavior', 'conversationMemory', e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="conversationMemory" className="ml-2 block text-sm text-gray-900">
          Remember conversation history
        </label>
      </div>
    </div>
  );

  const renderConfigContent = () => {
    switch (activeConfigTab) {
      case 'basic':
        return renderBasicConfig();
      case 'personality':
        return renderPersonalityConfig();
      case 'knowledge':
        return renderKnowledgeConfig();
      case 'behavior':
        return renderBehaviorConfig();
      case 'appearance':
        return renderAppearanceConfig();
      default:
        return renderBasicConfig();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Agent</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={!isFormValid() || creating}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Create Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Configuration Tabs */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-1">
                {configTabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveConfigTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeConfigTab === tab.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tab.name}</span>
                        {tab.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Configuration Content */}
          <div className="flex-1 p-6">
            {previewMode ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.name || 'Agent Name'}</h3>
                  <p className="text-gray-600 mb-4">{formData.description || 'Agent description will appear here...'}</p>
                  
                  {formData.personality.traits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Personality Traits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.personality.traits.map(trait => (
                          <span key={trait} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Tone: {formData.personality.tone} | Style: {formData.personality.responseStyle}
                  </div>
                </div>
              </div>
            ) : (
              renderConfigContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCreator; 