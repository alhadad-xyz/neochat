import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentAgents from '@/components/dashboard/RecentAgents';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />
        <main className="flex-1 p-8">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  Welcome Back!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Here's what's happening with your AI agents today.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20 dark:border-gray-700/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current Time</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <DashboardStats />
            
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              <div className="xl:col-span-3">
                <QuickActions />
              </div>
              <div className="xl:col-span-2">
                <RecentAgents />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
