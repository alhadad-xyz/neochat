import React, { useState } from 'react';

interface PricingTiersProps {
  currentTier?: 'Free' | 'Base' | 'Pro' | 'Enterprise';
  onUpgrade?: (tier: string) => void;
  onDowngrade?: (tier: string) => void;
  className?: string;
  showCurrentTierOnly?: boolean;
  isModal?: boolean;
}

interface TierFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface PricingTier {
  id: 'Free' | 'Base' | 'Pro' | 'Enterprise';
  name: string;
  price: number;
  period: string;
  description: string;
  popular?: boolean;
  features: TierFeature[];
  limits: {
    messages: number | 'Unlimited';
    agents: number | 'Unlimited';
    storage: string;
    support: string;
  };
  buttonText: string;
  buttonColor: string;
  badge?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'Free',
    name: 'Community',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out CanistChat and small personal projects.',
    features: [
      { name: '100 messages per month', included: true },
      { name: 'Basic AI models', included: true },
      { name: 'Community support', included: true },
      { name: 'Public agent gallery', included: true },
      { name: 'Basic customization', included: true },
      { name: 'Premium AI models', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
      { name: 'Custom branding', included: false },
    ],
    limits: {
      messages: 100,
      agents: 3,
      storage: '100MB',
      support: 'Community'
    },
    buttonText: 'Get Started Free',
    buttonColor: 'bg-gray-600 hover:bg-gray-700'
  },
  {
    id: 'Base',
    name: 'Base',
    price: 9.99,
    period: 'month',
    description: 'Great for individuals and small teams getting started with AI chat.',
    features: [
      { name: '1,000 messages per month', included: true },
      { name: 'Standard AI models', included: true },
      { name: 'Email support', included: true },
      { name: 'Private agents', included: true },
      { name: 'Advanced customization', included: true },
      { name: 'Premium AI models', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
      { name: 'Custom branding', included: false },
    ],
    limits: {
      messages: 1000,
      agents: 10,
      storage: '1GB',
      support: 'Email'
    },
    buttonText: 'Start Base Plan',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 29.99,
    period: 'month',
    description: 'Perfect for growing businesses and teams that need advanced features.',
    popular: true,
    features: [
      { name: '5,000 messages per month', included: true },
      { name: 'Premium AI models', included: true },
      { name: 'Priority support', included: true },
      { name: 'API access', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'Custom branding', included: false },
      { name: 'Dedicated support', included: false },
    ],
    limits: {
      messages: 5000,
      agents: 50,
      storage: '10GB',
      support: 'Priority'
    },
    buttonText: 'Upgrade to Pro',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    badge: 'Most Popular'
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 0, // Custom pricing
    period: 'custom',
    description: 'Tailored solutions for large organizations with specific requirements.',
    features: [
      { name: 'Unlimited messages', included: true },
      { name: 'All AI models', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Custom features', included: true },
      { name: 'SLA guarantees', included: true },
      { name: 'On-premise deployment', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Training & onboarding', included: true },
      { name: 'Volume discounts', included: true },
    ],
    limits: {
      messages: 'Unlimited',
      agents: 'Unlimited',
      storage: 'Unlimited',
      support: 'Dedicated'
    },
    buttonText: 'Contact Sales',
    buttonColor: 'bg-gold-600 hover:bg-gold-700'
  }
];

export const PricingTiers: React.FC<PricingTiersProps> = ({
  currentTier = 'Free',
  onUpgrade,
  onDowngrade,
  className = '',
  showCurrentTierOnly = false,
  isModal = false
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const getDisplayedTiers = (): PricingTier[] => {
    if (showCurrentTierOnly) {
      return PRICING_TIERS.filter(tier => tier.id === currentTier);
    }
    return PRICING_TIERS;
  };

  const getAdjustedPrice = (tier: PricingTier): number => {
    if (tier.price === 0) return 0;
    return billingPeriod === 'yearly' ? tier.price * 10 : tier.price; // 2 months free with yearly
  };

  const getCurrentTierIndex = (): number => {
    return PRICING_TIERS.findIndex(tier => tier.id === currentTier);
  };

  const canUpgrade = (tierIndex: number): boolean => {
    return tierIndex > getCurrentTierIndex();
  };

  const canDowngrade = (tierIndex: number): boolean => {
    return tierIndex < getCurrentTierIndex() && tierIndex >= 0;
  };

  const handleTierAction = (tier: PricingTier, tierIndex: number) => {
    if (tier.id === currentTier) return;
    
    if (canUpgrade(tierIndex)) {
      onUpgrade?.(tier.id);
    } else if (canDowngrade(tierIndex)) {
      onDowngrade?.(tier.id);
    }
  };

  const getButtonText = (tier: PricingTier, tierIndex: number): string => {
    if (tier.id === currentTier) return 'Current Plan';
    if (tier.id === 'Enterprise') return 'Contact Sales';
    if (canUpgrade(tierIndex)) return `Upgrade to ${tier.name}`;
    if (canDowngrade(tierIndex)) return `Downgrade to ${tier.name}`;
    return tier.buttonText;
  };

  const getButtonColor = (tier: PricingTier, tierIndex: number): string => {
    if (tier.id === currentTier) return 'bg-gray-400 cursor-not-allowed';
    return tier.buttonColor;
  };

  const displayedTiers = getDisplayedTiers();

  return (
    <div className={`${className} ${isModal ? 'max-w-6xl mx-auto' : 'w-full'}`}>
      {!showCurrentTierOnly && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 mb-6">
            Select the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
          
          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save 17%
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`grid gap-8 ${
        displayedTiers.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        displayedTiers.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        displayedTiers.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {displayedTiers.map((tier, index) => {
          const tierIndex = PRICING_TIERS.findIndex(t => t.id === tier.id);
          const isCurrentTier = tier.id === currentTier;
          const adjustedPrice = getAdjustedPrice(tier);
          
          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 ${
                tier.popular ? 'border-purple-500 ring-2 ring-purple-200' : 
                isCurrentTier ? 'border-blue-500 ring-2 ring-blue-200' :
                'border-gray-200 hover:border-gray-300'
              } ${selectedTier === tier.id ? 'transform scale-105' : ''}`}
              onMouseEnter={() => setSelectedTier(tier.id)}
              onMouseLeave={() => setSelectedTier(null)}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-purple-600 text-white">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentTier && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    {tier.price === 0 ? (
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                    ) : tier.id === 'Enterprise' ? (
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">
                          ${adjustedPrice}
                        </span>
                        <span className="text-gray-600 ml-2">
                          /{billingPeriod === 'yearly' ? 'year' : tier.period}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    What's included
                  </h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits Summary */}
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Plan Limits</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Messages:</span>
                      <div className="font-medium">{tier.limits.messages === 'Unlimited' ? 'Unlimited' : tier.limits.messages.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Agents:</span>
                      <div className="font-medium">{tier.limits.agents === 'Unlimited' ? 'Unlimited' : tier.limits.agents}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Storage:</span>
                      <div className="font-medium">{tier.limits.storage}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Support:</span>
                      <div className="font-medium">{tier.limits.support}</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleTierAction(tier, tierIndex)}
                  disabled={isCurrentTier}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors duration-200 ${
                    getButtonColor(tier, tierIndex)
                  }`}
                >
                  {getButtonText(tier, tierIndex)}
                </button>

                {/* Additional Info */}
                {tier.id === 'Enterprise' && (
                  <p className="text-xs text-gray-600 text-center mt-3">
                    Custom pricing based on your specific needs
                  </p>
                )}
                
                {billingPeriod === 'yearly' && tier.price > 0 && tier.id !== 'Enterprise' && (
                  <p className="text-xs text-gray-600 text-center mt-3">
                    Billed annually • ${(tier.price * 12).toFixed(2)} per year
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      {!showCurrentTierOnly && (
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid gap-8 md:grid-cols-2 text-left max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens if I exceed my message limit?</h4>
              <p className="text-gray-600">You'll be charged $0.01 per additional message. We'll notify you when you're approaching your limit so you can upgrade if needed.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial for paid plans?</h4>
              <p className="text-gray-600">Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How does Enterprise pricing work?</h4>
              <p className="text-gray-600">Enterprise pricing is customized based on your specific needs, usage volume, and required features. Contact our sales team for a personalized quote.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
