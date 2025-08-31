import React from 'react';

export default function SummaryCards({ totalIncome = 0, totalExpenses = 0, netBalance = 0 }) {
  const formatCurrency = (amount) => {
    if (amount > 1000000) {
      return <span title={new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)}>1M..</span>;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const items = [
    { 
      label: 'Income', 
      value: totalIncome,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    { 
      label: 'Expenses', 
      value: totalExpenses,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20'
    },
    { 
      label: 'Net', 
      value: netBalance,
      color: netBalance >= 0 ? 'text-white' : 'text-white',
      bgColor: netBalance >= 0 ? 'bg-blue-700/70' : 'bg-blue-700/70'
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {items.map((item) => (
        <div key={item.label} className={`border border-black rounded-lg p-4 ${item.bgColor} bg-white dark:bg-gray-900`}>
          <div className="text-sm text-gray-200">{item.label}</div>
          <div className={`text-xl font-semibold ${item.color}`}>
            {formatCurrency(item.value)}
          </div>
        </div>
      ))}
    </div>
  );
}