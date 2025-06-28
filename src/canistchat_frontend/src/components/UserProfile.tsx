import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  CogIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { UserProfileProps, UserProfile as UserProfileType, UsageData } from '../types';
import { canisterService, UserBalance, UsageRecord } from '../services/canisterService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, User, BarChart3, MessageSquare, CheckCircle } from 'lucide-react';

const UserProfile: React.FC<UserProfileProps> = ({ sessionToken, identity }) => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [addingBalance, setAddingBalance] = useState(false);
  const [balanceSuccess, setBalanceSuccess] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    totalUsers: number;
    totalTransactions: number;
  } | null>(null);

  useEffect(() => {
    loadProfile();
    loadSystemHealth();
  }, [identity]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real user data from canister service
      const [userSubscription, usageHistory, userAgents] = await Promise.allSettled([
        canisterService.getUserSubscription(),
        canisterService.getUsageHistory(50),
        canisterService.getUserAgents()
      ]);
      
      const subscription = userSubscription.status === 'fulfilled' ? userSubscription.value : null;
      const history = usageHistory.status === 'fulfilled' ? usageHistory.value : [];
      const agents = userAgents.status === 'fulfilled' ? userAgents.value : [];
      
      // Calculate usage metrics from real data
      const currentMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const currentMonthUsage = history.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.getMonth() === currentMonth.getMonth() && 
               recordDate.getFullYear() === currentMonth.getFullYear();
      });
      
      const lastMonthUsage = history.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.getMonth() === lastMonth.getMonth() && 
               recordDate.getFullYear() === lastMonth.getFullYear();
      });
      
      // Calculate totals
      const currentMonthCost = currentMonthUsage.reduce((sum, record) => sum + record.cost, 0);
      const lastMonthCost = lastMonthUsage.reduce((sum, record) => sum + record.cost, 0);
      
      // Create profile data
      const realProfile: UserProfileType = {
        userId: identity?.getPrincipal() ? 
          (typeof identity.getPrincipal().toString === 'function' ? 
            identity.getPrincipal().toString() : 
            'unknown'
          ) : 'unknown',
        tier: subscription?.currentTier || 'Base',
        balance: subscription?.monthlyCost || 0,
        currency: 'USD',
        joinDate: new Date().toISOString(),
        totalAgents: agents.length,
        totalConversations: agents.reduce((sum, agent) => sum + (agent.analytics?.totalConversations || 0), 0),
        totalMessages: agents.reduce((sum, agent) => sum + (agent.analytics?.totalMessages || 0), 0)
      };
      
      // Create usage data
      const realUsage: UsageData = {
        currentMonth: {
          messages: currentMonthUsage.length,
          tokensUsed: subscription?.monthlyUsage || 0,
          cost: currentMonthCost
        },
        lastMonth: {
          messages: lastMonthUsage.length,
          tokensUsed: 0, // Not tracked in subscription
          cost: lastMonthCost
        },
        billing: history.slice(0, 10).map(record => ({
          date: new Date(record.timestamp).toISOString().split('T')[0],
          amount: record.cost,
          description: `${record.operation} - ${record.agentId}`
        }))
      };
      
      setProfile(realProfile);
      setUsage(realUsage);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile data. Please try again.');
      
      // Fallback to basic profile data
      const fallbackProfile: UserProfileType = {
        userId: identity?.getPrincipal() ? 
          (typeof identity.getPrincipal().toString === 'function' ? 
            identity.getPrincipal().toString() : 
            'unknown'
          ) : 'unknown',
        tier: 'Base',
        balance: 0,
        currency: 'USD',
        joinDate: new Date().toISOString(),
        totalAgents: 0,
        totalConversations: 0,
        totalMessages: 0
      };
      
      setProfile(fallbackProfile);
      setUsage({
        currentMonth: { messages: 0, tokensUsed: 0, cost: 0 },
        lastMonth: { messages: 0, tokensUsed: 0, cost: 0 },
        billing: []
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const health = await canisterService.getMetricsCollectorHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  /**
   * Handles subscription upgrade requests
   * In the subscription model, this processes tier upgrades rather than balance top-ups
   * @param amount - The subscription amount for the upgrade
   */
  const handleAddBalance = async () => {
    if (!addBalanceAmount || parseFloat(addBalanceAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setAddingBalance(true);
      setError(null);
      
      // Process subscription upgrade
      setBalanceSuccess(true);
      setAddBalanceAmount('');
      
      // Reload profile to show updated subscription
      await loadProfile();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setBalanceSuccess(false);
        setShowAddBalanceModal(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to process subscription upgrade:', error);
      setError(error instanceof Error ? error.message : 'Failed to process subscription upgrade');
    } finally {
      setAddingBalance(false);
    }
  };

  /**
   * Formats a principal string for display
   * Truncates long principals with ellipsis in the middle
   * @param principal - The principal string to format
   * @returns Formatted principal string
   */
  const formatPrincipal = (principal: string) => {
    if (!principal || typeof principal !== 'string') {
      return 'Unknown';
    }
    return principal.length > 20 ? principal.slice(0, 10) + '...' + principal.slice(-10) : principal;
  };

  /**
   * Returns appropriate Tailwind CSS classes for tier badges
   * @param tier - The user's subscription tier
   * @returns CSS class string for tier styling
   */
  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Base: 'bg-gray-100 text-gray-800',
      Standard: 'bg-blue-100 text-blue-800',
      Professional: 'bg-purple-100 text-purple-800',
      Enterprise: 'bg-green-100 text-green-800'
    };
    return colors[tier] || colors['Base'];
  };

  /**
   * Returns benefits list for each subscription tier
   * @param tier - The subscription tier
   * @returns Array of benefit strings
   */
  const getTierBenefits = (tier: string) => {
    const benefits: Record<string, string[]> = {
      Base: [
        '1,000 messages per month',
        'Standard AI models',
        'Email support',
        'Private agents',
        'Advanced customization',
      ],
      Standard: [
        '5,000 messages per month',
        'Premium AI models',
        'Priority support',
        'API access',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration',
      ],
      Professional: [
        '20,000 messages per month',
        'All AI models',
        'Dedicated support',
        'Custom features',
        'SLA guarantees',
        'On-premise deployment',
        'Custom integrations',
        'Training & onboarding',
        'Volume discounts',
      ],
      Enterprise: [
        'Unlimited messages',
        'All AI models',
        'Dedicated support',
        'Custom features',
        'SLA guarantees',
        'On-premise deployment',
        'Custom integrations',
        'Training & onboarding',
        'Volume discounts',
      ]
    };
    return benefits[tier] || benefits['Base'];
  };

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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Profile not available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load user profile data.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  User Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your account, balance, and view detailed usage statistics.</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User ID</h4>
                      <p className="text-sm text-gray-900 dark:text-white font-mono">{formatPrincipal(profile.userId)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Account Tier</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(profile.tier)}`}>
                        {profile.tier}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Balance</h4>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${profile.balance.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(profile.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Agents</h4>
                      <p className="text-sm text-gray-900 dark:text-white">{profile.totalAgents}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Messages</h4>
                      <p className="text-sm text-gray-900 dark:text-white">{profile.totalMessages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Agents</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalAgents}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversations</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalConversations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalMessages}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${profile.balance.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tier Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle>{profile.tier} Tier Benefits</CardTitle>
                  <CardDescription>
                    Your current subscription includes the following features and limits.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getTierBenefits(profile.tier).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Month Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {usage?.currentMonth.messages || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${((usage?.currentMonth.tokensUsed || 0) * 0.01).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last Month Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {usage?.lastMonth.messages || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ${((usage?.lastMonth.tokensUsed || 0) * 0.01).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Billing History */}
              {usage && usage.billing.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Billing History</CardTitle>
                    <CardDescription>
                      Your most recent transactions and usage charges.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {usage.billing.slice(0, 5).map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <CreditCardIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${transaction.amount.toFixed(4)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
  );
};

export default UserProfile;