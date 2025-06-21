import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentAgents from "@/components/dashboard/RecentAgents";

// Import other view components
import AgentCreator from "@/components/AgentCreator";
import AgentList from "@/components/AgentList";
import ChatInterface from "@/components/ChatInterface";
import UserProfile from "@/components/UserProfile";
import EmbedGenerator from "@/components/EmbedGenerator";
import Analytics from "@/components/Analytics";
import CreateAgentForm from "@/components/createAgent/CreateAgentForm";
import AgentPreview from "@/components/createAgent/AgentPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";

import { Agent } from "../types";
import { canisterService, DashboardMetrics, AgentResponse } from "../services/canisterService";

interface DashboardProps {
  sessionToken: string | null;
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onNavigate: (view: string) => void;
  identity?: any;
  onLogout?: () => void;
  activeView?: string;
}

export interface AgentFormData {
  name: string;
  description: string;
  category: string;
  visibility: "private" | "public";
  tone: string;
  style: string;
  communicationStyle: string;
  responsePattern: string;
  personalityTraits: string[];
  context: string;
  knowledgeSources: Array<{
    type: string;
    content: string;
    metadata?: {
      connectionString?: string;
      queryOrTable?: string;
      description?: string;
      endpoint?: string;
      apiKey?: string;
      apiDescription?: string;
      documentDescription?: string;
      url?: string;
      contentSummary?: string;
    };
  }>;
  maxResponseLength: number;
  rememberConversation: boolean;
  temperature: number;
  creativity: number;
  topP: number;
  contextWindow: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPromptTemplate: string;
  welcomeMessage: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
  customCSS: string;
}

const Dashboard: React.FC<DashboardProps> = ({ sessionToken, selectedAgent, onSelectAgent, onNavigate, identity, onLogout, activeView = "dashboard" }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAgents: 0,
    activeAgents: 0,
    totalConversations: 0,
    totalMessages: 0,
    monthlyGrowth: {
      agents: 0,
      conversations: 0,
      messages: 0,
    },
  });
  const [recentAgents, setRecentAgents] = useState<AgentResponse[]>([]);
  const [lastActiveStep, setLastActiveStep] = useState("basic-info");
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<{
    agentManager: string;
    llmProcessor: string;
    contextManager: string;
    productionAPIs: string;
  }>({
    agentManager: "Unknown",
    llmProcessor: "Unknown",
    contextManager: "Unknown",
    productionAPIs: "Unknown",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3); // Mock notification count
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log("Search query:", query);
  };

  const [agentFormData, setAgentFormData] = useState<AgentFormData>({
    name: "",
    description: "",
    category: "general",
    visibility: "private" as "private" | "public",
    tone: "professional",
    style: "helpful",
    communicationStyle: "professional",
    responsePattern: "detailed",
    personalityTraits: [],
    context: "",
    knowledgeSources: [{ type: "Manual Text", content: "" }],
    maxResponseLength: 500,
    rememberConversation: true,
    temperature: 0.7,
    creativity: 0.8,
    topP: 0.9,
    contextWindow: 4096,
    maxTokens: 1000,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPromptTemplate: "You are a helpful AI assistant.",
    welcomeMessage: "Hello! How can I help you today?",
    theme: "professional-blue",
    primaryColor: "#3B82F6",
    secondaryColor: "#EFF6FF",
    accentColor: "#3B82F6",
    borderRadius: "rounded (8px)",
    fontFamily: "Inter (Modern)",
    fontSize: "Medium (14px)",
    customCSS: "",
  });

  const handleShowPreview = () => {
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Function to render the active view
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">Welcome Back!</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Here's what's happening with your AI agents today.</p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20 dark:border-gray-700/50">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Current Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Connection Issue</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DashboardStats metrics={metrics} systemStatus={systemStatus} />

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-3">
                <QuickActions onNavigate={onNavigate} selectedAgent={selectedAgent} />
              </div>
              <div className="xl:col-span-2">
                <RecentAgents agents={recentAgents} onSelectAgent={onSelectAgent} onNavigate={onNavigate} />
              </div>
            </div>
          </div>
        );

      case "agents":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">My Agents</h1>
            </div>
            <AgentList onSelectAgent={onSelectAgent} selectedAgent={selectedAgent} sessionToken={sessionToken} onNavigate={onNavigate} />
          </div>
        );

      case "create":
        return (
          // PENDING_INTEGRATION
          // <div className="space-y-6">
          //   <div className="flex items-center justify-between">
          //     <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Create Agent</h1>
          //   </div>
          //   <AgentCreator
          //     sessionToken={sessionToken}
          //     onAgentCreated={() => {
          //       // onSelectAgent(agent);
          //       onNavigate("agents");
          //     }}
          //   />
          // </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">{showPreview ? "Agent Preview" : "Create New Agent"}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{showPreview ? "Preview your AI agent before creating" : "Build an intelligent AI agent tailored to your needs"}</p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-white/20 dark:border-gray-700/50" onClick={showPreview ? handleBackToForm : handleShowPreview}>
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
                  {!showPreview && <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">Create Agent</Button>}
                </div>
              </div>
            </div>
            <AgentCreator
              sessionToken={sessionToken}
              onAgentCreated={(agent) => {
                onSelectAgent(agent);
                onNavigate("agents");
                setAnalyticsRefreshKey((prev) => prev + 1);
              }}
            />

            {showPreview ? <AgentPreview formData={agentFormData} /> : <CreateAgentForm formData={agentFormData} setFormData={setAgentFormData} lastActiveStep={lastActiveStep} setLastActiveStep={setLastActiveStep} />}
          </div>
        );

      case "chat":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Chat</h1>
            </div>
            {selectedAgent ? (
              <ChatInterface agent={selectedAgent} sessionToken={sessionToken} />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Agent Selected</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Please select an agent to start chatting.</div>
              </div>
            )}
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Analytics</h1>
            </div>
            <Analytics sessionToken={sessionToken} selectedAgent={selectedAgent} refreshKey={analyticsRefreshKey} />
          </div>
        );

      case "embed":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Embed Widget</h1>
            </div>
            {selectedAgent ? (
              <EmbedGenerator agent={selectedAgent} canisterId={process.env.REACT_APP_AGENT_MANAGER_CANISTER_ID || "bkyz2-fmaaa-aaaaa-qaaaq-cai"} />
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No Agent Selected</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Please select an agent to generate embed code.</div>
              </div>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Profile</h1>
            </div>
            <UserProfile sessionToken={sessionToken} identity={identity} />
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Billing & Payments</h1>
            </div>
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Coming Soon</div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">Billing and payment management features will be available soon.</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">View Not Found</div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">The requested view could not be found.</div>
          </div>
        );
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!sessionToken) {
        console.log("No session token, skipping dashboard data fetch");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Test canister connectivity first
        const canisterAccess = await canisterService.testCanisterAccess();
        console.log("Canister access test:", canisterAccess);

        // Get user agents and calculate metrics from them
        const agents = await canisterService.getUserAgents();
        console.log("Fetched agents:", agents);

        const activeAgents = agents.filter((agent) => "Active" in agent.status).length;

        // Calculate total conversations and messages from agent analytics
        let totalConversations = 0;
        let totalMessages = 0;

        for (const agent of agents) {
          if (agent.analytics) {
            totalConversations += agent.analytics.totalConversations;
            totalMessages += agent.analytics.totalMessages;
          }
        }

        // Calculate monthly growth (simplified - in production this would use historical data)
        const monthlyGrowth = {
          agents: Math.max(0, Math.floor(agents.length * 0.1)), // 10% growth estimate
          conversations: Math.max(0, Math.floor(totalConversations * 0.15)), // 15% growth estimate
          messages: Math.max(0, Math.floor(totalMessages * 0.12)), // 12% growth estimate
        };

        const metrics = {
          totalAgents: agents.length,
          activeAgents,
          totalConversations,
          totalMessages,
          monthlyGrowth,
        };

        // Get real system status from canisters
        const systemStatusData = await canisterService.getSystemStatus();
        console.log("System status data:", systemStatusData);

        // Sort agents by created date and take the most recent 5
        const sortedAgents = agents.sort((a, b) => Number(b.created) - Number(a.created));
        const recentAgentsList = sortedAgents.slice(0, 5);

        setMetrics(metrics);
        setRecentAgents(recentAgentsList);
        setSystemStatus(systemStatusData);
        setError(null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please check your connection and try again.");

        // Set fallback data
        setMetrics({
          totalAgents: 0,
          activeAgents: 0,
          totalConversations: 0,
          totalMessages: 0,
          monthlyGrowth: { agents: 0, conversations: 0, messages: 0 },
        });
        setSystemStatus({
          agentManager: "Error",
          llmProcessor: "Error",
          contextManager: "Error",
          productionAPIs: "Error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [sessionToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
        <DashboardSidebar onNavigate={onNavigate} activeView={activeView} selectedAgent={selectedAgent} />
        <div className="flex-1 flex flex-col ml-64">
          <DashboardHeader identity={identity} sessionToken={sessionToken} onLogout={handleLogout} searchQuery={searchQuery} onSearchChange={handleSearchChange} notifications={notifications} />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
        <DashboardSidebar onNavigate={onNavigate} activeView={activeView} selectedAgent={selectedAgent} />
        <div className="flex-1 flex flex-col ml-64">
          <DashboardHeader identity={identity} sessionToken={sessionToken} onLogout={handleLogout} searchQuery={searchQuery} onSearchChange={handleSearchChange} notifications={notifications} />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">Authentication Required</div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">Please log in with Internet Identity to access the dashboard.</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
      <DashboardSidebar onNavigate={onNavigate} activeView={activeView} selectedAgent={selectedAgent} />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader identity={identity} sessionToken={sessionToken} onLogout={handleLogout} searchQuery={searchQuery} onSearchChange={handleSearchChange} notifications={notifications} />
        <main className="flex-1 p-8">{renderActiveView()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
