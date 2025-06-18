import React, { useState } from 'react';
import { PaymentForm } from './PaymentForm';
import BalanceDisplay from './BalanceDisplay';
import { TransactionHistory } from './TransactionHistory';
import { PricingTiers } from './PricingTiers';

interface PaymentManagementProps {
  className?: string;
}

type ActiveTab = 'overview' | 'add-balance' | 'transactions' | 'plans';

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentTier, setCurrentTier] = useState<'Free' | 'Base' | 'Pro' | 'Enterprise'>('Free');

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

  const handleTierUpgrade = (tier: string) => {
    console.log(`Upgrading to tier: ${tier}`);
    setCurrentTier(tier as typeof currentTier);
    setShowPricingModal(false);
    alert(`Successfully upgraded to ${tier} plan!`);
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
        return (
          <div className="space-y-6">
                        <BalanceDisplay />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    💳 Add Balance
                  </button>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    🚀 Upgrade Plan
                  </button>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    📋 View Transactions
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">45 messages</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-semibold">78 messages</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold">$12.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. per Message</span>
                    <span className="font-semibold">$0.10</span>
                  </div>
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
          />
        );

      default:
        return null;
    }
  };

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