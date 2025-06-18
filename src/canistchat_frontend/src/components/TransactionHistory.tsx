import React, { useState, useEffect } from 'react';
import { canisterService } from '../services/canisterService';

interface TransactionHistoryProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

interface Transaction {
  id: string;
  type: 'payment' | 'usage' | 'refund' | 'credit';
  amount: number;
  description: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  agentId?: string;
  agentName?: string;
  operation?: string;
  tokens?: number;
}

interface FilterOptions {
  type: 'all' | 'payment' | 'usage' | 'refund' | 'credit';
  status: 'all' | 'completed' | 'pending' | 'failed' | 'cancelled';
  dateRange: 'all' | '7days' | '30days' | '90days' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  className = '',
  limit = 50,
  showFilters = true,
  onTransactionClick
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    dateRange: '30days'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const loadTransactions = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Get usage history from canister service
      const usageHistory = await canisterService.getUsageHistory(limit);
      
      // Transform usage records to transaction format
      const transformedTransactions: Transaction[] = usageHistory.map(record => ({
        id: record.id,
        type: 'usage' as const,
        amount: -record.cost, // Negative for usage
        description: `${record.operation} - ${record.agentId}`,
        timestamp: record.timestamp,
        status: 'completed' as const,
        agentId: record.agentId,
        operation: record.operation,
        tokens: record.tokens
      }));
      
      // Add mock payment transactions for demonstration
      // In production, these would come from a payment service
      const mockPaymentTransactions: Transaction[] = [
        {
          id: 'pay_001',
          type: 'payment',
          amount: 25.00,
          description: 'Balance top-up',
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'completed'
        },
        {
          id: 'pay_002',
          type: 'payment',
          amount: 50.00,
          description: 'Balance top-up',
          timestamp: Date.now() - 172800000, // 2 days ago
          status: 'completed'
        }
      ];
      
      // Combine and sort transactions
      const allTransactions = [...transformedTransactions, ...mockPaymentTransactions]
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setTransactions(allTransactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [limit]);

  const getFilteredTransactions = (): Transaction[] => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.agentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Apply date range filter
    const now = Date.now();
    const filterDate = (() => {
      switch (filters.dateRange) {
        case '7days': return now - (7 * 24 * 60 * 60 * 1000);
        case '30days': return now - (30 * 24 * 60 * 60 * 1000);
        case '90days': return now - (90 * 24 * 60 * 60 * 1000);
        case 'custom':
          if (filters.customStartDate) {
            return new Date(filters.customStartDate).getTime();
          }
          return 0;
        default: return 0;
      }
    })();

    if (filterDate > 0) {
      filtered = filtered.filter(transaction => transaction.timestamp >= filterDate);
    }

    if (filters.dateRange === 'custom' && filters.customEndDate) {
      const endDate = new Date(filters.customEndDate).getTime();
      filtered = filtered.filter(transaction => transaction.timestamp <= endDate);
    }

    return filtered;
  };

  const getPaginatedTransactions = (): Transaction[] => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (): number => {
    const filtered = getFilteredTransactions();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  const formatAmount = (amount: number): string => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(absAmount);
    
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'payment': return '💳';
      case 'usage': return '💬';
      case 'refund': return '↩️';
      case 'credit': return '🎁';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: '30days'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={loadTransactions}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredTransactions = getPaginatedTransactions();
  const totalPages = getTotalPages();

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <button
            onClick={loadTransactions}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="payment">Payments</option>
                  <option value="usage">Usage</option>
                  <option value="refund">Refunds</option>
                  <option value="credit">Credits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
              <span className="text-sm text-gray-600">
                {getFilteredTransactions().length} transactions found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h4>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => onTransactionClick?.(transaction)}
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${
                  onTransactionClick ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{formatDate(transaction.timestamp)}</span>
                      <span>•</span>
                      <span>ID: {transaction.id}</span>
                      {transaction.tokens && (
                        <>
                          <span>•</span>
                          <span>{transaction.tokens.toLocaleString()} tokens</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className={`text-lg font-semibold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredTransactions().length)} of {getFilteredTransactions().length} transactions
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 