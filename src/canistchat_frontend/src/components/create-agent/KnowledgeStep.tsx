import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, X, Upload } from 'lucide-react';
import { AgentFormData } from '../AgentCreator';

interface KnowledgeStepProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
}

const KnowledgeStep = ({ formData, setFormData }: KnowledgeStepProps) => {
  const addKnowledgeSource = () => {
    setFormData({
      ...formData,
      knowledgeSources: [...formData.knowledgeSources, { type: 'manual', content: '', metadata: {} }]
    });
  };

  const removeKnowledgeSource = (index: number) => {
    setFormData({
      ...formData,
      knowledgeSources: formData.knowledgeSources.filter((_, i) => i !== index)
    });
  };

  const updateKnowledgeSource = (index: number, field: 'type' | 'content', value: string) => {
    const updated = [...formData.knowledgeSources];
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

  const updateKnowledgeMetadata = (index: number, field: string, value: string) => {
    const updated = [...formData.knowledgeSources];
    updated[index] = {
      ...updated[index],
      metadata: { ...updated[index].metadata, [field]: value }
    };
    setFormData({
      ...formData,
      knowledgeSources: updated
    });
  };

  const handleContextChange = (value: string) => {
    setFormData({ ...formData, context: value });
  };

  const renderSourceFields = (source: any, index: number) => {
    switch (source.type) {
      case 'Database Query':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Database Connection</Label>
              <Input
                placeholder="Database name or connection string"
                value={source.metadata?.connectionString || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'connectionString', e.target.value)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Query or Table</Label>
              <Textarea
                placeholder="SQL query or table name"
                value={source.metadata?.queryOrTable || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'queryOrTable', e.target.value)}
                className="min-h-[80px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea
                placeholder="Describe the data structure and content..."
                value={source.metadata?.description || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'description', e.target.value)}
                className="min-h-[80px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
          </div>
        );

      case 'API Integration':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">API Endpoint</Label>
              <Input
                placeholder="https://api.example.com/data"
                value={source.metadata?.endpoint || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'endpoint', e.target.value)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">API Key (Optional)</Label>
              <Input
                placeholder="Enter API key if required"
                value={source.metadata?.apiKey || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'apiKey', e.target.value)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">API Description</Label>
              <Textarea
                placeholder="Describe what data this API provides..."
                value={source.metadata?.apiDescription || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'apiDescription', e.target.value)}
                className="min-h-[80px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
          </div>
        );

      case 'Document Upload':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-white/50 dark:bg-gray-800/50">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">PDF, TXT, DOC, DOCX, MD up to 10MB</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Document Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of the document content..."
                value={source.metadata?.documentDescription || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'documentDescription', e.target.value)}
                className="min-h-[80px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
          </div>
        );

      case 'Web URL':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Website URL</Label>
              <Input
                placeholder="https://example.com/article"
                value={source.metadata?.url || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'url', e.target.value)}
                className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300">Content Summary</Label>
              <Textarea
                placeholder="Summarize the key information from this URL..."
                value={source.metadata?.contentSummary || ''}
                onChange={(e) => updateKnowledgeMetadata(index, 'contentSummary', e.target.value)}
                className="min-h-[80px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
              />
            </div>
          </div>
        );

      case 'Manual Text':
      default:
        return (
          <div className="space-y-2">
            <Label className="text-sm text-gray-700 dark:text-gray-300">Knowledge Content</Label>
            <Textarea
              placeholder="Enter your knowledge content here..."
              value={source.content}
              onChange={(e) => updateKnowledgeSource(index, 'content', e.target.value)}
              className="min-h-[100px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            />
          </div>
        );
    }
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Knowledge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="context" className="text-gray-700 dark:text-gray-300">Context</Label>
          <Textarea
            id="context"
            placeholder="Provide background context for your agent..."
            value={formData.context}
            onChange={(e) => handleContextChange(e.target.value)}
            className="min-h-[120px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-gray-700 dark:text-gray-300">Knowledge Sources</Label>
          {formData.knowledgeSources.map((source, index) => (
            <div key={index} className="space-y-3 p-4 border border-white/30 dark:border-gray-600/30 rounded-lg bg-white/20 dark:bg-gray-800/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-700 dark:text-gray-300">Source Type</Label>
                {formData.knowledgeSources.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeKnowledgeSource(index)}
                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Select 
                value={source.type} 
                onValueChange={(value) => updateKnowledgeSource(index, 'type', value)}
              >
                <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Text">Manual Text</SelectItem>
                  <SelectItem value="Web URL">Web URL</SelectItem>
                  <SelectItem value="Document Upload">Document Upload</SelectItem>
                  <SelectItem value="API Integration">API Integration</SelectItem>
                  <SelectItem value="Database Query">Database Query</SelectItem>
                </SelectContent>
              </Select>
              
              {renderSourceFields(source, index)}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addKnowledgeSource}
            className="w-full bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Knowledge Source
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeStep;
