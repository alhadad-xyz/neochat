import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { AgentFormData } from '../AgentCreator';

interface BehaviorStepProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
}

const BehaviorStep = ({ formData, setFormData }: BehaviorStepProps) => {
  const handleMaxResponseChange = (value: string) => {
    setFormData({ ...formData, maxResponseLength: parseInt(value) || 500 });
  };

  const handleRememberConversationChange = (checked: boolean) => {
    setFormData({ ...formData, rememberConversation: checked });
  };

  const handleSliderChange = (field: keyof AgentFormData, value: number[]) => {
    setFormData({ ...formData, [field]: value[0] });
  };

  const handleInputChange = (field: keyof AgentFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Behavior</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="max-response" className="text-gray-700 dark:text-gray-300">
            Max Response Length
          </Label>
          <Input
            id="max-response"
            type="number"
            value={formData.maxResponseLength}
            onChange={(e) => handleMaxResponseChange(e.target.value)}
            placeholder="500"
            className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-conversation"
            checked={formData.rememberConversation}
            onCheckedChange={handleRememberConversationChange}
            className="border-white/30 dark:border-gray-600/30"
          />
          <Label
            htmlFor="remember-conversation"
            className="text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Remember conversation history
          </Label>
        </div>

        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">Analytics & Tracking</h4>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-analytics"
              checked={formData.enableAnalytics !== false}
              onCheckedChange={(checked) => setFormData({ ...formData, enableAnalytics: Boolean(checked) })}
              className="border-white/30 dark:border-gray-600/30"
            />
            <Label
              htmlFor="enable-analytics"
              className="text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Enable conversation analytics
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="track-performance"
              checked={formData.trackPerformance !== false}
              onCheckedChange={(checked) => setFormData({ ...formData, trackPerformance: Boolean(checked) })}
              className="border-white/30 dark:border-gray-600/30"
            />
            <Label
              htmlFor="track-performance"
              className="text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Track response times and performance metrics
            </Label>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Analytics help improve your agent's performance and provide insights into usage patterns.
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">
                Temperature
                <span className="text-sm text-gray-500 ml-2">({formData.temperature.toFixed(1)})</span>
              </Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={(value) => handleSliderChange('temperature', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">
                Creativity
                <span className="text-sm text-gray-500 ml-2">({formData.creativity.toFixed(1)})</span>
              </Label>
              <Slider
                value={[formData.creativity]}
                onValueChange={(value) => handleSliderChange('creativity', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservative (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">
                Top P
                <span className="text-sm text-gray-500 ml-2">({formData.topP.toFixed(1)})</span>
              </Label>
              <Slider
                value={[formData.topP]}
                onValueChange={(value) => handleSliderChange('topP', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.0</span>
                <span>1.0</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-window" className="text-gray-700 dark:text-gray-300">Context Window</Label>
              <Input
                id="context-window"
                type="number"
                value={formData.contextWindow}
                onChange={(e) => handleInputChange('contextWindow', parseInt(e.target.value) || 4096)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens" className="text-gray-700 dark:text-gray-300">Max Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={formData.maxTokens}
                onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value) || 1000)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">
                Frequency Penalty
                <span className="text-sm text-gray-500 ml-2">({formData.frequencyPenalty.toFixed(1)})</span>
              </Label>
              <Slider
                value={[formData.frequencyPenalty]}
                onValueChange={(value) => handleSliderChange('frequencyPenalty', value)}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-2.0</span>
                <span>2.0</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300">
                Presence Penalty
                <span className="text-sm text-gray-500 ml-2">({formData.presencePenalty.toFixed(1)})</span>
              </Label>
              <Slider
                value={[formData.presencePenalty]}
                onValueChange={(value) => handleSliderChange('presencePenalty', value)}
                max={2}
                min={-2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-2.0</span>
                <span>2.0</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="text-gray-700 dark:text-gray-300">System Prompt Template</Label>
            <Textarea
              id="system-prompt"
              placeholder="You are a helpful AI assistant."
              value={formData.systemPromptTemplate}
              onChange={(e) => handleInputChange('systemPromptTemplate', e.target.value)}
              className="min-h-[100px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BehaviorStep;
