import React, { useState, useEffect } from 'react';
import { canisterService } from '../services/canisterService';

interface PaymentFormProps {
  onSuccess?: (amount: number) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  isModal?: boolean;
  className?: string;
}

interface PaymentData {
  amount: string;
  paymentMethod: 'card' | 'crypto' | 'bank';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  cryptoWallet: string;
  bankAccount: string;
}

interface ValidationErrors {
  amount?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  cryptoWallet?: string;
  bankAccount?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSuccess,
  onError,
  onClose,
  isModal = false,
  className = ''
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    cryptoWallet: '',
    bankAccount: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'confirm'>('amount');

  // Real-time validation
  const validateField = (field: keyof PaymentData, value: string): string | undefined => {
    switch (field) {
      case 'amount':
        const amount = parseFloat(value);
        if (!value) return 'Amount is required';
        if (isNaN(amount) || amount <= 0) return 'Please enter a valid amount';
        if (amount < 1) return 'Minimum amount is $1.00';
        if (amount > 10000) return 'Maximum amount is $10,000.00';
        break;
      
      case 'cardNumber':
        if (paymentData.paymentMethod === 'card') {
          if (!value) return 'Card number is required';
          const cleaned = value.replace(/\s/g, '');
          if (!/^\d{13,19}$/.test(cleaned)) return 'Please enter a valid card number';
        }
        break;
      
      case 'expiryDate':
        if (paymentData.paymentMethod === 'card') {
          if (!value) return 'Expiry date is required';
          if (!/^\d{2}\/\d{2}$/.test(value)) return 'Please enter MM/YY format';
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          if (parseInt(month) < 1 || parseInt(month) > 12) return 'Invalid month';
          if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            return 'Card has expired';
          }
        }
        break;
      
      case 'cvv':
        if (paymentData.paymentMethod === 'card') {
          if (!value) return 'CVV is required';
          if (!/^\d{3,4}$/.test(value)) return 'Please enter a valid CVV';
        }
        break;
      
      case 'cardholderName':
        if (paymentData.paymentMethod === 'card') {
          if (!value) return 'Cardholder name is required';
          if (value.length < 2) return 'Please enter a valid name';
        }
        break;
      
      case 'cryptoWallet':
        if (paymentData.paymentMethod === 'crypto') {
          if (!value) return 'Wallet address is required';
          if (value.length < 26) return 'Please enter a valid wallet address';
        }
        break;
      
      case 'bankAccount':
        if (paymentData.paymentMethod === 'bank') {
          if (!value) return 'Bank account is required';
          if (!/^\d{8,17}$/.test(value)) return 'Please enter a valid account number';
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5);
    }
    
    // Update payment data
    setPaymentData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateStep = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 'amount':
        newErrors.amount = validateField('amount', paymentData.amount);
        break;
      
      case 'details':
        if (paymentData.paymentMethod === 'card') {
          newErrors.cardNumber = validateField('cardNumber', paymentData.cardNumber);
          newErrors.expiryDate = validateField('expiryDate', paymentData.expiryDate);
          newErrors.cvv = validateField('cvv', paymentData.cvv);
          newErrors.cardholderName = validateField('cardholderName', paymentData.cardholderName);
        } else if (paymentData.paymentMethod === 'crypto') {
          newErrors.cryptoWallet = validateField('cryptoWallet', paymentData.cryptoWallet);
        } else if (paymentData.paymentMethod === 'bank') {
          newErrors.bankAccount = validateField('bankAccount', paymentData.bankAccount);
        }
        break;
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleNext = () => {
    if (validateStep()) {
      const steps: Array<typeof step> = ['amount', 'method', 'details', 'confirm'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const steps: Array<typeof step> = ['amount', 'method', 'details', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsProcessing(true);
    try {
      const amount = parseFloat(paymentData.amount);
      
      // Simulate payment processing (replace with actual payment integration)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add balance to user account
      await canisterService.addBalance(amount);
      
      onSuccess?.(amount);
      
      // Reset form
      setPaymentData({
        amount: '',
        paymentMethod: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        cryptoWallet: '',
        bankAccount: ''
      });
      setStep('amount');
      
    } catch (error) {
      console.error('Payment failed:', error);
      onError?.('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {['Amount', 'Method', 'Details', 'Confirm'].map((label, index) => {
        const stepNames: Array<typeof step> = ['amount', 'method', 'details', 'confirm'];
        const currentIndex = stepNames.indexOf(step);
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        
        return (
          <div key={label} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${isActive ? 'bg-blue-600 text-white' : 
                isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {isCompleted ? '✓' : index + 1}
            </div>
            <span className={`ml-2 text-sm ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
            {index < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
          </div>
        );
      })}
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Add Balance</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            value={paymentData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className={`
              w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.amount ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder="0.00"
            min="1"
            max="10000"
            step="0.01"
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[25, 50, 100].map(amount => (
          <button
            key={amount}
            onClick={() => handleInputChange('amount', amount.toString())}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
      <div className="space-y-3">
        {[
          { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
          { value: 'crypto', label: 'Cryptocurrency', icon: '₿' },
          { value: 'bank', label: 'Bank Transfer', icon: '🏦' }
        ].map(method => (
          <label key={method.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="paymentMethod"
              value={method.value}
              checked={paymentData.paymentMethod === method.value}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="mr-3"
            />
            <span className="text-xl mr-3">{method.icon}</span>
            <span className="font-medium">{method.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => {
    if (paymentData.paymentMethod === 'card') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              value={paymentData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                value={paymentData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                value={paymentData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.cvv ? 'border-red-500' : 'border-gray-300'}
                `}
                placeholder="123"
                maxLength={4}
              />
              {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              value={paymentData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="John Doe"
            />
            {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
          </div>
        </div>
      );
    }
    
    if (paymentData.paymentMethod === 'crypto') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Cryptocurrency Payment</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              value={paymentData.cryptoWallet}
              onChange={(e) => handleInputChange('cryptoWallet', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.cryptoWallet ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
            />
            {errors.cryptoWallet && <p className="mt-1 text-sm text-red-600">{errors.cryptoWallet}</p>}
          </div>
        </div>
      );
    }
    
    if (paymentData.paymentMethod === 'bank') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Transfer</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
            <input
              type="text"
              value={paymentData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.bankAccount ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder="123456789"
            />
            {errors.bankAccount && <p className="mt-1 text-sm text-red-600">{errors.bankAccount}</p>}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderConfirmStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Confirm Payment</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold">${paymentData.amount}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-semibold capitalize">{paymentData.paymentMethod}</span>
        </div>
        
        {paymentData.paymentMethod === 'card' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Card:</span>
            <span className="font-semibold">****{paymentData.cardNumber.slice(-4)}</span>
          </div>
        )}
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${paymentData.amount}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Secure Payment</h4>
            <p className="text-sm text-blue-700">Your payment information is encrypted and secure. This transaction will add ${paymentData.amount} to your CanistChat balance.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'amount': return renderAmountStep();
      case 'method': return renderMethodStep();
      case 'details': return renderDetailsStep();
      case 'confirm': return renderConfirmStep();
      default: return null;
    }
  };

  return (
    <div className={`${className} ${isModal ? 'max-w-md mx-auto' : 'w-full'}`}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Security Indicators */}
        <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure SSL Encrypted</span>
          <span className="mx-2">•</span>
          <span>PCI DSS Compliant</span>
        </div>
        
        {renderStepIndicator()}
        
        <div className="mb-6">
          {renderStep()}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={step === 'amount' ? onClose : handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={isProcessing}
          >
            {step === 'amount' ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={step === 'confirm' ? handleSubmit : handleNext}
            disabled={isProcessing || (step === 'amount' && !paymentData.amount)}
            className={`
              px-6 py-2 rounded-lg font-medium
              ${isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : step === 'confirm' ? 'Complete Payment' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}; 