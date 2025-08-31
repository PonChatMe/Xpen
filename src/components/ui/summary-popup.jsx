import React, { useEffect } from 'react';
import { Button } from './button';

export default function SummaryPopup({ totalIncome, totalExpenses, netBalance, onConfirm, onClose, pendingTransaction }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyWithSign = (amount) => {
    const sign = amount < 0 ? '-' : '';
    return sign + new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const projectedTotalIncome = pendingTransaction && pendingTransaction.isCounted && pendingTransaction.amount > 0
    ? totalIncome + pendingTransaction.amount
    : totalIncome;

  const projectedTotalExpenses = pendingTransaction && pendingTransaction.isCounted && pendingTransaction.amount < 0
    ? totalExpenses - pendingTransaction.amount
    : totalExpenses;

  const projectedNetBalance = pendingTransaction && pendingTransaction.isCounted
    ? netBalance + pendingTransaction.amount
    : netBalance;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        onConfirm();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onConfirm, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-0" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Transaction Summary</h3>
          <p className="text-gray-400">Only counted transactions</p>
        </div>

        {pendingTransaction && (
          <div className="space-y-2 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-lg font-semibold text-white">New Transaction:</h4>
            <div className="flex justify-between text-gray-300">
              <span>Amount:</span>
              <span className={`${pendingTransaction.amount >= 0 ? 'text-green-400' : 'text-red-300'}`}>
                {formatCurrencyWithSign(pendingTransaction.amount)}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Category:</span>
              <span>{pendingTransaction.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Description:</span>
              <span>{pendingTransaction.description || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Type:</span>
              <span>{pendingTransaction.type}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Counted:</span>
              <span>{pendingTransaction.isCounted ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {/* Total Income */}
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-green-400 text-sm font-medium">Total Income</div>
                <div className="text-green-300 text-xs">Money received</div>
              </div>
              <div className="text-green-400 text-xl font-bold">
                {formatCurrency(projectedTotalIncome)}
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-red-400 text-sm font-medium">Total Expenses</div>
                <div className="text-red-300 text-xs">Money spent</div>
              </div>
              <div className="text-red-400 text-xl font-bold">
                {formatCurrency(projectedTotalExpenses)}
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className={`${projectedNetBalance >= 0 ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'} border rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`${projectedNetBalance >= 0 ? 'text-gray-200' : 'text-gray-200'} text-sm font-medium`}>Net Balance</div>
                <div className={`${projectedNetBalance >= 0 ? 'text-green-400' : 'text-red-400'} text-xs`}>
                  {projectedNetBalance >= 0 ? 'Profit' : 'Loss'}
                </div>
              </div>
              <div className={`${projectedNetBalance >= 0 ? 'text-white' : 'text-red-400'} text-xl font-bold`}>
                {formatCurrency(Math.abs(projectedNetBalance))}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => { onConfirm(); onClose(); }}
          className="w-full h-12 bg-black hover:bg-gray-700 text-gray-200 font-semibold"
        >
          Add 
        </Button>
      </div>
    </div>
  );
}
