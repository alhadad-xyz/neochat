import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, TrendingUp, Shield, Star, Zap } from 'lucide-react';
import { canisterService, UserBalance } from '../services/canisterService';

const BalanceDisplay: React.FC = () => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch balance information
  const fetchBalanceData = async () => {
    try {
      setError(null);
      const userBalance = await canisterService.getUserBalance();
      setBalance(userBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBalanceData();
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Base': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'Standard': return <Star className="w-5 h-5 text-green-500" />;
      case 'Professional': return <Zap className="w-5 h-5 text-purple-500" />;
      case 'Enterprise': return <TrendingUp className="w-5 h-5 text-gold-500" />;
      default: return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Base': return 'text-blue-600 bg-blue-100';
      case 'Standard': return 'text-green-600 bg-green-100';
      case 'Professional': return 'text-purple-600 bg-purple-100';
      case 'Enterprise': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierLimits = (tier: string) => {
    switch (tier) {
      case 'Base':
        return { 
          monthlyLimit: 1000, 
          pricePerMonth: 9.99, 
          costPerMessage: 0.01,
          features: ['Basic chat', 'Email support', 'Standard AI models'] 
        };
      case 'Standard':
        return { 
          monthlyLimit: 5000, 
          pricePerMonth: 29.99, 
          costPerMessage: 0.008,
          features: ['Advanced chat', 'Priority support', 'Premium AI models'] 
        };
      case 'Professional':
        return { 
          monthlyLimit: 20000, 
          pricePerMonth: 99.99, 
          costPerMessage: 0.006,
          features: ['Professional chat', 'Dedicated support', 'All AI models'] 
        };
      case 'Enterprise':
        return { 
          monthlyLimit: 100000, 
          pricePerMonth: 299.99, 
          costPerMessage: 0.004,
          features: ['Enterprise chat', 'White-glove support', 'Custom AI models'] 
        };
      default:
        return { 
          monthlyLimit: 1000, 
          pricePerMonth: 9.99, 
          costPerMessage: 0.01,
          features: ['Basic features'] 
        };
    }
  };

  const getUsagePercentage = () => {
    if (!balance) return 0;
    const tierLimits = getTierLimits(balance.currentTier);
    return Math.min((balance.monthlyUsage / tierLimits.monthlyLimit) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateMonthlyUsageCost = () => {
    if (!balance) return 0;
    const tierLimits = getTierLimits(balance.currentTier);
    return balance.monthlyUsage * tierLimits.costPerMessage;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-700">Error Loading Balance</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-yellow-700">No Balance Found</h3>
            <p className="text-yellow-600 mt-1">Please authenticate to view your balance</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const tierLimits = getTierLimits(balance.currentTier);
  const monthlyUsageCost = calculateMonthlyUsageCost();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CreditCard className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Account Balance</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Balance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Balance */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(balance.balance)}
          </p>
          <p className="text-sm text-gray-600">
            Available for usage and overage charges
          </p>
        </div>

        {/* Current Tier */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Current Plan</p>
          <div className="flex items-center space-x-2">
            {getTierIcon(balance.currentTier)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(balance.currentTier)}`}>
              {balance.currentTier} Tier
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {formatCurrency(tierLimits.pricePerMonth)}/month
          </p>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Monthly Usage</p>
          <p className="text-sm text-gray-500">
            {balance.monthlyUsage.toLocaleString()} messages • {formatCurrency(monthlyUsageCost)}
          </p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getUsageColor()}`}
            style={{ width: `${getUsagePercentage()}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>{tierLimits.monthlyLimit.toLocaleString()}</span>
        </div>

        {/* Usage Warning */}
        {getUsagePercentage() >= 75 && (
          <div className={`p-3 rounded-lg ${getUsagePercentage() >= 90 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${getUsagePercentage() >= 90 ? 'text-red-700' : 'text-yellow-700'}`}>
              {getUsagePercentage() >= 90 ? '⚠️ Usage Limit Nearly Reached' : '⚡ High Usage Alert'}
            </p>
            <p className={`text-xs mt-1 ${getUsagePercentage() >= 90 ? 'text-red-600' : 'text-yellow-600'}`}>
              {getUsagePercentage() >= 90 
                ? 'Consider upgrading your plan to avoid overage charges'
                : 'You\'ve used 75% of your monthly allowance'
              }
            </p>
          </div>
        )}
      </div>

      {/* Tier Features */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Plan Features</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tierLimits.features.map((feature: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Monthly Limit:</span>
              <span className="ml-2 text-gray-600">{tierLimits.monthlyLimit.toLocaleString()} messages</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Plan Price:</span>
              <span className="ml-2 text-gray-600">{formatCurrency(tierLimits.pricePerMonth)}/month</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cost per Message:</span>
              <span className="ml-2 text-gray-600">{formatCurrency(tierLimits.costPerMessage)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">This Month:</span>
              <span className="ml-2 text-gray-600">{formatCurrency(monthlyUsageCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 border-t pt-3">
        Last updated: {new Date(Number(balance.lastUpdated) / 1000000).toLocaleString()}
      </div>
    </div>
  );
};

export default BalanceDisplay; 