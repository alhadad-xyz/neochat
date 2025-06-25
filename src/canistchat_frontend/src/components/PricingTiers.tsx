import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  DollarSign, 
  Activity, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  CreditCard, 
  RefreshCw, 
  Search 
} from 'lucide-react';
import { canisterService, UserSubscription, UsageRecord, AgentResponse } from '../services/canisterService';

interface PricingTiersProps {
  currentTier?: 'Free' | 'Base' | 'Pro' | 'Enterprise';
  onUpgrade?: (tier: string) => void;
  onDowngrade?: (tier: string) => void;
  className?: string;
  showCurrentTierOnly?: boolean;
  isModal?: boolean;
  sessionToken?: string | null;
  isLoading?: boolean;
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
    description: 'Perfect for trying out NeoChat and small personal projects.',
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
  isModal = false,
  sessionToken,
  isLoading = false
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [balanceAmount, setBalanceAmount] = useState('');

  // Real data state
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper calculations
  const now = new Date();
  const messagesThisMonth = usageHistory.filter(u => {
    const usageDate = new Date(u.timestamp);
    return usageDate.getMonth() === now.getMonth() && usageDate.getFullYear() === now.getFullYear();
  }).length;
  const totalSpent = usageHistory.reduce((sum, u) => sum + (u.cost || 0), 0);
  const activeAgents = agents.filter(agent => 'Active' in agent.status).length;
  const messagesLimit = subscription?.monthlyAllowance || 0;
  const agentsLimit = agents.length;
  const storageUsed = 0; // Not tracked yet
  const storageLimit = 100; // Not tracked yet
  const currentBalance = subscription?.monthlyCost || 0;

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

  const handleAddBalance = () => {
    if (!balanceAmount || parseFloat(balanceAmount) <= 0) return;
    
    // Simulate payment processing
    setTimeout(() => {
      setBalanceAmount('');
      alert(`Successfully added $${balanceAmount} to your balance!`);
    }, 2000);
  };

  const displayedTiers = getDisplayedTiers();

  return (
    <main className="flex-1 p-4 md:p-8 w-full min-w-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6 space-y-4 lg:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Billing & Payments
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                Manage your subscription, balance, and payment history
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto flex-shrink-0">
              <Badge variant="secondary" className="px-3 py-1 text-xs md:text-sm">
                {currentTier} Plan
              </Badge>
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm md:text-base"
                onClick={() => setActiveTab('add-balance')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Add Balance
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6 w-full min-w-0">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center space-x-1 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2.5 min-h-[40px]"
            >
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-balance" 
              className="flex items-center justify-center space-x-1 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2.5 min-h-[40px]"
            >
              <DollarSign className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Add Balance</span>
              <span className="sm:hidden">Add $</span>
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="flex items-center justify-center space-x-1 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2.5 min-h-[40px]"
            >
              <Clock className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="plans" 
              className="flex items-center justify-center space-x-1 text-xs lg:text-sm px-2 py-2 lg:px-3 lg:py-2.5 min-h-[40px]"
            >
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate">Plans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6 w-full min-w-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${currentBalance.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{messagesThisMonth}</p>
                      <p className="text-xs text-gray-500">messages used</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{activeAgents}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage and Plan Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Usage Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Messages this month</span>
                      <span className="font-medium">{messagesThisMonth} / {messagesLimit}</span>
                    </div>
                    <Progress value={(messagesThisMonth / messagesLimit) * 100} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Agents Created</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{activeAgents} / {agentsLimit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{storageUsed}MB / {storageLimit}MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Current Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {PRICING_TIERS.find(t => t.id === currentTier)?.name || 'Community'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentTier === 'Free' ? 'Free Tier' : `$${PRICING_TIERS.find(t => t.id === currentTier)?.price}/month`}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{messagesLimit} messages/month</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Basic AI models</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Community support</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => setActiveTab('plans')}
                  >
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="add-balance" className="space-y-6 w-full min-w-0">
            <div className="max-w-md mx-auto">
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Secure Payment</span>
                  </div>
                  <CardTitle className="text-xl font-semibold">Add Balance</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">Choose an amount to add to your account</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-10 text-lg font-semibold"
                        step="0.01"
                        value={balanceAmount}
                        onChange={(e) => setBalanceAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" onClick={() => setBalanceAmount('25')}>$25</Button>
                    <Button variant="outline" size="sm" onClick={() => setBalanceAmount('50')}>$50</Button>
                    <Button variant="outline" size="sm" onClick={() => setBalanceAmount('100')}>$100</Button>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={handleAddBalance}
                      disabled={!balanceAmount || parseFloat(balanceAmount) <= 0}
                    >
                      Continue to Payment
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Payments are processed securely via Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 md:space-y-6 w-full min-w-0">
            <Card className="bg-white dark:bg-gray-800 w-full max-w-full overflow-hidden box-border">
              <CardHeader className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <CardTitle className="flex items-center space-x-2 min-w-0">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Transaction History</span>
                  </CardTitle>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto flex-shrink-0">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search transactions..." className="pl-10 w-full" />
                  </div>
                  <Select defaultValue="all-types">
                    <SelectTrigger className="w-full lg:w-48 flex-shrink-0">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="topup">Balance Top-up</SelectItem>
                      <SelectItem value="usage">Usage Charge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3 sm:space-y-0 w-full max-w-full overflow-hidden box-border">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">Balance top-up</div>
                        <div className="text-sm text-gray-500 truncate">Jun 16, 2025, 03:34 PM • ID: pay_001</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                      <span className="font-semibold text-green-600 text-sm sm:text-base whitespace-nowrap">+$25.00</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3 sm:space-y-0 w-full max-w-full overflow-hidden box-border">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-white truncate">Usage charge</div>
                        <div className="text-sm text-gray-500 truncate">Jun 15, 2025, 02:15 PM • ID: charge_002</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                      <span className="font-semibold text-red-600 text-sm sm:text-base whitespace-nowrap">-$2.50</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6 w-full min-w-0">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Plan</h2>
              <p className="text-gray-600 dark:text-gray-400">Select the perfect plan for your needs</p>
              
              {/* Billing Period Toggle */}
              <div className="flex items-center justify-center space-x-4 mt-6">
                <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                  Yearly
                </span>
                {billingPeriod === 'yearly' && (
                  <Badge className="bg-green-100 text-green-700 text-xs">Save 17%</Badge>
                )}
              </div>
            </div>
            
                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
               {PRICING_TIERS.map((tier, index) => (
                <Card 
                  key={tier.id} 
                  className={`bg-white dark:bg-gray-800 relative ${
                    tier.popular ? 'border-2 border-purple-200 dark:border-purple-700' : ''
                  } ${tier.id === currentTier ? 'border-2 border-blue-200 dark:border-blue-700' : ''}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">{tier.badge}</Badge>
                    </div>
                  )}
                  {tier.id === currentTier && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">Current Plan</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {tier.price === 0 ? 'Free' : `$${getAdjustedPrice(tier).toFixed(2)}`}
                    </div>
                    {tier.price > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        /{billingPeriod === 'yearly' ? 'year' : tier.period}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{tier.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {tier.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className={`w-4 h-4 ${feature.included ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>• {typeof tier.limits.messages === 'number' ? `${tier.limits.messages.toLocaleString()} messages` : tier.limits.messages}</div>
                        <div>• {typeof tier.limits.agents === 'number' ? `${tier.limits.agents} agents` : tier.limits.agents}</div>
                        <div>• {tier.limits.storage} storage</div>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full ${getButtonColor(tier, index)}`}
                      disabled={tier.id === currentTier || isLoading}
                      onClick={() => handleTierAction(tier, index)}
                    >
                      {isLoading && selectedTier === tier.id ? 'Processing...' : getButtonText(tier, index)}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};
