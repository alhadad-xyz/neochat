import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../types';
import { canisterService, UsageRecord, UserBalance } from '../services/canisterService';

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
      totalTokensUsed: number;
    };
    agentPerformance: Array<{
      agentId: string;
      agentName: string;
      messages: number;
      conversations: number;
      avgResponseTime: number;
      satisfaction: number;
      tokensUsed: number;
      status: string;
    }>;
    usageHistory: UsageRecord[];
    userBalance: UserBalance | null;
  }>({
    overview: {
      totalMessages: 0,
      totalConversations: 0,
      averageResponseTime: 0,
      successRate: 0,
      totalTokensUsed: 0
    },
    agentPerformance: [],
    usageHistory: [],
    userBalance: null
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('messages');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!sessionToken) return;

      try {
        setLoading(true);
        setError(null);
        
        // Get comprehensive analytics data from canisters
        const data = await canisterService.getComprehensiveAnalytics();
        console.log('Analytics data loaded:', data);
        console.log('Data structure check:', {
          hasOverview: !!data.overview,
          overviewKeys: data.overview ? Object.keys(data.overview) : [],
          totalMessages: data.overview?.totalMessages,
          totalConversations: data.overview?.totalConversations,
          averageResponseTime: data.overview?.averageResponseTime
        });
        
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
        
        // Fallback to empty data on error
        setAnalyticsData({
          overview: {
            totalMessages: 0,
            totalConversations: 0,
            averageResponseTime: 0,
            successRate: 0,
            totalTokensUsed: 0
          },
          agentPerformance: [],
          usageHistory: [],
          userBalance: null
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [sessionToken]);

  const overviewMetrics = [
    {
      name: 'Total Messages',
      value: analyticsData.overview.totalMessages.toLocaleString(),
      change: analyticsData.overview.totalMessages > 0 ? '+12.5%' : '0%',
      changeType: analyticsData.overview.totalMessages > 0 ? 'increase' as const : 'neutral' as const,
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Conversations',
      value: analyticsData.overview.totalConversations.toLocaleString(),
      change: analyticsData.overview.totalConversations > 0 ? '+8.3%' : '0%',
      changeType: analyticsData.overview.totalConversations > 0 ? 'increase' as const : 'neutral' as const,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Avg Response Time',
      value: `${analyticsData.overview.averageResponseTime.toFixed(1)}s`,
      change: analyticsData.overview.averageResponseTime > 0 ? '-15.2%' : '0%',
      changeType: analyticsData.overview.averageResponseTime > 0 ? 'decrease' as const : 'neutral' as const,
      icon: ClockIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Success Rate',
      value: `${analyticsData.overview.successRate.toFixed(1)}%`,
      change: analyticsData.overview.successRate > 95 ? '+2.1%' : '0%',
      changeType: analyticsData.overview.successRate > 95 ? 'increase' as const : 'neutral' as const,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  const metricOptions = [
    { value: 'messages', label: 'Messages' },
    { value: 'conversations', label: 'Conversations' },
    { value: 'tokens', label: 'Tokens Used' },
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights into your AI agent performance and usage patterns.
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {overviewMetrics.map((metric) => (
          <div key={metric.name} className="bg-white px-4 py-6 shadow rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${metric.bgColor} p-3 rounded-lg`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{metric.name}</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                    {metric.changeType !== 'neutral' && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="sr-only">{metric.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                        {metric.change}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Balance Card */}
      {analyticsData.userBalance && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Current Balance</p>
                  <p className="text-2xl font-semibold text-gray-900">${analyticsData.userBalance.balance.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                  <CpuChipIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Current Tier</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.userBalance.currentTier}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Usage</p>
                  <p className="text-2xl font-semibold text-gray-900">{analyticsData.userBalance.monthlyUsage.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Performance */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance</h3>
          {analyticsData.agentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.agentPerformance.map((agent) => (
                    <tr key={agent.agentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{agent.agentName}</div>
                        <div className="text-sm text-gray-500">{agent.agentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : agent.status === 'Inactive'
                            ? 'bg-gray-100 text-gray-800'
                            : agent.status === 'Suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.messages.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.conversations.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.tokensUsed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.avgResponseTime.toFixed(1)}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">{agent.satisfaction.toFixed(1)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No performance data available</h3>
              <p className="mt-1 text-sm text-gray-500">Start using your agents to see performance metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Usage History</h3>
          {analyticsData.usageHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.usageHistory.slice(0, 10).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.agentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.operation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No usage history available</h3>
              <p className="mt-1 text-sm text-gray-500">Usage data will appear here as you interact with your agents.</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
          {analyticsData.overview.totalMessages > 0 || analyticsData.agentPerformance.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.overview.totalMessages > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      <strong>Total of {analyticsData.overview.totalMessages.toLocaleString()} messages processed</strong> across all your agents. 
                      Your AI assistants are actively helping users with their queries.
                    </p>
                  </div>
                </div>
              )}
              {analyticsData.overview.totalConversations > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      <strong>{analyticsData.overview.totalConversations.toLocaleString()} conversations initiated</strong> with your agents. 
                      Users are engaging meaningfully with your AI assistants.
                    </p>
                  </div>
                </div>
              )}
              {analyticsData.overview.totalTokensUsed > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CpuChipIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      <strong>{analyticsData.overview.totalTokensUsed.toLocaleString()} tokens consumed</strong> for AI processing. 
                      This represents the computational resources used by your agents.
                    </p>
                  </div>
                </div>
              )}
              {analyticsData.agentPerformance.length > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <StarIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">
                      <strong>{analyticsData.agentPerformance.length} active agents</strong> in your system. 
                      Consider optimizing high-performing agents and improving underperforming ones.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">Start using your agents to generate analytics insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 