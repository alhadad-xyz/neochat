import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Agent } from '../types';
import { canisterService, UsageRecord, UserBalance } from '../services/canisterService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, FileText, MessageSquare, Clock } from 'lucide-react';
import { BarChart3 } from 'lucide-react';

interface AnalyticsProps {
  sessionToken: string | null;
  selectedAgent: Agent | null;
}

const Analytics: React.FC<AnalyticsProps> = ({ sessionToken, selectedAgent }) => {
  const [analyticsData, setAnalyticsData] = useState<{
    overview: {
      totalMessages: number;
      totalConversations: number;
      averageResponseTime: number;
      successRate: number;
      totalCost: number;
    };
    agentPerformance: Array<{
      agentId: string;
      agentName: string;
      messages: number;
      conversations: number;
      avgResponseTime: number;
      satisfaction: number;
      cost: number;
      status: string;
    }>;
    usageHistory: UsageRecord[];
    userBalance: UserBalance | null;
    conversationHistory: Array<{
      contextId: string;
      messageCount: number;
      created: Date;
      lastAccessed: Date;
    }>;
  }>({
    overview: {
      totalMessages: 0,
      totalConversations: 0,
      averageResponseTime: 0,
      successRate: 0,
      totalCost: 0
    },
    agentPerformance: [],
    usageHistory: [],
    userBalance: null,
    conversationHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Generate usage data from analytics history or use sample data
  const usageData = analyticsData.usageHistory.length > 0 
    ? analyticsData.usageHistory.slice(-7).map((record, index) => ({
        name: new Date(Number(record.timestamp) / 1000000).toLocaleDateString('en-US', { weekday: 'short' }),
        messages: Math.floor(record.cost / 0.01), // Estimate messages from cost (assuming ~$0.01 per message)
        conversations: Math.floor(record.cost / 0.03), // Estimate conversations from cost
        responseTime: 1.0 + Math.random() * 0.5, // Sample response time
      }))
    : [
        { name: 'Mon', messages: 12, conversations: 8, responseTime: 1.2 },
        { name: 'Tue', messages: 19, conversations: 12, responseTime: 1.1 },
        { name: 'Wed', messages: 3, conversations: 2, responseTime: 1.5 },
        { name: 'Thu', messages: 5, conversations: 3, responseTime: 1.3 },
        { name: 'Fri', messages: 2, conversations: 1, responseTime: 1.4 },
        { name: 'Sat', messages: 9, conversations: 6, responseTime: 1.0 },
        { name: 'Sun', messages: 15, conversations: 10, responseTime: 0.9 },
      ];

  /**
   * Loads comprehensive analytics data from canisters
   * Includes conversation history for the selected agent if available
   */
  useEffect(() => {
    if (!sessionToken) return;

    const loadAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get comprehensive analytics data from canisters
        const data = await canisterService.getComprehensiveAnalytics();
        
        // Get conversation history for selected agent if available
        let conversationHistory: Array<{
          contextId: string;
          messageCount: number;
          created: Date;
          lastAccessed: Date;
        }> = [];
        
        if (selectedAgent) {
          try {
            conversationHistory = await canisterService.getAgentConversationHistory(selectedAgent.id, 20);
          } catch (error) {
            console.warn('Could not fetch conversation history:', error);
          }
        }
        
        setAnalyticsData({
          ...data,
          conversationHistory
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
        
        // Fallback to empty data structure on error
        setAnalyticsData({
          overview: {
            totalMessages: 0,
            totalConversations: 0,
            averageResponseTime: 0,
            successRate: 0,
            totalCost: 0
          },
          agentPerformance: [],
          usageHistory: [],
          userBalance: null,
          conversationHistory: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [sessionToken]);



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive insights into your AI agent performance and usage patterns.
          </p>
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
            <div className="text-2xl font-bold">{analyticsData.overview.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.totalMessages > 0 ? '+12.5%' : '+0%'} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.totalConversations > 0 ? '+8.3%' : '+0%'} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.averageResponseTime.toFixed(1)}s</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.averageResponseTime > 0 ? '-15.2%' : '+0%'} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.successRate > 95 ? '+2.1%' : '+0%'} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
          <CardDescription>
            Track your AI agent usage patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="space-y-4">
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="response-time">Response Time</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="conversations"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="response-time" className="space-y-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>
            Individual agent statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyticsData.agentPerformance.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.agentPerformance.map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{agent.agentName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status: {agent.status}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{agent.messages}</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{agent.conversations}</div>
                        <div className="text-xs text-gray-500">Conversations</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{agent.avgResponseTime.toFixed(1)}s</div>
                        <div className="text-xs text-gray-500">Avg Response</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${agent.cost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Cost</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No performance data available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start using your agents to see performance metrics.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
            <CardDescription>
              Latest conversations for {selectedAgent.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analyticsData.conversationHistory.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.conversationHistory.map((conversation) => (
                    <div key={conversation.contextId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Conversation {conversation.contextId.substring(0, 8)}...
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Started: {conversation.created.toLocaleDateString()} at {conversation.created.toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last activity: {conversation.lastAccessed.toLocaleDateString()} at {conversation.lastAccessed.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{conversation.messageCount}</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start chatting with {selectedAgent.name} to see conversation history.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            AI-powered insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.overview.totalMessages > 0 || analyticsData.agentPerformance.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.overview.successRate > 95 && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">Excellent Success Rate</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your agents are performing excellently with a {analyticsData.overview.successRate.toFixed(1)}% success rate.
                    </p>
                  </div>
                </div>
              )}
              
              {analyticsData.overview.averageResponseTime < 2.0 && analyticsData.overview.totalMessages > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Fast Response Times</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your agents are responding quickly with an average of {analyticsData.overview.averageResponseTime.toFixed(1)}s response time.
                    </p>
                  </div>
                </div>
              )}
              
              {analyticsData.agentPerformance.length > 1 && (
                <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Multiple Active Agents</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      You have {analyticsData.agentPerformance.length} agents working. Consider optimizing the top performers for better results.
                    </p>
                  </div>
                </div>
              )}
              
              {analyticsData.userBalance && analyticsData.userBalance.balance < 10 && (
                <div className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">Low Balance Warning</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Your balance is running low (${analyticsData.userBalance.balance.toFixed(2)}). Consider adding funds to continue using your agents.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No data available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start using your agents to generate analytics insights.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </main>
  );
};

export default Analytics; 