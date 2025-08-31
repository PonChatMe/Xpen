import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { IconEdit, IconX } from '@tabler/icons-react'; // Add this import at the top

const paymentMethodLabels = {
  cash: 'Cash',
  transfer: 'Transfer',
  between_account: 'Between Account',
};

export default function RecentTransactions({ filteredTxs = [], handleOpenFile = () => {}, onEdit = () => {}, onDelete = () => {} }) {
  const navigate = useNavigate();
  const recent = filteredTxs.slice(0, 10);
  
  const formatCurrency = (amount, currency) => {
    const options = {
      style: 'currency',
      currency: currency || 'THB',
    };

    if (amount % 1 !== 0) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 4;
    } else {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    }

    return new Intl.NumberFormat('en-US', options).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900">
      <div className="divide-y divide-gray-500">
        {recent.map((tx, idx) => {
          return (
          <div key={`${tx.id || 'no-id'}-${idx}`} onClick={() => { console.log('Transaction clicked:', tx); onEdit(tx); }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm p-2 text-white rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <div className="flex-1 min-w-0">
              <div className="text-xs inline-block text-white bg-cyan-800 px-2 py-1 rounded-full">{tx.description || 'No description'}</div>
              <div className="text-xs text-gray-400 flex items-center flex-wrap">
                <span>{tx.date ? formatDate(tx.date) : 'No date'}</span>
                {tx.category && <span className="mx-1">•</span>}
                {tx.category && <span className="text-xs px-2 py-1 bg-amber-900 text-white rounded-full ml-1 mt-1"> {tx.category}</span>}
                
                 {tx.currency && (
                  <span className="text-xs px-2 py-1 bg-green-800 text-white rounded-full ml-1 mt-1">
                    {tx.currency}
                  </span>
                )}
                {tx.paymentMethod && (
                  <span className="text-xs px-2 py-1 bg-blue-800 text-white rounded-full ml-1 mt-1">
                    {paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0 flex-wrap justify-end">
              {!tx.isCounted && (
                <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded-full">
                  Not Count
                </span>
              )}
              {tx.fileUrl && (
                <button 
                  className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:border-blue-300"
                  onClick={(e) => { e.stopPropagation(); handleOpenFile(tx.fileUrl); }}
                >
                  📎
                </button>
              )}
              <div className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-300'}`}>
                {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </div>
              {/* Edit Icon */}
              <button
                className="text-gray-400 hover:text-blue-500 p-1 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => { e.stopPropagation(); console.log('RecentTransactions: Edit icon clicked for transaction:', tx); onEdit(tx); }}
                aria-label="Edit transaction"
              >
                <IconEdit size={18} />
              </button>
              {/* Delete Icon */}
              <button
                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => { e.stopPropagation(); onDelete(tx); }} // onDelete will be passed from Home.jsx
                aria-label="Delete transaction"
              >
                <IconX size={18} />
              </button>
            </div>
          </div>
        );})}
        {recent.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No recent transactions
            <div className="text-xs mt-1">Add your first transaction above</div>
          </div>
        )}
      </div>
      {filteredTxs.length > 10 && (
        <div className="mt-4 text-center">
          <Button onClick={() => navigate('/xpen/settings', { state: { activeTab: 'transactions' } })}>View More</Button>
        </div>
      )}
    </div>
  );
}
