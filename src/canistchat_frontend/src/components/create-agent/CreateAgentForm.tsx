
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoStep from './BasicInfoStep';
import PersonalityStep from './PersonalityStep';
import KnowledgeStep from './KnowledgeStep';
import BehaviorStep from './BehaviorStep';
import AppearanceStep from './AppearanceStep';
import { AgentFormData } from '@/pages/CreateAgent';

interface CreateAgentFormProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
  lastActiveStep: string;
  setLastActiveStep: (step: string) => void;
}

const CreateAgentForm = ({ formData, setFormData, lastActiveStep, setLastActiveStep }: CreateAgentFormProps) => {
  const [activeTab, setActiveTab] = useState(lastActiveStep);

  useEffect(() => {
    setActiveTab(lastActiveStep);
  }, [lastActiveStep]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setLastActiveStep(newTab);
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info', component: BasicInfoStep },
    { id: 'personality', label: 'Personality', component: PersonalityStep },
    { id: 'knowledge', label: 'Knowledge', component: KnowledgeStep },
    { id: 'behavior', label: 'Behavior', component: BehaviorStep },
    { id: 'appearance', label: 'Appearance', component: AppearanceStep },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl sticky top-8">
          <CardContent className="p-6">
            <nav className="space-y-2">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleTabChange(step.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === step.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Form Content */}
      <div className="lg:col-span-3">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {steps.map((step) => (
            <TabsContent key={step.id} value={step.id}>
              <step.component formData={formData} setFormData={setFormData} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CreateAgentForm;
