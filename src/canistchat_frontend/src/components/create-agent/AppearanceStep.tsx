import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Upload, X } from 'lucide-react';
import { AgentFormData } from '../AgentCreator';

interface AppearanceStepProps {
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
}

const AppearanceStep = ({ formData, setFormData }: AppearanceStepProps) => {
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

  const handleThemeChange = (themeId: string) => {
    setFormData({ ...formData, theme: themeId });
  };

  const handleInputChange = (field: keyof AgentFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
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
        setFormData({ ...formData, avatarUrl: result });
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
    setFormData({ ...formData, avatarUrl: '' });
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 dark:border-gray-700/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-white">Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-4">
          <Label className="text-gray-700 dark:text-gray-300">Avatar</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              {avatarPreview || formData.avatarUrl ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <img
                    src={avatarPreview || formData.avatarUrl}
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
        <div className="space-y-4">
          <Label className="text-gray-700 dark:text-gray-300">Theme</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-3 md:p-4 rounded-lg border transition-all ${
                  formData.theme === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50'
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

        {/* Color Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-gray-700 dark:text-gray-300">Primary Color</Label>
            <Input
              id="primary-color"
              type="text"
              placeholder="#3B82F6"
              value={formData.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color" className="text-gray-700 dark:text-gray-300">Secondary Color</Label>
            <Input
              id="secondary-color"
              type="text"
              placeholder="#EFF6FF"
              value={formData.secondaryColor}
              onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
              className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color" className="text-gray-700 dark:text-gray-300">Accent Color</Label>
            <Input
              id="accent-color"
              type="text"
              placeholder="#3B82F6"
              value={formData.accentColor}
              onChange={(e) => handleInputChange('accentColor', e.target.value)}
              className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
            />
          </div>
        </div>

        {/* Typography and Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Border Radius</Label>
            <Select value={formData.borderRadius} onValueChange={(value) => handleInputChange('borderRadius', value)}>
              <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded (4px)">Rounded (4px)</SelectItem>
                <SelectItem value="rounded (8px)">Rounded (8px)</SelectItem>
                <SelectItem value="rounded (12px)">Rounded (12px)</SelectItem>
                <SelectItem value="rounded (16px)">Rounded (16px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Font Family</Label>
            <Select value={formData.fontFamily} onValueChange={(value) => handleInputChange('fontFamily', value)}>
              <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter (Modern)">Inter (Modern)</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label className="text-gray-700 dark:text-gray-300">Font Size</Label>
            <Select value={formData.fontSize} onValueChange={(value) => handleInputChange('fontSize', value)}>
              <SelectTrigger className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small (12px)">Small (12px)</SelectItem>
                <SelectItem value="Medium (14px)">Medium (14px)</SelectItem>
                <SelectItem value="Large (16px)">Large (16px)</SelectItem>
                <SelectItem value="Extra Large (18px)">Extra Large (18px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-2">
          <Label htmlFor="welcome-message" className="text-gray-700 dark:text-gray-300">
            Welcome Message
          </Label>
          <Textarea
            id="welcome-message"
            placeholder="Hello! How can I help you today?"
            value={formData.welcomeMessage}
            onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
            className="min-h-[100px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30"
          />
        </div>

        {/* Custom CSS */}
        <div className="space-y-2">
          <Label htmlFor="custom-css" className="text-gray-700 dark:text-gray-300">Custom CSS</Label>
          <Textarea
            id="custom-css"
            placeholder="Add custom CSS styles for your agent interface..."
            value={formData.customCSS}
            onChange={(e) => handleInputChange('customCSS', e.target.value)}
            className="min-h-[120px] bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-white/30 dark:border-gray-600/30 font-mono text-sm"
          />
          <p className="text-xs text-gray-500">Optional: Add custom CSS to further customize the appearance</p>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-white/30 dark:border-gray-600/30">
          <Label className="text-gray-700 dark:text-gray-300 mb-3 block">Preview</Label>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                {avatarPreview || formData.avatarUrl ? (
                  <img
                    src={avatarPreview || formData.avatarUrl}
                    alt="Agent avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${themes.find(t => t.id === formData.theme)?.color || 'bg-blue-500'} flex items-center justify-center`}>
                    <span className="text-white text-sm font-medium">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formData.welcomeMessage || "Hello! How can I help you today?"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceStep;
