/**
 * @fileoverview NeoChat Dashboard Component
 * 
 * This component provides the main dashboard interface for NeoChat users.
 * It displays user statistics, recent agents, quick actions, and system status.
 * 
 * Features:
 * - User profile and tier information
 * - Usage statistics and analytics
 * - Recent agents and quick access
 * - System health and status monitoring
 * - Quick actions for common tasks
 * 
 * @author NeoChat Development Team
 * @version 2.0.0
 * @since 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ChartBarIcon, 
  CogIcon, 
  UserIcon,
  SparklesIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Agent } from '../../types';
import { canisterService, AgentResponse, UserSubscription } from '../../services/canisterService';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentAgents from './RecentAgents';
import { SubscriptionDisplay } from '../SubscriptionDisplay';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Props for the Dashboard component
 */
interface DashboardProps {
  /** User's session token for authentication */
  sessionToken: string | null;
  /** Current user identity */
  identity: any;
  /** Function to handle navigation to different views */
  onNavigate: (view: string) => void;
}

/**
 * Dashboard statistics data structure
 */
interface DashboardStats {
  /** Total number of agents */
  totalAgents: number;
  /** Total number of conversations */
  totalConversations: number;
  /** Total number of messages */
  totalMessages: number;
  /** Current month usage */
  currentMonthUsage: {
    messages: number;
    tokens: number;
    cost: number;
  };
  /** System uptime percentage */
  systemUptime: number;
  /** Average response time in seconds */
  averageResponseTime: number;
}

/**
 * User tier information
 */
interface UserTier {
  /** Tier name (e.g., 'Base', 'Pro', 'Enterprise') */
  name: string;
  /** Tier display name */
  displayName: string;
  /** Monthly cost in USD */
  monthlyCost: number;
  /** Features included in this tier */
  features: string[];
}

/**
 * NeoChat Dashboard Component
 * 
 * Provides the main dashboard interface for users to view their statistics,
 * manage agents, and access quick actions. Displays comprehensive overview
 * of user activity and system status.
 * 
 * @param props - Component props containing session and navigation information
 * @returns JSX element for the dashboard interface
 * 
 * @example
 * ```tsx
 * <Dashboard 
 *   sessionToken="user-session-token"
 *   identity={userIdentity}
 *   onNavigate={handleNavigation}
 * />
 * ```
 */
const Dashboard: React.FC<DashboardProps> = ({ sessionToken, identity, onNavigate }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Array of user's agents */
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  
  /** Dashboard statistics */
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalConversations: 0,
    totalMessages: 0,
    currentMonthUsage: {
      messages: 0,
      tokens: 0,
      cost: 0
    },
    systemUptime: 99.9,
    averageResponseTime: 1.2
  });
  
  /** Current user subscription information */
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  
  /** Whether data is currently loading */
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  /** Current error state */
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Maps backend tier names to frontend display names
   * 
   * @param tierName - Backend tier name
   * @returns Frontend tier display name
   */
  const mapTierName = (tierName: string): string => {
    const tierMap: Record<string, string> = {
      'free': 'Free Plan',
      'base': 'Base Plan',
      'pro': 'Pro Plan',
      'enterprise': 'Enterprise Plan'
    };
    return tierMap[tierName.toLowerCase()] || tierName;
  };

  /**
   * Fetches user subscription information
   */
  const fetchUserSubscription = async () => {
    try {
      const subscription = await canisterService.getUserSubscription();
      setUserSubscription(subscription);
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
    }
  };

  /**
   * Fetches user agents from the backend
   */
  const fetchAgents = async () => {
    try {
      const response = await canisterService.getUserAgents();
      setAgents(response);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setError('Failed to load agents');
    }
  };

  /**
   * Fetches dashboard statistics
   */
  const fetchStats = async () => {
    try {
      // In a real implementation, this would call backend endpoints
      // For now, we'll simulate the data based on agents
      const mockStats: DashboardStats = {
        totalAgents: agents.length,
        totalConversations: agents.length * 15, // Mock data
        totalMessages: agents.length * 150, // Mock data
        currentMonthUsage: {
          messages: Math.floor(agents.length * 25),
          tokens: Math.floor(agents.length * 2500),
          cost: Math.floor(agents.length * 2.5)
        },
        systemUptime: 99.9,
        averageResponseTime: 1.2
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize dashboard data on component mount
   */
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserSubscription(),
          fetchAgents()
        ]);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionToken) {
      initializeDashboard();
    }
  }, [sessionToken]);

  /**
   * Update stats when agents change
   */
  useEffect(() => {
    if (agents.length > 0) {
      fetchStats();
    }
  }, [agents]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handles navigation to different dashboard sections
   * 
   * @param view - The view to navigate to
   */
  const handleNavigation = (view: string) => {
    onNavigate(view);
  };

  /**
   * Handles creating a new agent
   */
  const handleCreateAgent = () => {
    onNavigate('create-agent');
  };

  /**
   * Handles viewing analytics
   */
  const handleViewAnalytics = () => {
    onNavigate('analytics');
  };

  /**
   * Handles accessing settings
   */
  const handleAccessSettings = () => {
    onNavigate('settings');
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <DashboardHeader 
        identity={identity}
        sessionToken={sessionToken}
      />

      <div className="flex">
        {/* Dashboard Sidebar */}
        <DashboardSidebar 
          onNavigate={handleNavigation}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what's happening with your NeoChat agents today.
              </p>
            </div>

            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAgents}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversations</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageResponseTime}s</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="mb-8">
              <SubscriptionDisplay 
                subscription={userSubscription}
                isLoading={isLoading}
              />
            </div>

            {/* Quick Actions and Recent Agents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleCreateAgent}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <PlusIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900 dark:text-white">Create New Agent</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                  
                  <button
                    onClick={handleViewAnalytics}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900 dark:text-white">View Analytics</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                  
                  <button
                    onClick={handleAccessSettings}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <CogIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-gray-900 dark:text-white">Settings</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Agents</h3>
                {agents.length === 0 ? (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No agents yet</p>
                    <button
                      onClick={handleCreateAgent}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Create Your First Agent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agents.slice(0, 5).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => onNavigate(`chat/${agent.id}`)}
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-medium">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{agent.description}</p>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    System Uptime: {stats.systemUptime}%
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Response: {stats.averageResponseTime}s
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 