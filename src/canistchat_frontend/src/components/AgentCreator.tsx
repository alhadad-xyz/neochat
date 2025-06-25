import React, { useState } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { AgentCreatorProps, Agent } from '../types';
import { canisterService, CreateAgentRequest } from '../services/canisterService';
import CreateAgentForm from './create-agent/CreateAgentForm';
import AgentPreview from './create-agent/AgentPreview';

// Define the AgentFormData interface for the new modular components
export interface AgentFormData {
  name: string;
  description: string;
  category: string;
  visibility: 'private' | 'public';
  personalityTraits: string[];
  tone: string;
  style: string;
  communicationStyle: string;
  responsePattern: string;
  context: string;
  knowledgeSources: Array<{
    type: 'manual' | 'url' | 'document' | 'api' | 'database';
    content: string;
    url?: string;
    metadata?: any;
  }>;
  maxResponseLength: number;
  rememberConversation: boolean;
  enableAnalytics: boolean;
  trackPerformance: boolean;
  temperature: number;
  creativity: number;
  topP: number;
  contextWindow: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPromptTemplate: string;
  avatarUrl: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  welcomeMessage: string;
  customCSS: string;
}

const AgentCreator: React.FC<AgentCreatorProps> = ({ sessionToken, onAgentCreated }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActiveStep, setLastActiveStep] = useState('basic-info');
  
  // Form state with default values
  const [agentFormData, setAgentFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    category: 'general',
    visibility: 'private',
    personalityTraits: [],
    tone: 'professional',
    style: 'helpful',
    communicationStyle: 'professional',
    responsePattern: 'detailed',
    context: '',
    knowledgeSources: [],
    maxResponseLength: 500,
    rememberConversation: true,
    enableAnalytics: true,
    trackPerformance: true,
    temperature: 0.7,
    creativity: 0.8,
    topP: 0.9,
    contextWindow: 4096,
    maxTokens: 1000,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPromptTemplate: 'You are a helpful AI assistant.',
    avatarUrl: '',
    theme: 'professional-blue',
    primaryColor: '#3B82F6',
    secondaryColor: '#EFF6FF',
    accentColor: '#3B82F6',
    borderRadius: '8px',
    fontFamily: 'Inter',
    fontSize: '14px',
    welcomeMessage: 'Hello! How can I help you today?',
    customCSS: ''
  });

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const navigate = (path: string) => {
    console.log('Navigate to:', path);
  };

  const handleCreateAgent = async () => {
    try {
      setCreating(true);
      setError(null);
      
      // Convert form data to canister format
      const agentRequest: CreateAgentRequest = {
        name: agentFormData.name,
        description: agentFormData.description,
        category: agentFormData.category,
        isPublic: agentFormData.visibility === 'public',
        tags: agentFormData.personalityTraits,
        config: {
          personality: {
            traits: agentFormData.personalityTraits,
            tone: agentFormData.tone,
            style: agentFormData.style,
            communicationStyle: agentFormData.communicationStyle === 'conversational' ? { 'Conversational': null } :
                               agentFormData.communicationStyle === 'creative' ? { 'Creative': null } :
                               agentFormData.communicationStyle === 'educational' ? { 'Educational': null } :
                               agentFormData.communicationStyle === 'technical' ? { 'Technical': null } :
                               { 'Professional': null },
            responsePattern: agentFormData.responsePattern === 'concise' ? { 'Concise': null } :
                           agentFormData.responsePattern === 'narrative' ? { 'Narrative': null } :
                           agentFormData.responsePattern === 'structured' ? { 'Structured': null } :
                           { 'Detailed': null }
          },
          behavior: {
            responseLength: agentFormData.maxResponseLength <= 300 ? { 'Short': null } : 
                          agentFormData.maxResponseLength <= 700 ? { 'Medium': null } : { 'Long': null },
            temperature: agentFormData.temperature,
            creativity: agentFormData.creativity,
            topP: agentFormData.topP,
            contextWindow: BigInt(agentFormData.contextWindow),
            maxTokens: BigInt(agentFormData.maxTokens),
            frequencyPenalty: agentFormData.frequencyPenalty,
            presencePenalty: agentFormData.presencePenalty,
            systemPromptTemplate: agentFormData.systemPromptTemplate
          },
          appearance: {
            primaryColor: agentFormData.primaryColor,
            secondaryColor: agentFormData.secondaryColor,
            accentColor: agentFormData.accentColor,
            borderRadius: agentFormData.borderRadius,
            avatar: agentFormData.avatarUrl ? [agentFormData.avatarUrl] : [],
            customCSS: agentFormData.customCSS ? [agentFormData.customCSS] : [],
            fontFamily: agentFormData.fontFamily,
            fontSize: agentFormData.fontSize,
            theme: { 'Auto': null }
          },
          contextSettings: {
            enableLearning: true,
            enableMemory: agentFormData.rememberConversation,
            maxContextMessages: BigInt(10),
            memoryDuration: BigInt(3600)
          },
          integrationSettings: {
            allowedOrigins: [],
            rateLimiting: {
              enabled: false,
              maxRequestsPerHour: BigInt(1000),
              maxTokensPerHour: BigInt(100000)
            },
            webhooks: []
          },
          knowledgeBase: [
            // Add the main context as the first knowledge source
            {
              id: 'main-context',
              content: agentFormData.context || 'General knowledge assistant',
              sourceType: { 'Manual': null },
              metadata: [['type', 'main-context']] as [string, string][],
              isActive: true,
              lastUpdated: BigInt(Date.now()),
              priority: BigInt(1),
              version: BigInt(1)
            },
            // Add additional knowledge sources
            ...agentFormData.knowledgeSources.map((source, index) => ({
              id: `source-${index}`,
              content: source.content,
              sourceType: source.type === 'manual' ? { 'Manual': null } :
                         source.type === 'url' ? { 'URL': null } :
                         source.type === 'document' ? { 'Document': null } :
                         source.type === 'api' ? { 'API': null } :
                         { 'Database': null },
              metadata: [
                ['type', source.type.toLowerCase()],
                ...(source.url ? [['url', source.url]] : []),
                ...(source.metadata ? Object.entries(source.metadata).map(([key, value]) => [key, String(value)]) : [])
              ] as [string, string][],
              isActive: true,
              lastUpdated: BigInt(Date.now()),
              priority: BigInt(index + 2),
              version: BigInt(1)
            }))
          ],
          version: BigInt(1)
        }
      };
      
      console.log('Creating agent with canister:', agentRequest);
      
      // Call the actual canister
      const agentId = await canisterService.createAgent(agentRequest);
      console.log('Agent created successfully with ID:', agentId);
      
      // Create an Agent object to pass to the callback
      const createdAgent: Agent = {
        id: agentId,
        name: agentFormData.name,
        description: agentFormData.description,
        status: { 'Active': null } as any,
        created: Date.now().toString(),
        avatar: undefined,
        config: {
          personality: {
            traits: agentFormData.personalityTraits,
            tone: agentFormData.tone,
            responseStyle: agentFormData.style
          },
          knowledgeBase: {
            documents: [],
            sources: agentFormData.knowledgeSources.map(source => ({
              type: source.type === 'manual' ? 'Manual' as const :
                    source.type === 'url' ? 'URL' as const :
                    source.type === 'document' ? 'Document' as const :
                    source.type === 'api' ? 'API' as const :
                    'Database' as const,
              content: source.content,
              url: source.url,
              metadata: source.metadata
            })),
            context: agentFormData.context
          },
          behavior: {
            maxResponseLength: agentFormData.maxResponseLength,
            conversationMemory: agentFormData.rememberConversation,
            escalationRules: []
          },
          appearance: {
            avatar: undefined,
            theme: agentFormData.theme,
            welcomeMessage: agentFormData.welcomeMessage
          }
        }
      };
      
      // Reset form
      setAgentFormData({
        name: '',
        description: '',
        category: 'general',
        visibility: 'private',
        personalityTraits: [],
        tone: 'professional',
        style: 'helpful',
        communicationStyle: 'professional',
        responsePattern: 'detailed',
        context: '',
        knowledgeSources: [],
        maxResponseLength: 500,
        rememberConversation: true,
        enableAnalytics: true,
        trackPerformance: true,
        temperature: 0.7,
        creativity: 0.8,
        topP: 0.9,
        contextWindow: 4096,
        maxTokens: 1000,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        systemPromptTemplate: 'You are a helpful AI assistant.',
        avatarUrl: '',
        theme: 'professional-blue',
        primaryColor: '#3B82F6',
        secondaryColor: '#EFF6FF',
        accentColor: '#3B82F6',
        borderRadius: '8px',
        fontFamily: 'Inter',
        fontSize: '14px',
        welcomeMessage: 'Hello! How can I help you today?',
        customCSS: ''
      });
      
      onAgentCreated(createdAgent);
    } catch (error) {
      console.error('Failed to create agent:', error);
      setError(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setCreating(false);
    }
  };

  const getThemeColor = (theme: string): string => {
    const colors: { [key: string]: string } = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B'
    };
    return colors[theme] || colors.blue;
  };

  const getThemeSecondaryColor = (theme: string): string => {
    const colors: { [key: string]: string } = {
      blue: '#EFF6FF',
      green: '#ECFDF5',
      purple: '#F3E8FF',
      orange: '#FFFBEB'
    };
    return colors[theme] || colors.blue;
  };

  const isFormValid = () => {
    return agentFormData.name.trim() && 
           agentFormData.description.trim() && 
           agentFormData.personalityTraits.length > 0;
  };

  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                {showPreview ? 'Agent Preview' : 'Create New Agent'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                {showPreview ? 'Preview your AI agent before creating' : 'Build an intelligent AI agent tailored to your needs'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-white/20 dark:border-gray-700/50 w-full sm:w-auto"
                onClick={showPreview ? handleBackToForm : handleShowPreview}
              >
                {showPreview ? (
                  <>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Form
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </>
                )}
              </Button>
              {!showPreview && (
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg w-full sm:w-auto"
                  onClick={handleCreateAgent}
                  disabled={!isFormValid() || creating}
                >
                  {creating ? 'Creating...' : 'Create Agent'}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {showPreview ? (
          <AgentPreview formData={agentFormData} />
        ) : (
          <CreateAgentForm 
            formData={agentFormData} 
            setFormData={setAgentFormData}
            lastActiveStep={lastActiveStep}
            setLastActiveStep={setLastActiveStep}
          />
        )}
      </div>
    </main>
  );
};

export default AgentCreator; 