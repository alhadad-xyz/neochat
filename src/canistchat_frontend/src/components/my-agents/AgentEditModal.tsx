import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdDate: string;
  traits: string[];
  category?: string;
  visibility?: 'private' | 'public';
  tone?: string;
  style?: string;
  communicationStyle?: string;
  responsePattern?: string;
  context?: string;
  knowledgeSources?: Array<{
    type: 'manual' | 'url' | 'document' | 'api' | 'database';
    content: string;
    url?: string;
    metadata?: any;
  }>;
  maxResponseLength?: number;
  rememberConversation?: boolean;
  enableAnalytics?: boolean;
  trackPerformance?: boolean;
  temperature?: number;
  creativity?: number;
  topP?: number;
  contextWindow?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPromptTemplate?: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  welcomeMessage?: string;
  customCSS?: string;
  config?: {
    appearance?: {
      avatar?: string;
    };
  };
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const themes = [
    {
      id: 'professional-blue',
      name: 'Professional Blue',
      color: 'bg-blue-500',
      description: 'Clean and professional appearance'
    },
    {
      id: 'success-green',
      name: 'Success Green',
      color: 'bg-green-500',
      description: 'Friendly and approachable design'
    },
    {
      id: 'creative-purple',
      name: 'Creative Purple',
      color: 'bg-purple-500',
      description: 'Modern and creative styling'
    },
    {
      id: 'energetic-orange',
      name: 'Energetic Orange',
      color: 'bg-orange-500',
      description: 'Vibrant and energetic feel'
    }
  ];

  const personalityTraits = [
    'helpful', 'professional', 'friendly', 'enthusiastic',
    'patient', 'knowledgeable', 'empathetic', 'concise'
  ];

  useEffect(() => {
    if (agent) {
      const defaultFormData: Agent = {
        ...agent,
        category: agent.category || 'general',
        visibility: agent.visibility || 'private',
        tone: agent.tone || 'professional',
        style: agent.style || 'helpful',
        communicationStyle: agent.communicationStyle || 'professional',
        responsePattern: agent.responsePattern || 'detailed',
        context: agent.context || '',
        knowledgeSources: agent.knowledgeSources || [],
        maxResponseLength: agent.maxResponseLength || 500,
        rememberConversation: agent.rememberConversation !== undefined ? agent.rememberConversation : true,
        enableAnalytics: agent.enableAnalytics !== undefined ? agent.enableAnalytics : true,
        trackPerformance: agent.trackPerformance !== undefined ? agent.trackPerformance : true,
        temperature: agent.temperature || 0.7,
        creativity: agent.creativity || 0.8,
        topP: agent.topP || 0.9,
        contextWindow: agent.contextWindow || 4096,
        maxTokens: agent.maxTokens || 1000,
        frequencyPenalty: agent.frequencyPenalty || 0.0,
        presencePenalty: agent.presencePenalty || 0.0,
        systemPromptTemplate: agent.systemPromptTemplate || 'You are a helpful AI assistant.',
        config: {
          appearance: {
            avatar: agent.config?.appearance?.avatar || '',
          },
        },
        theme: agent.theme || 'professional-blue',
        primaryColor: agent.primaryColor || '#3B82F6',
        secondaryColor: agent.secondaryColor || '#EFF6FF',
        accentColor: agent.accentColor || '#3B82F6',
        borderRadius: agent.borderRadius || '8px',
        fontFamily: agent.fontFamily || 'Inter',
        fontSize: agent.fontSize || '14px',
        welcomeMessage: agent.welcomeMessage || 'Hello! How can I help you today?',
        customCSS: agent.customCSS || ''
      };
      setFormData(defaultFormData);
      setAvatarPreview(agent.config?.appearance?.avatar || null);
    }
  }, [agent]);

  if (!agent || !formData) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({ ...agent });
    setAvatarPreview(agent.config?.appearance?.avatar || null);
    onClose();
  };

  const handleInputChange = (field: keyof Agent, value: any) => {
    setFormData({ ...formData, [field]: value });
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

  const togglePersonalityTrait = (trait: string) => {
    const currentTraits = formData.traits || [];
    const updatedTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    
    setFormData({ ...formData, traits: updatedTraits });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData({ 
          ...formData, 
          config: {
            ...formData.config,
            appearance: {
              ...formData.config?.appearance,
              avatar: result
            }
          }
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData({ 
      ...formData, 
      config: {
        ...formData.config,
        appearance: {
          ...formData.config?.appearance,
          avatar: ''
        }
      }
    });
  };

  const addKnowledgeSource = () => {
    const currentSources = formData.knowledgeSources || [];
    setFormData({
      ...formData,
      knowledgeSources: [...currentSources, { type: 'manual', content: '', metadata: {} }]
    });
  };

  const removeKnowledgeSource = (index: number) => {
    const currentSources = formData.knowledgeSources || [];
    setFormData({
      ...formData,
      knowledgeSources: currentSources.filter((_, i) => i !== index)
    });
  };

  const updateKnowledgeSource = (index: number, field: 'type' | 'content', value: string) => {
    const currentSources = formData.knowledgeSources || [];
    const updated = [...currentSources];
    updated[index] = { ...updated[index], [field]: value };
    
    // Reset metadata when type changes
    if (field === 'type') {
      updated[index].metadata = {};
    }
    
    setFormData({
      ...formData,
      knowledgeSources: updated
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Edit Agent</DialogTitle>
            <div className="flex space-x-2">
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Agent Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="customer-support">Customer Support</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility</Label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={(e) => handleInputChange('visibility', e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                  </label>
                </div>
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
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
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
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Inactive</span>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{formData.createdDate}</p>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            
            {/* Avatar Upload */}
            <div className="space-y-4 mb-6">
              <Label className="text-gray-700 dark:text-gray-300">Avatar</Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  {avatarPreview || formData.config?.appearance?.avatar ? (
                    <div className="relative w-20 h-20 rounded-full overflow-hidden">
                      <img
                        src={avatarPreview || formData.config?.appearance?.avatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer w-full sm:w-auto"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Avatar'}
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 5MB, JPG/PNG/GIF supported
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4 mb-6">
              <Label className="text-gray-700 dark:text-gray-300">Theme</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleInputChange('theme', theme.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.theme === theme.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 ${theme.color} rounded-full mx-auto mb-2`} />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {theme.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {theme.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors and Typography */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</Label>
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="mt-1"
                  placeholder="#3B82F6"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</Label>
                <Input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="mt-1"
                  placeholder="#EFF6FF"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accent Color</Label>
                <Input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="mt-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Border Radius</Label>
                <Select value={formData.borderRadius} onValueChange={(value) => handleInputChange('borderRadius', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4px">Rounded (4px)</SelectItem>
                    <SelectItem value="8px">Rounded (8px)</SelectItem>
                    <SelectItem value="12px">Rounded (12px)</SelectItem>
                    <SelectItem value="16px">Rounded (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Family</Label>
                <Select value={formData.fontFamily} onValueChange={(value) => handleInputChange('fontFamily', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Modern)</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Font Size</Label>
                <Select value={formData.fontSize} onValueChange={(value) => handleInputChange('fontSize', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">Small (12px)</SelectItem>
                    <SelectItem value="14px">Medium (14px)</SelectItem>
                    <SelectItem value="16px">Large (16px)</SelectItem>
                    <SelectItem value="18px">Extra Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</Label>
                <Textarea
                  value={formData.welcomeMessage}
                  onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                  className="mt-1 min-h-[60px]"
                  placeholder="Hello! How can I help you today?"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom CSS</Label>
                <Textarea
                  value={formData.customCSS}
                  onChange={(e) => handleInputChange('customCSS', e.target.value)}
                  className="mt-1 min-h-[80px] font-mono text-sm"
                  placeholder="Add custom CSS styles..."
                />
              </div>
            </div>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personality</h3>
            
            {/* Personality Traits */}
            <div className="space-y-4 mb-6">
              <Label className="text-gray-700 dark:text-gray-300">Personality Traits</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {personalityTraits.map((trait) => (
                  <Button
                    key={trait}
                    variant={formData.traits?.includes(trait) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePersonalityTrait(trait)}
                    className={`${
                      formData.traits?.includes(trait)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {trait}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Traits */}
            <div className="space-y-4 mb-6">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Traits</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.traits?.filter(trait => !personalityTraits.includes(trait)).map((trait) => (
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
                  placeholder="Add a custom trait..."
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

            {/* Communication Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Style</Label>
                <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helpful">Helpful</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Communication Style</Label>
                <Select value={formData.communicationStyle} onValueChange={(value) => handleInputChange('communicationStyle', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="simplified">Simplified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Pattern</Label>
                <Select value={formData.responsePattern} onValueChange={(value) => handleInputChange('responsePattern', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Behavior</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Response Length</Label>
                <Input
                  type="number"
                  value={formData.maxResponseLength}
                  onChange={(e) => handleInputChange('maxResponseLength', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</Label>
                <Input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="conversation-memory"
                  checked={formData.rememberConversation}
                  onChange={(e) => handleInputChange('rememberConversation', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="conversation-memory" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable conversation memory
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enable-analytics"
                  checked={formData.enableAnalytics}
                  onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="enable-analytics" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable conversation analytics
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="track-performance"
                  checked={formData.trackPerformance}
                  onChange={(e) => handleInputChange('trackPerformance', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="track-performance" className="text-sm text-gray-700 dark:text-gray-300">
                  Track response times and performance metrics
                </Label>
              </div>
            </div>
          </div>

          {/* Knowledge Sources */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Knowledge Sources</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Context</Label>
                <Textarea
                  value={formData.context}
                  onChange={(e) => handleInputChange('context', e.target.value)}
                  className="mt-1 min-h-[100px]"
                  placeholder="Provide context about your agent's knowledge and capabilities..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Knowledge Sources</Label>
                <Button onClick={addKnowledgeSource} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </div>
              
              {formData.knowledgeSources?.map((source, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Select
                      value={source.type}
                      onValueChange={(value) => updateKnowledgeSource(index, 'type', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Text</SelectItem>
                        <SelectItem value="url">Web URL</SelectItem>
                        <SelectItem value="document">Document Upload</SelectItem>
                        <SelectItem value="api">API Integration</SelectItem>
                        <SelectItem value="database">Database Query</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => removeKnowledgeSource(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter knowledge content..."
                    value={source.content}
                    onChange={(e) => updateKnowledgeSource(index, 'content', e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Prompt</h3>
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">System Prompt Template</Label>
              <Textarea
                value={formData.systemPromptTemplate}
                onChange={(e) => handleInputChange('systemPromptTemplate', e.target.value)}
                className="mt-1 min-h-[100px] font-mono text-sm"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentEditModal;
