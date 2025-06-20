import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentFormData } from "@/pages/Dashboard";

interface PersonalityStepProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
}

const PersonalityStep = ({ formData, setFormData }: PersonalityStepProps) => {
  const personalityTraits = ["helpful", "professional", "friendly", "enthusiastic", "patient", "knowledgeable", "empathetic", "concise"];

  const toggleTrait = (trait: string) => {
    const updatedTraits = formData.personalityTraits.includes(trait) ? formData.personalityTraits.filter((t) => t !== trait) : [...formData.personalityTraits, trait];

    setFormData({ ...formData, personalityTraits: updatedTraits });
  };

  const handleSelectChange = (field: keyof AgentFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Personality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">
              Personality Traits <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {personalityTraits.map((trait) => (
                <Button
                  key={trait}
                  variant={formData.personalityTraits.includes(trait) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTrait(trait)}
                  className={`${formData.personalityTraits.includes(trait) ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-white/50 dark:bg-gray-700/50 border-white/30 dark:border-gray-600/30"}`}
                >
                  {trait}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => handleSelectChange("tone", value)}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
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

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Response Style</Label>
              <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
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

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Communication Style</Label>
              <Select value={formData.communicationStyle} onValueChange={(value) => handleSelectChange("communicationStyle", value)}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
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

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Response Pattern</Label>
              <Select value={formData.responsePattern} onValueChange={(value) => handleSelectChange("responsePattern", value)}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
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
      </CardContent>
    </Card>
  );
};

export default PersonalityStep;
