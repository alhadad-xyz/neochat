import React from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { MessageSquare, Users, Clock, TrendingUp, FileText, BarChart3 } from "lucide-react";

const Analytics = () => {
  // Sample data for charts
  const usageData = [
    { name: "Mon", messages: 120, conversations: 45, responseTime: 1.2 },
    { name: "Tue", messages: 190, conversations: 67, responseTime: 1.1 },
    { name: "Wed", messages: 150, conversations: 52, responseTime: 1.3 },
    { name: "Thu", messages: 220, conversations: 78, responseTime: 1.0 },
    { name: "Fri", messages: 280, conversations: 89, responseTime: 0.9 },
    { name: "Sat", messages: 160, conversations: 58, responseTime: 1.1 },
    { name: "Sun", messages: 130, conversations: 41, responseTime: 1.4 },
  ];

  const agentPerformanceData = [
    { name: "Customer Support Bot", messages: 450, satisfaction: 4.8, efficiency: 92 },
    { name: "Sales Assistant", messages: 320, satisfaction: 4.6, efficiency: 88 },
    { name: "Technical Helper", messages: 280, satisfaction: 4.7, efficiency: 90 },
    { name: "FAQ Bot", messages: 180, satisfaction: 4.5, efficiency: 85 },
  ];

  const chartConfig = {
    messages: {
      label: "Messages",
      color: "hsl(var(--chart-1))",
    },
    conversations: {
      label: "Conversations",
      color: "hsl(var(--chart-2))",
    },
    responseTime: {
      label: "Response Time",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex w-full">
      <DashboardSidebar onNavigate={() => {}} />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Comprehensive insights into your AI agent performance and usage patterns.</p>
              </div>
              <Select defaultValue="7days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.0s</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.0%</div>
                  <p className="text-xs text-muted-foreground">+0% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Track your AI agent usage patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="messages" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="conversations">Conversations</TabsTrigger>
                    <TabsTrigger value="response-time">Response Time</TabsTrigger>
                  </TabsList>

                  <TabsContent value="messages" className="space-y-4">
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="messages" stroke="var(--color-messages)" strokeWidth={2} dot={{ fill: "var(--color-messages)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </TabsContent>

                  <TabsContent value="conversations" className="space-y-4">
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="conversations" stroke="var(--color-conversations)" strokeWidth={2} dot={{ fill: "var(--color-conversations)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </TabsContent>

                  <TabsContent value="response-time" className="space-y-4">
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={usageData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="responseTime" stroke="var(--color-responseTime)" strokeWidth={2} dot={{ fill: "var(--color-responseTime)" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Individual agent statistics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No performance data available</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start using your agents to see performance metrics.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-powered insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No data available</h3>
                  <p className="text-gray-600 dark:text-gray-400">Start using your agents to generate analytics insights.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
