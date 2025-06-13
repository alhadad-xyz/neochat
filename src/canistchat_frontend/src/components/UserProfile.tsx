import React, { useState, useEffect } from 'react';
import { UserIcon, CreditCardIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { UserProfileProps, UserProfile as UserProfileType, UsageData } from '../types';

const UserProfile: React.FC<UserProfileProps> = ({ sessionToken, identity }) => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock profile data
  const mockProfile: UserProfileType = {
    userId: identity?.getPrincipal() ? 
      (typeof identity.getPrincipal().toString === 'function' ? 
        identity.getPrincipal().toString() : 
        'unknown'
      ) : 'unknown',
    tier: 'Standard',
    balance: 1250,
    currency: 'ICP',
    joinDate: '2024-01-01T00:00:00Z',
    totalAgents: 3,
    totalConversations: 47,
    totalMessages: 284
  };

  const mockUsage: UsageData = {
    currentMonth: {
      messages: 156,
      tokensUsed: 12450,
      cost: 12.45
    },
    lastMonth: {
      messages: 128,
      tokensUsed: 9870,
      cost: 9.87
    },
    billing: [
      {
        date: '2024-01-15',
        amount: 12.45,
        description: 'January Usage'
      },
      {
        date: '2023-12-15',
        amount: 9.87,
        description: 'December Usage'
      }
    ]
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(mockProfile);
        setUsage(mockUsage);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [identity]);

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
    return colors[tier] || colors['Standard'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading profile...</span>
      </div>
    );
  }

  if (!profile || !usage) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load profile</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getTierColor(profile.tier)}`}>
                {profile.tier}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Principal: {formatPrincipal(profile.userId)}
            </p>
            <p className="text-gray-600">
              Member since {new Date(profile.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Token Balance</p>
              <div className="text-2xl font-bold text-green-600">{profile.balance}</div>
              <div className="text-xs text-gray-500">{profile.currency} Tokens</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <div className="text-2xl font-bold text-blue-600">{usage.currentMonth.cost}</div>
              <div className="text-xs text-gray-500">{usage.currentMonth.messages} messages</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CogIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Agents</p>
              <div className="text-2xl font-bold text-purple-600">{usage.currentMonth.messages}</div>
              <div className="text-xs text-gray-500">Total conversations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {usage.billing.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.amount} {profile.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Usage Statistics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages</span>
                    <span className="font-medium">{usage.currentMonth.messages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tokens Used</span>
                    <span className="font-medium">{usage.currentMonth.tokensUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost</span>
                    <span className="font-medium">{usage.currentMonth.cost} {profile.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Last Month</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Messages</span>
                    <span className="font-medium">{usage.lastMonth.messages}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tokens Used</span>
                    <span className="font-medium">{usage.lastMonth.tokensUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost</span>
                    <span className="font-medium">{usage.lastMonth.cost} {profile.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Activity Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profile.totalAgents}</div>
              <div className="text-sm text-gray-500">Total Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profile.totalConversations}</div>
              <div className="text-sm text-gray-500">Total Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profile.totalMessages}</div>
              <div className="text-sm text-gray-500">Total Messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 