import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface UserSubscription {
  userId: string;
  currentTier: 'Free' | 'Base' | 'Pro' | 'Enterprise';
  monthlyUsage: number;
  monthlyAllowance: number;
  monthlyCost: number;
  subscriptionStartDate: number;
  lastBillingDate: number;
  overageCharges: number;
  lastUpdated: number;
}

interface SubscriptionDisplayProps {
  subscription: UserSubscription | null;
  isLoading?: boolean;
}

export function SubscriptionDisplay({ subscription, isLoading = false }: SubscriptionDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No subscription data available</p>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = (subscription.monthlyUsage / subscription.monthlyAllowance) * 100;
  const isOverLimit = subscription.monthlyUsage > subscription.monthlyAllowance;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Free': return 'bg-gray-100 text-gray-800';
      case 'Base': return 'bg-blue-100 text-blue-800';
      case 'Pro': return 'bg-purple-100 text-purple-800';
      case 'Enterprise': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription
          <Badge className={getTierColor(subscription.currentTier)}>
            {subscription.currentTier} Plan
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Monthly Usage</span>
            <span className="font-medium">
              {subscription.monthlyUsage.toLocaleString()} / {subscription.monthlyAllowance.toLocaleString()} messages
            </span>
          </div>
          <Progress 
            value={Math.min(usagePercentage, 100)} 
            className={isOverLimit ? 'bg-red-100' : ''}
          />
          {isOverLimit && (
            <p className="text-sm text-red-600 mt-1">
              {subscription.monthlyUsage - subscription.monthlyAllowance} messages over limit
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Monthly Cost:</span>
            <p className="font-medium">${subscription.monthlyCost.toFixed(2)}</p>
          </div>
          {subscription.overageCharges > 0 && (
            <div>
              <span className="text-muted-foreground">Overage Charges:</span>
              <p className="font-medium text-red-600">${subscription.overageCharges.toFixed(2)}</p>
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(Number(subscription.lastUpdated) / 1000000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
} 