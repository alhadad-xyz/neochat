import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import AgentCard from "@/components/my-agents/AgentCard";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdDate: string;
  traits: string[];
}

const MyAgents = () => {
  const navigate = useNavigate();
  const [agents] = useState<Agent[]>([
    {
      id: "1",
      name: "Customer Support Assistant",
      description: "Helps customers with product inquiries and support issues",
      status: "active",
      createdDate: "15/01/2024",
      traits: ["helpful", "patient", "knowledgeable"],
    },
    {
      id: "2",
      name: "Sales Bot",
      description: "Assists with product recommendations and sales inquiries",
      status: "inactive",
      createdDate: "10/01/2024",
      traits: ["enthusiastic", "friendly", "concise"],
    },
  ]);

  const activeAgents = agents.filter((agent) => agent.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
      <DashboardSidebar onNavigate={() => {}} />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">My Agents</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {agents.length} {agents.length === 1 ? "agent" : "agents"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-white/20 dark:border-gray-700/50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={() => navigate("/create-agent")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Button>
              </div>
            </div>

            {agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No agents yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">Create your first AI agent to start building intelligent conversations.</p>
                <Button onClick={() => navigate("/create-agent")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyAgents;
