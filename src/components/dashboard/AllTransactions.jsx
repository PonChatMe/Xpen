import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { IconEdit, IconX } from '@tabler/icons-react';

const paymentMethodLabels = {
  cash: 'Cash',
  transfer: 'Transfer',
  between_account: 'Between Account',
};

export default function AllTransactions({ filteredTxs = [], handleOpenFile = () => {}, onEdit = () => {}, onDelete = () => {}, selectedTransactionIds = [], toggleTransactionSelection = () => {} }) {
  const navigate = useNavigate();
  
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
    <div className="bg-gray-900 border-gray-700 rounded-lg p-2 hover:bg-black sm:p-3">
      <div className="divide-y divide-gray-600">
        {filteredTxs.map((tx, idx) => (
          <div key={`${tx.id || 'no-id'}-${idx}`} className="grid grid-cols-12 items-center p-2 text-white rounded hover:bg-gray-800 cursor-pointer">
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
              <input 
                type="checkbox" 
                checked={selectedTransactionIds.includes(tx.id)} 
                onChange={() => toggleTransactionSelection(tx.id)} 
                onClick={(e) => e.stopPropagation()} 
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
            </div>

            {/* Main Info */}
            <div className="col-span-11 sm:col-span-7 md:col-span-8">
              <div className="text-xs inline-block px-2.5 py-1 font-semibold text-white bg-cyan-600/50 rounded-full truncate">{tx.description || 'No description'}</div>
              <div className="text-xs text-gray-400 flex items-center flex-wrap mt-1">
                <span>{tx.date ? formatDate(tx.date) : 'No date'}</span>
                {tx.category && <span className="mx-1">•</span>}
                {tx.category && <span className="text-xs px-2 py-0.5 bg-amber-900 text-white rounded-full">{tx.category}</span>}
                {tx.currency && <span className="text-xs px-2 py-0.5 bg-green-800 text-white rounded-full ml-2">{tx.currency}</span>}
                {tx.paymentMethod && <span className="text-xs px-2 py-0.5 bg-blue-800 text-white rounded-full ml-2">{paymentMethodLabels[tx.paymentMethod] || tx.paymentMethod}</span>}
              </div>
            </div>

            {/* Amount and Actions */}
            <div className="col-span-12 sm:col-span-4 md:col-span-3 flex items-center justify-end gap-2 mt-2 sm:mt-0">
              {(tx.category === 'Other account' || !tx.isCounted) && (
                <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded-full">Not Count</span>
              )}
              <div className={`font-medium text-base ${tx.amount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </div>
              {tx.fileUrl && (
                <button 
                  className="text-blue-400 hover:text-blue-300 p-1"
                  onClick={(e) => { e.stopPropagation(); handleOpenFile(tx.fileUrl); }}
                >
                  📎
                </button>
              )}
              <button
                className="text-gray-400 hover:text-blue-400 p-1 rounded-full hover:bg-gray-700"
                onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                aria-label="Edit transaction"
              >
                <IconEdit size={16} />
              </button>
              <button
                className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-700"
                onClick={(e) => { e.stopPropagation(); onDelete(tx); }}
                aria-label="Delete transaction"
              >
                <IconX size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredTxs.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No transactions
          </div>
        )}
      </div>
    </div>
  );
}
