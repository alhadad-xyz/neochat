import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, MessageSquare, FileText, TrendingUp } from 'lucide-react';
import { DashboardMetrics } from '../../services/canisterService';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ metrics }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    {
      title: 'Total Agents',
      value: metrics.totalAgents.toString(),
      change: metrics.monthlyGrowth.agents > 0 ? `+${metrics.monthlyGrowth.agents}` : '0',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
      borderColor: 'border-blue-200/50 dark:border-blue-800/30',
    },
    {
      title: 'Active Agents',
      value: metrics.activeAgents.toString(),
      change: `${Math.round((metrics.activeAgents / Math.max(metrics.totalAgents, 1)) * 100)}%`,
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/30',
    },
    {
      title: 'Conversations',
      value: formatNumber(metrics.totalConversations),
      change: metrics.monthlyGrowth.conversations > 0 ? `+${metrics.monthlyGrowth.conversations}` : '0',
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10',
      borderColor: 'border-purple-200/50 dark:border-purple-800/30',
    },
    {
      title: 'Total Messages',
      value: formatNumber(metrics.totalMessages),
      change: metrics.monthlyGrowth.messages > 0 ? `+${metrics.monthlyGrowth.messages}` : '0',
      icon: FileText,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10',
      borderColor: 'border-orange-200/50 dark:border-orange-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
