import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgentFormData } from "@/pages/Dashboard";

interface BasicInfoStepProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
}

const BasicInfoStep = ({ formData, setFormData }: BasicInfoStepProps) => {
  const handleChange = (field: keyof AgentFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-gray-700 dark:text-gray-300">
            Agent Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="agent-name"
            placeholder="e.g. Customer Support Assistant"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe what your agent does and how it helps users..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="min-h-[120px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
            Category
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
            <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
              <SelectValue placeholder="Select a category" />
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

        <div className="space-y-3">
          <Label className="text-gray-700 dark:text-gray-300">Visibility</Label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === "private"}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Private (Only you can access)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === "public"}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Public (Anyone can access)</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoStep;
