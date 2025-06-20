
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentFormData } from '@/pages/CreateAgent';

interface AgentPreviewProps {
  formData: AgentFormData;
}

const AgentPreview = ({ formData }: AgentPreviewProps) => {
  const getThemeColor = () => {
    switch (formData.theme) {
      case 'success-green':
        return 'from-green-500 to-green-600';
      case 'creative-purple':
        return 'from-purple-500 to-purple-600';
      case 'energetic-orange':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Agent Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getThemeColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xl font-bold">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {formData.name || 'Agent Name'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {formData.description || 'Agent description will appear here...'}
              </p>
              <div className="flex flex-wrap gap-2 text-sm mb-3">
                <span className="bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50">
                  Category: {formData.category}
                </span>
                <span className="bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50">
                  Visibility: {formData.visibility === 'private' ? 'Private' : 'Public'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personality Section */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Personality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Tone:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.tone}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Style:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.style}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Communication:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.communicationStyle}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Pattern:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.responsePattern}</span>
            </div>
          </div>
          {formData.personalityTraits.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.personalityTraits.map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Section */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Context:</span>
              <p className="text-gray-900 dark:text-white mt-1">
                {formData.context || 'None'}
              </p>
            </div>
            {formData.knowledgeSources.some(source => source.content.trim()) && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Knowledge Sources:</span>
                <div className="mt-2 space-y-2">
                  {formData.knowledgeSources
                    .filter(source => source.content.trim())
                    .map((source, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {source.type}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white truncate">
                          {source.content}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Behavior Section */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Max Response Length:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.maxResponseLength}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Conversation Memory:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formData.rememberConversation ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.temperature.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Creativity:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.creativity.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Top P:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.topP.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Context Window:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.contextWindow}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Max Tokens:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.maxTokens}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Frequency Penalty:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.frequencyPenalty.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Presence Penalty:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.presencePenalty.toFixed(1)}</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-600 dark:text-gray-400 text-sm">System Prompt:</span>
            <p className="text-gray-900 dark:text-white mt-1 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {formData.systemPromptTemplate}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Theme:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">
                  {formData.theme.replace('-', ' ')}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 dark:text-gray-400">Colors:</span>
                <div className="flex items-center ml-2 space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: formData.accentColor }}
                  />
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Border Radius:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formData.borderRadius}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Font:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formData.fontFamily}</span>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Welcome Message:</span>
              <p className="text-blue-600 dark:text-blue-400 mt-1 italic">
                "{formData.welcomeMessage}"
              </p>
            </div>

            {formData.customCSS && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">Custom CSS:</span>
                <pre className="text-xs text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">
                  {formData.customCSS}
                </pre>
              </div>
            )}
          </div>

          {/* Chat Preview */}
          <div className="mt-6">
            <span className="text-gray-600 dark:text-gray-400 text-sm mb-3 block">Chat Preview:</span>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-r ${getThemeColor()} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-medium">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    <p className="text-gray-900 dark:text-white text-sm">
                      {formData.welcomeMessage || "Hello! How can I help you today?"}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 mt-1 block">
                    Just now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentPreview;
