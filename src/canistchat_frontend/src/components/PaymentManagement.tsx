import React, { useState, useEffect } from 'react';
import BalanceDisplay from './BalanceDisplay';
import { PaymentForm } from './PaymentForm';
import { TransactionHistory } from './TransactionHistory';
import { PricingTiers } from './PricingTiers';
import { canisterService, UserSubscription, UsageRecord, AgentResponse } from '../services/canisterService';

interface PaymentManagementProps {
  className?: string;
}

type ActiveTab = 'overview' | 'add-balance' | 'transactions' | 'plans';

// Map backend tier names to PricingTiers component tier names
const mapBackendTierToPricingTier = (backendTier: string): 'Free' | 'Base' | 'Pro' | 'Enterprise' => {
  switch (backendTier) {
    case 'Base':
      return 'Base';
    case 'Standard':
      return 'Base'; // Map Standard to Base for PricingTiers
    case 'Professional':
      return 'Pro'; // Map Professional to Pro for PricingTiers
    case 'Enterprise':
      return 'Enterprise';
    default:
      return 'Base';
  }
};

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentTier, setCurrentTier] = useState<'Free' | 'Base' | 'Pro' | 'Enterprise'>('Base');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch user balance and tier from backend
  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const userBalance = await canisterService.getUserBalance();
        if (userBalance) {
          const mappedTier = mapBackendTierToPricingTier(userBalance.currentTier);
          setCurrentTier(mappedTier);
        }
      } catch (error) {
        console.error('Error fetching user tier:', error);
        // Keep default 'Base' tier on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserTier();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sub, usage, agentList] = await Promise.all([
          canisterService.getUserSubscription(),
          canisterService.getUsageHistory(1000),
          canisterService.getUserAgents()
        ]);
        setSubscription(sub);
        setUsageHistory(usage);
        setAgents(agentList);
        // Debug logs
        console.log('DEBUG: Subscription from canisterService:', sub);
        console.log('DEBUG: UsageHistory from canisterService:', usage);
        console.log('DEBUG: Agents from canisterService:', agentList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
        console.error('DEBUG: Error fetching billing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper calculations
  const messagesThisMonth = usageHistory.filter(u => {
    if (!subscription) return false;
    const now = new Date();
    const usageDate = new Date(u.timestamp);
    return (
      usageDate.getMonth() === now.getMonth() &&
      usageDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const messagesLastMonth = usageHistory.filter(u => {
    if (!subscription) return false;
    const now = new Date();
    const usageDate = new Date(u.timestamp);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      usageDate.getMonth() === lastMonth.getMonth() &&
      usageDate.getFullYear() === lastMonth.getFullYear()
    );
  }).length;

  const totalSpent = usageHistory.reduce((sum, u) => sum + (u.cost || 0), 0);
  const avgPerMessage = messagesThisMonth > 0 ? (totalSpent / messagesThisMonth) : 0;
  const activeAgents = agents.length;
  console.log('Agents Billing:', agents);

  const handlePaymentSuccess = (amount: number) => {
    console.log(`Payment successful: $${amount}`);
    setShowPaymentModal(false);
    // Refresh balance display
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Payment failed: ${error}`);
  };

  const handleTierUpgrade = async (tier: string) => {
    try {
      setLoading(true);
      console.log('Upgrading to:', tier);
      await canisterService.upgradeUserTier(tier);
      console.log('Upgrade call completed');
      // Refetch user balance/tier
      const userBalance = await canisterService.getUserBalance();
      if (userBalance) {
        const mappedTier = mapBackendTierToPricingTier(userBalance.currentTier);
        setCurrentTier(mappedTier);
      }
      setShowPricingModal(false);
      alert(`Successfully upgraded to ${tier} plan!`);
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to upgrade plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTierDowngrade = (tier: string) => {
    console.log(`Downgrading to tier: ${tier}`);
    setCurrentTier(tier as typeof currentTier);
    setShowPricingModal(false);
    alert(`Successfully changed to ${tier} plan!`);
  };

  const tabs = [
    { id: 'overview' as const, name: 'Overview', icon: '📊' },
    { id: 'add-balance' as const, name: 'Add Balance', icon: '💳' },
    { id: 'transactions' as const, name: 'Transactions', icon: '📋' },
    { id: 'plans' as const, name: 'Plans', icon: '🎯' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        if (loading) {
          return <div className="p-8 text-center text-gray-500">Loading billing data...</div>;
        }
        if (error) {
          return <div className="p-8 text-center text-red-500">{error}</div>;
        }
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-1">Current Plan</span>
                <span className="text-2xl font-bold">{subscription?.currentTier || '-'}</span>
                <span className="text-green-600 text-xs mt-1">{subscription?.monthlyCost ? `$${subscription.monthlyCost.toFixed(2)}/mo` : ''}</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-1">This Month</span>
                <span className="text-2xl font-bold">{messagesThisMonth}</span>
                <span className="text-xs text-gray-400 mt-1">messages used</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-1">Total Spent</span>
                <span className="text-2xl font-bold">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                <span className="text-gray-500 text-sm mb-1">Active Agents</span>
                <span className="text-2xl font-bold">{activeAgents}</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Messages this month</span>
                  <span className="font-semibold">{messagesThisMonth} / {subscription?.monthlyAllowance || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Month</span>
                  <span className="font-semibold">{messagesLastMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold">${totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. per Message</span>
                  <span className="font-semibold">${avgPerMessage.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'add-balance':
        return (
          <div className="max-w-md mx-auto">
            <PaymentForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onClose={() => setActiveTab('overview')}
            />
          </div>
        );

      case 'transactions':
        return (
          <TransactionHistory
            showFilters={true}
            onTransactionClick={(transaction) => {
              console.log('Transaction clicked:', transaction);
              alert(`Transaction details: ${JSON.stringify(transaction, null, 2)}`);
            }}
          />
        );

      case 'plans':
        return (
          <PricingTiers
            currentTier={currentTier}
            onUpgrade={handleTierUpgrade}
            onDowngrade={handleTierDowngrade}
            showCurrentTierOnly={false}
            isLoading={loading}
          />
        );

      default:
        return null;
    }
  };

  // Add a debug section to the UI (only in development)
  {process.env.NODE_ENV === 'development' && (
    <div className="bg-gray-100 border border-gray-300 rounded p-4 my-6 text-xs overflow-x-auto">
      <h4 className="font-bold mb-2 text-blue-700">[DEBUG] Raw Data from Canister Service</h4>
      <div className="mb-2">
        <span className="font-semibold">Subscription:</span>
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(subscription, null, 2)}</pre>
      </div>
      <div className="mb-2">
        <span className="font-semibold">UsageHistory:</span>
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(usageHistory, null, 2)}</pre>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Agents:</span>
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(agents, null, 2)}</pre>
      </div>
      {error && (
        <div className="mb-2 text-red-600">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}
    </div>
  )}

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                <p className="text-gray-600 mt-1">Manage your balance, payments, and subscription plans</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentTier} Plan
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add Balance</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PaymentForm
                isModal={true}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onClose={() => setShowPaymentModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Choose Your Plan</h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PricingTiers
                isModal={true}
                currentTier={currentTier}
                onUpgrade={handleTierUpgrade}
                onDowngrade={handleTierDowngrade}
                showCurrentTierOnly={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Demo Notification */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h4 className="font-semibold mb-2">💡 Demo Mode</h4>
        <p className="text-sm">
          This is a demonstration of the payment system. All transactions are simulated and no real payments are processed.
        </p>
      </div>
    </div>
  );
}; 