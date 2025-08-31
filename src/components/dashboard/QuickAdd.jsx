import React, { useState } from 'react';
import { Button } from '../ui/button';

import NumericKeypad from '../ui/numeric-keypad';
import SummaryPopup from '../ui/summary-popup';
import { mainCategoryGroups, subcategoriesMap } from '../../lib/dashboardConstants';
import InfiniteScrollSelect from '../ui/InfiniteScrollSelect';

export default function QuickAdd({
  onTransactionAdded = () => {},
  totalIncome = 0,
  totalExpenses = 0,
  netBalance = 0,
  selectedCurrency,
}) {
  const [transactionType, setTransactionType] = useState('expense');
  const [isCounted, setIsCounted] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [categoryGroup, setCategoryGroup] = useState('Personal');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  
  const [showKeypad, setShowKeypad] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [amount, setAmount] = useState('');
  const [pendingTransaction, setPendingTransaction] = useState(null);

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    const defaultGroup = mainCategoryGroups[type][0].label;
    setCategoryGroup(defaultGroup);
    setCategory('');
    setSubcategory('');
    setDescription('');
  };

  // Get categories based on category group and transaction type
  const getCategories = () => {
    const groupsForType = mainCategoryGroups[transactionType];
    const group = groupsForType ? groupsForType.find(g => g.label === categoryGroup) : null;
    return group ? group.categories : [];
  };

  // Get subcategories based on category
  const getSubcategories = () => {
    return subcategoriesMap[category] || [];
  };

  const handleAmountClick = () => {
    setShowKeypad(true);
  };

  const handleKeypadConfirm = (confirmedAmount) => {
    setAmount(confirmedAmount.toString());
    setShowKeypad(false);

    const newPendingTransaction = {
      type: transactionType,
      isCounted,
      paymentMethod,
      categoryGroup,
      category,
      subcategory,
      description,
      amount: transactionType === 'income' ? parseFloat(confirmedAmount) : -parseFloat(confirmedAmount),
      date: new Date().toISOString(),
      currency: selectedCurrency,
    };
    setPendingTransaction(newPendingTransaction);

    // Show summary popup
    setTimeout(() => {
      setShowSummary(true);
    }, 500);
  };

  const handleKeypadCancel = () => {
    setShowKeypad(false);
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    setPendingTransaction(null); // Clear pending transaction on close
    // Reset form
    setTransactionType('expense');
    setIsCounted(true);
    setPaymentMethod('cash');
    setCategoryGroup('Personal'); // Reset to a default group
    setCategory('');
    setSubcategory('');
    setDescription('');
    setAmount('');
  };

  const handleSubmit = () => {
    if (amount) {
      const transaction = {
        type: transactionType,
        isCounted,
        paymentMethod,
        categoryGroup,
        category,
        subcategory,
        description,
        amount: transactionType === 'income' ? parseFloat(amount) : -parseFloat(amount),
        date: new Date().toISOString(),
        currency: selectedCurrency,
      };
      
      console.log('QuickAdd: handleSubmit - transaction object before passing to Home:', transaction);
      onTransactionAdded(transaction);
      handleSummaryClose();
    }
  };

  return (
    <div className="border border-gray-800 rounded-lg p-6 bg-black space-y-6">
      
      {/* Row 1: Transaction Type */}
      <div className="flex gap-3">
        <Button
          onClick={() => handleTransactionTypeChange('income')}
          className={`flex-1 h-12 text-base ${transactionType === 'income' ? 'bg-blue-800/70 text-white' : 'bg-black text-white'}`}
        >
          Income
        </Button>
        <Button
          onClick={() => handleTransactionTypeChange('expense')}
          className={`flex-1 h-12 text-base ${transactionType === 'expense' ? 'bg-blue-800/70 text-white' : 'bg-black text-white'}`}
        >
          Expense
        </Button>
      </div>

      {/* Row 2: Count / Not Count */}
      <div className="flex gap-3">
        <Button
          onClick={() => setIsCounted(true)}
          className={`flex-1 h-12 text-base ${isCounted ? 'bg-blue-800/90 text-white' : 'bg-black text-white'}`}
        >
          Count
        </Button>
        <Button
          onClick={() => setIsCounted(false)}
          className={`flex-1 h-12 text-base ${!isCounted ? 'bg-blue-800/90 text-white' : 'bg-black text-white'}`}
        >
          Not Count
        </Button>
      </div>

      {/* Row 3: Money Type */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={() => setPaymentMethod('cash')}
          className={`h-12 text-sm ${paymentMethod === 'cash' ? 'bg-blue-800 text-white' : 'bg-black text-white'}`}
        >
          Cash
        </Button>
        <Button
          onClick={() => setPaymentMethod('transfer')}
          className={`h-12 text-sm ${paymentMethod === 'transfer' ? 'bg-blue-800 text-white' : 'bg-black text-white'}`}
        >
          Transfer
        </Button>
        <Button
          onClick={() => setPaymentMethod('between_account')}
          className={`h-12 text-xs px-2 ${paymentMethod === 'between_account' ? 'bg-blue-800 text-white' : 'bg-black text-white'}`}
        >
          Between Account
        </Button>
      </div>

      {/* Row 4, 5, 6: Expense Type, Categories, Subcategories */}
      <div className="grid grid-cols-3 gap-4">
        {
          <div className="space-y-2">
            <InfiniteScrollSelect
              items={mainCategoryGroups[transactionType].map(g => ({ label: g.label, value: g.label }))}
              onSelect={(value) => setCategoryGroup(value)}
              selectedValue={categoryGroup}
              placeholder="Select category group"
              containerHeight="300px"
              className="bg-black  border-gray-900 rounded-lg"
              itemClassName="text-white"
            />
          </div>
        }

        {
          <div className="space-y-2">
            <InfiniteScrollSelect
              items={getCategories().map(cat => ({ label: cat, value: cat }))}
              onSelect={(value) => { setCategory(value); setDescription(value); }}
              selectedValue={category}
              placeholder="Select category"
              containerHeight="300px"
              className="bg-black  border-gray-900 rounded-lg"
              itemClassName="text-white"
            />
          </div>
        }

        {category && (
          <div className="space-y-2">
            <InfiniteScrollSelect
              items={getSubcategories().map(subcat => ({ label: subcat, value: subcat }))}
              onSelect={(value) => { setSubcategory(value); setDescription(value); setShowKeypad(true); }}
              selectedValue={subcategory}
              placeholder="Select subcategory"
              containerHeight="300px"
              className="bg-black  border-gray-900 rounded-lg"
              itemClassName="text-white"
            />
          </div>
        )}
      </div>

      

      

      {/* Row 9: Amount Input - Hidden as per user request */}
      {/*
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-600">Amount</div>
        <div
          onClick={handleAmountClick}
          className="w-full p-6 bg-gray-100 border border-gray-300 rounded-lg text-black text-center text-3xl font-mono cursor-pointer hover:bg-gray-200 transition-colors"
        >
          {amount ? `฿${parseFloat(amount).toLocaleString()}` : 'Tap to enter amount'}
        </div>
      </div>
      */}

      {/* Numeric Keypad */}
      {showKeypad && (
        <NumericKeypad
          onConfirm={handleKeypadConfirm}
          onCancel={handleKeypadCancel}
          initialValue={amount}
          description={description}
          setDescription={setDescription}
        />
      )}

      {/* Summary Popup */}
      {showSummary && (
        <SummaryPopup
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netBalance={netBalance}
          onConfirm={handleSubmit}
          onClose={handleSummaryClose}
          pendingTransaction={pendingTransaction}
        />
      )}
    </div>
  );
}

