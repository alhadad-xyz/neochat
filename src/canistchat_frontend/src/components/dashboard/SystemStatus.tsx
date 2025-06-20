

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const SystemStatus = () => {
  const statusItems = [
    {
      title: 'Agent Manager',
      status: 'Operational',
      icon: CheckCircle,
      color: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      title: 'LLM Processor',
      status: 'Active',
      icon: CheckCircle,
      color: 'text-green-600',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      title: 'Production APIs',
      status: 'Ready',
      icon: Clock,
      color: 'text-yellow-600',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
  ];

  return (
    <div className="mt-8">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statusItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <Badge className={`mt-1 ${item.badgeColor} border-0`}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-400">Enterprise Ready</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Advanced LLM integration with intelligent load balancing
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;
