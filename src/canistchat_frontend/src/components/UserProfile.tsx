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
      const [userBalance, usageHistory, userAgents] = await Promise.allSettled([
        canisterService.getUserBalance(),
        canisterService.getUsageHistory(50),
        canisterService.getUserAgents()
      ]);
      
      const balance = userBalance.status === 'fulfilled' ? userBalance.value : null;
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
      const currentMonthTokens = currentMonthUsage.reduce((sum, record) => sum + record.tokens, 0);
      const lastMonthTokens = lastMonthUsage.reduce((sum, record) => sum + record.tokens, 0);
      const currentMonthCost = currentMonthUsage.reduce((sum, record) => sum + record.cost, 0);
      const lastMonthCost = lastMonthUsage.reduce((sum, record) => sum + record.cost, 0);
      
      // Create profile data
      const realProfile: UserProfileType = {
        userId: identity?.getPrincipal() ? 
          (typeof identity.getPrincipal().toString === 'function' ? 
            identity.getPrincipal().toString() : 
            'unknown'
          ) : 'unknown',
        tier: balance?.currentTier || 'Base',
        balance: balance?.balance || 0,
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
          tokensUsed: currentMonthTokens,
          cost: currentMonthCost
        },
        lastMonth: {
          messages: lastMonthUsage.length,
          tokensUsed: lastMonthTokens,
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

  const handleAddBalance = async () => {
    if (!addBalanceAmount || isNaN(Number(addBalanceAmount))) {
      setError('Please enter a valid amount');
      return;
    }

    const amount = Number(addBalanceAmount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setAddingBalance(true);
      setError(null);
      
      await canisterService.addBalance(amount);
      
      setBalanceSuccess(true);
      setAddBalanceAmount('');
      
      // Reload profile to show updated balance
      await loadProfile();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setBalanceSuccess(false);
        setShowAddBalanceModal(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to add balance');
    } finally {
      setAddingBalance(false);
    }
  };

  const formatPrincipal = (principal: string) => {
    if (!principal || typeof principal !== 'string') {
      return 'Unknown';
    }
    return principal.length > 20 ? principal.slice(0, 10) + '...' + principal.slice(-10) : principal;
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Base: 'bg-gray-100 text-gray-800',
      Standard: 'bg-blue-100 text-blue-800',
      Professional: 'bg-purple-100 text-purple-800',
      Enterprise: 'bg-green-100 text-green-800'
    };
    return colors[tier] || colors['Base'];
  };

  const getTierBenefits = (tier: string) => {
    const benefits: Record<string, string[]> = {
      Base: ['Basic chat functionality', 'Up to 1,000 messages/month', 'Standard support'],
      Standard: ['Advanced chat features', 'Up to 10,000 messages/month', 'Priority support', 'Custom agents'],
      Professional: ['All Standard features', 'Up to 100,000 messages/month', 'API access', 'Advanced analytics'],
      Enterprise: ['All Professional features', 'Unlimited messages', 'Dedicated support', 'Custom integrations']
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
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            User Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account, balance, and view detailed usage statistics.
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={() => setShowAddBalanceModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Balance
          </button>
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

      {/* Success Message */}
      {balanceSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">Balance added successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Overview */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono break-all">{formatPrincipal(profile.userId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Tier</label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(profile.tier)}`}>
                  {profile.tier}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Balance</label>
              <p className="mt-1 text-lg font-semibold text-green-600">${profile.balance.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(profile.joinDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Agents</label>
              <p className="mt-1 text-sm text-gray-900">{profile.totalAgents}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Messages</label>
              <p className="mt-1 text-sm text-gray-900">{profile.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white px-4 py-6 shadow rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Agents</dt>
                <dd className="text-2xl font-semibold text-gray-900">{profile.totalAgents}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-6 shadow rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Conversations</dt>
                <dd className="text-2xl font-semibold text-gray-900">{profile.totalConversations.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-6 shadow rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Messages</dt>
                <dd className="text-2xl font-semibold text-gray-900">{profile.totalMessages.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-6 shadow rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Balance</dt>
                <dd className="text-2xl font-semibold text-gray-900">${profile.balance.toFixed(2)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {profile.tier} Tier Benefits
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {getTierBenefits(profile.tier).map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Details */}
      {usage && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Month Usage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Messages</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{usage.currentMonth.messages.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CpuChipIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Tokens Used</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{usage.currentMonth.tokensUsed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Cost</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${usage.currentMonth.cost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Last Month Usage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Messages</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{usage.lastMonth.messages.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CpuChipIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Tokens Used</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{usage.lastMonth.tokensUsed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">Cost</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">${usage.lastMonth.cost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">System Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {systemHealth.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Users</span>
                <span className="text-sm font-medium text-gray-900">{systemHealth.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Transactions</span>
                <span className="text-sm font-medium text-gray-900">{systemHealth.totalTransactions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Billing History */}
      {usage && usage.billing.length > 0 && (
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usage.billing.map((bill, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${bill.amount.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Balance Modal */}
      {showAddBalanceModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Balance</h3>
                <button
                  onClick={() => setShowAddBalanceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addBalanceAmount}
                  onChange={(e) => setAddBalanceAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddBalanceModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBalance}
                  disabled={addingBalance}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingBalance ? 'Adding...' : 'Add Balance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 