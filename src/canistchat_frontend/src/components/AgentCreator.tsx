import React, { useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AgentCreatorProps, AgentFormData } from "../types";
import { canisterService, CreateAgentRequest } from "../services/canisterService";

const AgentCreator: React.FC<AgentCreatorProps> = ({ sessionToken, onAgentCreated }) => {
  const [activeConfigTab, setActiveConfigTab] = useState("basic");
  const [creating, setCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    personality: {
      traits: [],
      tone: "professional",
      responseStyle: "helpful",
      communicationStyle: "Professional",
      responsePattern: "Detailed",
    },
    knowledgeBase: {
      documents: [],
      sources: [],
      context: "",
    },
    behavior: {
      maxResponseLength: 500,
      conversationMemory: true,
      escalationRules: [],
      temperature: 0.7,
      creativity: 0.8,
      topP: 0.9,
      contextWindow: 4096,
      maxTokens: 1000,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      systemPromptTemplate: "You are a helpful AI assistant.",
    },
    appearance: {
      avatar: "default",
      theme: "blue",
      welcomeMessage: "Hello! How can I help you today?",
      primaryColor: "#3B82F6",
      secondaryColor: "#EFF6FF",
      accentColor: "#3B82F6",
      borderRadius: "8px",
      customCSS: "",
      fontFamily: "Inter",
      fontSize: "14px",
    },
    contextSettings: {
      enableLearning: true,
      enableMemory: true,
      maxContextMessages: 10,
      memoryDuration: 3600,
    },
    integrationSettings: {
      allowedOrigins: [],
      rateLimiting: {
        enabled: false,
        maxRequestsPerHour: 1000,
        maxTokensPerHour: 100000,
      },
      webhooks: [],
    },
    category: "General",
    isPublic: false,
  });

  // Add state for knowledge sources
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceContent, setNewSourceContent] = useState("");
  const [newSourceType, setNewSourceType] = useState<"Manual" | "URL" | "Document" | "API" | "Database">("Manual");
  const [newSourceFile, setNewSourceFile] = useState<File | null>(null);
  const [newSourceApiEndpoint, setNewSourceApiEndpoint] = useState("");
  const [newSourceApiKey, setNewSourceApiKey] = useState("");
  const [newSourceDatabase, setNewSourceDatabase] = useState("");
  const [newSourceQuery, setNewSourceQuery] = useState("");

  const configTabs = [
    { id: "basic", name: "Basic Info", required: true },
    { id: "personality", name: "Personality", required: true },
    { id: "knowledge", name: "Knowledge", required: false },
    { id: "behavior", name: "Behavior", required: false },
    { id: "appearance", name: "Appearance", required: false },
  ];

  const personalityTraits = ["helpful", "professional", "friendly", "enthusiastic", "patient", "knowledgeable", "empathetic", "concise"];

  const themes = [
    { id: "blue", name: "Professional Blue", color: "bg-blue-500" },
    { id: "green", name: "Success Green", color: "bg-green-500" },
    { id: "purple", name: "Creative Purple", color: "bg-purple-500" },
    { id: "orange", name: "Energetic Orange", color: "bg-orange-500" },
  ];

  const handleInputChange = (section: keyof AgentFormData, field: string, value: any) => {
    setFormData((prev) => {
      // Handle top-level properties (name, description, category, isPublic)
      if (section === "name" || section === "description" || section === "category" || section === "isPublic") {
        return {
          ...prev,
          [section]: section === "isPublic" ? Boolean(value) : String(value || ""),
        };
      }

      // Handle nested properties
      const sectionData = prev[section] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      };
    });
  };

  const handleTraitToggle = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personality: {
        ...prev.personality,
        traits: prev.personality.traits.includes(trait) ? prev.personality.traits.filter((t) => t !== trait) : [...prev.personality.traits, trait],
      },
    }));
  };

  const handleAddKnowledgeSource = async () => {
    let content = newSourceContent;
    let url = newSourceUrl;

    // Handle different source types
    switch (newSourceType) {
      case "Document":
        if (!newSourceFile) {
          alert("Please select a file for document source");
          return;
        }
        // For now, we'll use the file name as content
        // In a real implementation, you'd upload the file and get its content
        content = `Document: ${newSourceFile.name}`;
        break;

      case "API":
        if (!newSourceApiEndpoint.trim()) {
          alert("Please enter API endpoint");
          return;
        }
        content = `API Endpoint: ${newSourceApiEndpoint}`;
        url = newSourceApiEndpoint;
        break;

      case "Database":
        if (!newSourceDatabase.trim() || !newSourceQuery.trim()) {
          alert("Please enter database connection and query");
          return;
        }
        content = `Database: ${newSourceDatabase} | Query: ${newSourceQuery}`;
        break;

      case "URL":
        if (!newSourceUrl.trim()) {
          alert("Please enter URL");
          return;
        }
        if (!newSourceContent.trim()) {
          alert("Please enter content for URL source");
          return;
        }
        break;

      case "Manual":
      default:
        if (!newSourceContent.trim()) {
          alert("Please enter content for manual source");
          return;
        }
        break;
    }

    const source = {
      type: newSourceType,
      content: content,
      url: url,
      // Additional metadata for different types
      metadata: {
        ...(newSourceType === "Document" &&
          newSourceFile && {
            fileName: newSourceFile.name,
            fileSize: newSourceFile.size,
            fileType: newSourceFile.type,
          }),
        ...(newSourceType === "API" && {
          apiEndpoint: newSourceApiEndpoint,
          hasApiKey: !!newSourceApiKey,
        }),
        ...(newSourceType === "Database" && {
          database: newSourceDatabase,
          query: newSourceQuery,
        }),
      },
    };

    setFormData((prev) => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        sources: [...prev.knowledgeBase.sources, source],
      },
    }));

    // Clear the form
    setNewSourceContent("");
    setNewSourceUrl("");
    setNewSourceType("Manual");
    setNewSourceFile(null);
    setNewSourceApiEndpoint("");
    setNewSourceApiKey("");
    setNewSourceDatabase("");
    setNewSourceQuery("");
  };

  const handleRemoveKnowledgeSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        sources: prev.knowledgeBase.sources.filter((_, i) => i !== index),
      },
    }));
  };

  const handleFileUpload = (file: File) => {
    setNewSourceFile(file);

    // Read file content for text files
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setNewSourceContent(content.substring(0, 500) + (content.length > 500 ? "..." : ""));
      };
      reader.readAsText(file);
    } else {
      // For other file types, just use the filename
      setNewSourceContent(`Document: ${file.name}`);
    }
  };

  const handleCreateAgent = async () => {
    try {
      setCreating(true);
      setError(null);

      // Convert form data to canister format
      const agentRequest: CreateAgentRequest = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic,
        tags: formData.personality.traits, // Use personality traits as tags
        config: {
          personality: {
            traits: formData.personality.traits,
            tone: formData.personality.tone,
            style: formData.personality.responseStyle,
            communicationStyle:
              formData.personality.communicationStyle === "Conversational"
                ? { Conversational: null }
                : formData.personality.communicationStyle === "Creative"
                  ? { Creative: null }
                  : formData.personality.communicationStyle === "Educational"
                    ? { Educational: null }
                    : formData.personality.communicationStyle === "Technical"
                      ? { Technical: null }
                      : { Professional: null },
            responsePattern:
              formData.personality.responsePattern === "Concise"
                ? { Concise: null }
                : formData.personality.responsePattern === "Narrative"
                  ? { Narrative: null }
                  : formData.personality.responsePattern === "Structured"
                    ? { Structured: null }
                    : { Detailed: null },
          },
          behavior: {
            responseLength: formData.behavior.maxResponseLength <= 300 ? { Short: null } : formData.behavior.maxResponseLength <= 700 ? { Medium: null } : { Long: null },
            temperature: formData.behavior.temperature,
            creativity: formData.behavior.creativity,
            topP: formData.behavior.topP,
            contextWindow: BigInt(formData.behavior.contextWindow),
            maxTokens: BigInt(formData.behavior.maxTokens),
            frequencyPenalty: formData.behavior.frequencyPenalty,
            presencePenalty: formData.behavior.presencePenalty,
            systemPromptTemplate: formData.behavior.systemPromptTemplate,
          },
          appearance: {
            primaryColor: formData.appearance.primaryColor,
            secondaryColor: formData.appearance.secondaryColor,
            accentColor: formData.appearance.accentColor,
            borderRadius: formData.appearance.borderRadius,
            avatar: formData.appearance.avatar ? [formData.appearance.avatar] : [], // [] for None, [string] for Some
            customCSS: formData.appearance.customCSS ? [formData.appearance.customCSS] : [],
            fontFamily: formData.appearance.fontFamily,
            fontSize: formData.appearance.fontSize,
            theme: { Auto: null }, // Default to Auto
          },
          contextSettings: {
            enableLearning: formData.contextSettings.enableLearning,
            enableMemory: formData.contextSettings.enableMemory,
            maxContextMessages: BigInt(formData.contextSettings.maxContextMessages),
            memoryDuration: BigInt(formData.contextSettings.memoryDuration),
          },
          integrationSettings: {
            allowedOrigins: formData.integrationSettings.allowedOrigins,
            rateLimiting: {
              enabled: formData.integrationSettings.rateLimiting.enabled,
              maxRequestsPerHour: BigInt(formData.integrationSettings.rateLimiting.maxRequestsPerHour),
              maxTokensPerHour: BigInt(formData.integrationSettings.rateLimiting.maxTokensPerHour),
            },
            webhooks: formData.integrationSettings.webhooks,
          },
          knowledgeBase: [
            // Add the main context as the first knowledge source
            {
              id: "main-context",
              content: formData.knowledgeBase.context || "General knowledge assistant",
              sourceType: { Manual: null },
              metadata: [["type", "main-context"]] as [string, string][],
              isActive: true,
              lastUpdated: BigInt(Date.now()),
              priority: BigInt(1),
              version: BigInt(1),
            },
            // Add additional knowledge sources
            ...formData.knowledgeBase.sources.map((source, index) => ({
              id: `source-${index}`,
              content: source.content,
              sourceType: source.type === "Manual" ? { Manual: null } : source.type === "URL" ? { URL: null } : source.type === "Document" ? { Document: null } : source.type === "API" ? { API: null } : { Database: null },
              metadata: [["type", source.type.toLowerCase()], ...(source.url ? [["url", source.url]] : []), ...(source.metadata ? Object.entries(source.metadata).map(([key, value]) => [key, String(value)]) : [])] as [string, string][],
              isActive: true,
              lastUpdated: BigInt(Date.now()),
              priority: BigInt(index + 2),
              version: BigInt(1),
            })),
          ],
          version: BigInt(1), // Default version
        },
      };

      console.log("Creating agent with canister:", agentRequest);

      // Call the actual canister
      const agentId = await canisterService.createAgent(agentRequest);
      console.log("Agent created successfully with ID:", agentId);

      // Reset form
      setFormData({
        name: "",
        description: "",
        personality: { traits: [], tone: "professional", responseStyle: "helpful", communicationStyle: "Professional", responsePattern: "Detailed" },
        knowledgeBase: { documents: [], sources: [], context: "" },
        behavior: {
          maxResponseLength: 500,
          conversationMemory: true,
          escalationRules: [],
          temperature: 0.7,
          creativity: 0.8,
          topP: 0.9,
          contextWindow: 4096,
          maxTokens: 1000,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
          systemPromptTemplate: "You are a helpful AI assistant.",
        },
        appearance: {
          avatar: "default",
          theme: "blue",
          welcomeMessage: "Hello! How can I help you today?",
          primaryColor: "#3B82F6",
          secondaryColor: "#EFF6FF",
          accentColor: "#3B82F6",
          borderRadius: "8px",
          customCSS: "",
          fontFamily: "Inter",
          fontSize: "14px",
        },
        contextSettings: { enableLearning: true, enableMemory: true, maxContextMessages: 10, memoryDuration: 3600 },
        integrationSettings: { allowedOrigins: [], rateLimiting: { enabled: false, maxRequestsPerHour: 1000, maxTokensPerHour: 100000 }, webhooks: [] },
        category: "General",
        isPublic: false,
      });

      onAgentCreated();
    } catch (error) {
      console.error("Failed to create agent:", error);
      setError(error instanceof Error ? error.message : "Failed to create agent");
    } finally {
      setCreating(false);
    }
  };

  const getThemeColor = (theme: string): string => {
    const colors: { [key: string]: string } = {
      blue: "#3B82F6",
      green: "#10B981",
      purple: "#8B5CF6",
      orange: "#F59E0B",
    };
    return colors[theme] || colors.blue;
  };

  const getThemeSecondaryColor = (theme: string): string => {
    const colors: { [key: string]: string } = {
      blue: "#EFF6FF",
      green: "#ECFDF5",
      purple: "#F3E8FF",
      orange: "#FFFBEB",
    };
    return colors[theme] || colors.blue;
  };

  const isFormValid = () => {
    return typeof formData.name === "string" && formData.name.trim() && typeof formData.description === "string" && formData.description.trim() && formData.personality.traits.length > 0;
  };

  const renderBasicConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", "name", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Customer Support Assistant"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", "description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe what your agent does and how it helps users..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category || "General"}
          onChange={(e) => handleInputChange("category", "category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="General">General</option>
          <option value="Customer Support">Customer Support</option>
          <option value="Sales">Sales</option>
          <option value="Education">Education</option>
          <option value="Technical">Technical</option>
          <option value="Creative">Creative</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input type="radio" name="isPublic" value="false" checked={!formData.isPublic} onChange={(e) => handleInputChange("isPublic", "isPublic", e.target.value === "true")} className="mr-2" />
            <span className="text-sm text-gray-700">Private (Only you can access)</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="isPublic" value="true" checked={formData.isPublic} onChange={(e) => handleInputChange("isPublic", "isPublic", e.target.value === "true")} className="mr-2" />
            <span className="text-sm text-gray-700">Public (Anyone can access)</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPersonalityConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits *</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {personalityTraits.map((trait) => (
            <button
              key={trait}
              onClick={() => handleTraitToggle(trait)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                formData.personality.traits.includes(trait) ? "bg-primary-100 border-primary-300 text-primary-800" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
            onChange={(e) => handleInputChange("personality", "tone", e.target.value)}
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
            onChange={(e) => handleInputChange("personality", "responseStyle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="helpful">Helpful</option>
            <option value="detailed">Detailed</option>
            <option value="concise">Concise</option>
            <option value="conversational">Conversational</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
          <select
            value={formData.personality.communicationStyle}
            onChange={(e) => handleInputChange("personality", "communicationStyle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Professional">Professional</option>
            <option value="Conversational">Conversational</option>
            <option value="Creative">Creative</option>
            <option value="Educational">Educational</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Response Pattern</label>
          <select
            value={formData.personality.responsePattern}
            onChange={(e) => handleInputChange("personality", "responsePattern", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Detailed">Detailed</option>
            <option value="Concise">Concise</option>
            <option value="Narrative">Narrative</option>
            <option value="Structured">Structured</option>
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
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                handleInputChange("appearance", "theme", theme.id);
                handleInputChange("appearance", "primaryColor", getThemeColor(theme.id));
                handleInputChange("appearance", "secondaryColor", getThemeSecondaryColor(theme.id));
                handleInputChange("appearance", "accentColor", getThemeColor(theme.id));
              }}
              className={`p-4 rounded-lg border-2 transition-colors ${formData.appearance.theme === theme.id ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400"}`}
            >
              <div className={`w-6 h-6 ${theme.color} rounded-full mx-auto mb-2`}></div>
              <span className="text-xs text-gray-700">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center space-x-2">
            <input type="color" value={formData.appearance.primaryColor} onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)} className="w-12 h-8 border border-gray-300 rounded" />
            <input
              type="text"
              value={formData.appearance.primaryColor}
              onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center space-x-2">
            <input type="color" value={formData.appearance.secondaryColor} onChange={(e) => handleInputChange("appearance", "secondaryColor", e.target.value)} className="w-12 h-8 border border-gray-300 rounded" />
            <input
              type="text"
              value={formData.appearance.secondaryColor}
              onChange={(e) => handleInputChange("appearance", "secondaryColor", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
          <div className="flex items-center space-x-2">
            <input type="color" value={formData.appearance.accentColor} onChange={(e) => handleInputChange("appearance", "accentColor", e.target.value)} className="w-12 h-8 border border-gray-300 rounded" />
            <input
              type="text"
              value={formData.appearance.accentColor}
              onChange={(e) => handleInputChange("appearance", "accentColor", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
          <select
            value={formData.appearance.borderRadius}
            onChange={(e) => handleInputChange("appearance", "borderRadius", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="0px">Sharp (0px)</option>
            <option value="4px">Slightly Rounded (4px)</option>
            <option value="8px">Rounded (8px)</option>
            <option value="12px">More Rounded (12px)</option>
            <option value="16px">Very Rounded (16px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
          <select
            value={formData.appearance.fontFamily}
            onChange={(e) => handleInputChange("appearance", "fontFamily", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Inter">Inter (Modern)</option>
            <option value="Roboto">Roboto (Clean)</option>
            <option value="Open Sans">Open Sans (Readable)</option>
            <option value="Lato">Lato (Friendly)</option>
            <option value="Poppins">Poppins (Professional)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
        <select
          value={formData.appearance.fontSize}
          onChange={(e) => handleInputChange("appearance", "fontSize", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="12px">Small (12px)</option>
          <option value="14px">Medium (14px)</option>
          <option value="16px">Large (16px)</option>
          <option value="18px">Extra Large (18px)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
        <textarea
          value={formData.appearance.welcomeMessage}
          onChange={(e) => handleInputChange("appearance", "welcomeMessage", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="What should your agent say when starting a conversation?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
        <textarea
          value={formData.appearance.customCSS}
          onChange={(e) => handleInputChange("appearance", "customCSS", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          placeholder="Add custom CSS styles for your agent interface..."
        />
        <p className="text-xs text-gray-500 mt-1">Optional: Add custom CSS to further customize the appearance</p>
      </div>
    </div>
  );

  const renderKnowledgeConfig = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
        <textarea
          value={formData.knowledgeBase.context}
          onChange={(e) => handleInputChange("knowledgeBase", "context", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Provide background context for your agent..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Knowledge Sources</label>

        {/* Display existing sources */}
        {formData.knowledgeBase.sources.length > 0 && (
          <div className="mb-4 space-y-2">
            {formData.knowledgeBase.sources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{source.type}</span>
                    {source.url && <span className="text-sm text-gray-600">{source.url}</span>}
                    {source.metadata?.fileName && <span className="text-sm text-gray-600">📄 {source.metadata.fileName}</span>}
                    {source.metadata?.apiEndpoint && <span className="text-sm text-gray-600">🔗 API</span>}
                    {source.metadata?.database && <span className="text-sm text-gray-600">🗄️ DB</span>}
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{source.content}</p>
                  {source.metadata && (
                    <div className="mt-1 text-xs text-gray-500">
                      {source.metadata.fileSize && <span className="mr-2">Size: {Math.round(source.metadata.fileSize / 1024)}KB</span>}
                      {source.metadata.hasApiKey && <span className="mr-2">🔑 API Key</span>}
                      {source.metadata.query && <span className="mr-2">Query: {source.metadata.query.substring(0, 30)}...</span>}
                    </div>
                  )}
                </div>
                <button onClick={() => handleRemoveKnowledgeSource(index)} className="ml-2 text-red-600 hover:text-red-800">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new source form */}
        <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source Type</label>
              <select value={newSourceType} onChange={(e) => setNewSourceType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="Manual">Manual Text</option>
                <option value="URL">Web URL</option>
                <option value="Document">Document Upload</option>
                <option value="API">API Integration</option>
                <option value="Database">Database Query</option>
              </select>
            </div>
          </div>

          {/* Dynamic form based on source type */}
          {newSourceType === "Manual" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Knowledge Content</label>
              <textarea
                value={newSourceContent}
                onChange={(e) => setNewSourceContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Enter your knowledge content here..."
              />
            </div>
          )}

          {newSourceType === "URL" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="https://example.com/article"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Content Summary</label>
                <textarea
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Summarize the key information from this URL..."
                />
              </div>
            </div>
          )}

          {newSourceType === "Document" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Upload Document</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    accept=".pdf,.txt,.doc,.docx,.md"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="space-y-2">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-primary-600 hover:text-primary-500">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">PDF, TXT, DOC, DOCX, MD up to 10MB</div>
                    </div>
                  </label>
                </div>
                {newSourceFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <span className="text-green-800">✓ {newSourceFile.name} selected</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Document Description (Optional)</label>
                <textarea
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Brief description of the document content..."
                />
              </div>
            </div>
          )}

          {newSourceType === "API" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">API Endpoint</label>
                <input
                  type="url"
                  value={newSourceApiEndpoint}
                  onChange={(e) => setNewSourceApiEndpoint(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="https://api.example.com/data"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">API Key (Optional)</label>
                <input
                  type="password"
                  value={newSourceApiKey}
                  onChange={(e) => setNewSourceApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Enter API key if required"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">API Description</label>
                <textarea
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Describe what data this API provides..."
                />
              </div>
            </div>
          )}

          {newSourceType === "Database" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Database Connection</label>
                <input
                  type="text"
                  value={newSourceDatabase}
                  onChange={(e) => setNewSourceDatabase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Database name or connection string"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Query or Table</label>
                <textarea
                  value={newSourceQuery}
                  onChange={(e) => setNewSourceQuery(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="SQL query or table name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Describe the data structure and content..."
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAddKnowledgeSource}
            disabled={
              (newSourceType === "Manual" && !newSourceContent.trim()) ||
              (newSourceType === "URL" && (!newSourceUrl.trim() || !newSourceContent.trim())) ||
              (newSourceType === "Document" && !newSourceFile) ||
              (newSourceType === "API" && !newSourceApiEndpoint.trim()) ||
              (newSourceType === "Database" && (!newSourceDatabase.trim() || !newSourceQuery.trim()))
            }
            className="w-full px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Knowledge Source
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
          onChange={(e) => handleInputChange("behavior", "maxResponseLength", parseInt(e.target.value))}
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
          onChange={(e) => handleInputChange("behavior", "conversationMemory", e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="conversationMemory" className="ml-2 block text-sm text-gray-900">
          Remember conversation history
        </label>
      </div>

      {/* Advanced Behavior Settings */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
            <input type="range" min="0" max="2" step="0.1" value={formData.behavior.temperature} onChange={(e) => handleInputChange("behavior", "temperature", parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused (0.0)</span>
              <span>{formData.behavior.temperature}</span>
              <span>Creative (2.0)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Creativity</label>
            <input type="range" min="0" max="1" step="0.1" value={formData.behavior.creativity} onChange={(e) => handleInputChange("behavior", "creativity", parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (0.0)</span>
              <span>{formData.behavior.creativity}</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Top P</label>
            <input type="range" min="0" max="1" step="0.1" value={formData.behavior.topP} onChange={(e) => handleInputChange("behavior", "topP", parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.0</span>
              <span>{formData.behavior.topP}</span>
              <span>1.0</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context Window</label>
            <input
              type="number"
              value={formData.behavior.contextWindow}
              onChange={(e) => handleInputChange("behavior", "contextWindow", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1000"
              max="32000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens</label>
            <input
              type="number"
              value={formData.behavior.maxTokens}
              onChange={(e) => handleInputChange("behavior", "maxTokens", parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="100"
              max="4000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency Penalty</label>
            <input type="range" min="-2" max="2" step="0.1" value={formData.behavior.frequencyPenalty} onChange={(e) => handleInputChange("behavior", "frequencyPenalty", parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-2.0</span>
              <span>{formData.behavior.frequencyPenalty}</span>
              <span>2.0</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Presence Penalty</label>
            <input type="range" min="-2" max="2" step="0.1" value={formData.behavior.presencePenalty} onChange={(e) => handleInputChange("behavior", "presencePenalty", parseFloat(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-2.0</span>
              <span>{formData.behavior.presencePenalty}</span>
              <span>2.0</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt Template</label>
          <textarea
            value={formData.behavior.systemPromptTemplate}
            onChange={(e) => handleInputChange("behavior", "systemPromptTemplate", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Define the base personality and behavior for your agent..."
          />
        </div>
      </div>
    </div>
  );

  const renderConfigContent = () => {
    switch (activeConfigTab) {
      case "basic":
        return renderBasicConfig();
      case "personality":
        return renderPersonalityConfig();
      case "knowledge":
        return renderKnowledgeConfig();
      case "behavior":
        return renderBehaviorConfig();
      case "appearance":
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center">
              <XMarkIcon className="h-5 w-5 mr-2" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Agent</h2>
            <div className="flex items-center space-x-3">
              <button onClick={() => setPreviewMode(!previewMode)} className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                {previewMode ? "Edit Mode" : "Preview"}
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
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeConfigTab === tab.id ? "bg-primary-100 text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tab.name}</span>
                        {tab.required && <span className="text-red-500 text-xs">*</span>}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{formData.name || "Agent Name"}</h3>
                  <p className="text-gray-600 mb-4">{formData.description || "Agent description will appear here..."}</p>

                  {formData.personality.traits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Personality Traits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.personality.traits.map((trait) => (
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
