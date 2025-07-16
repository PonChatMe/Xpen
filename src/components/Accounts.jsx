import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaBuilding, FaPiggyBank, FaChartLine, FaCog, FaTimes, FaCheck } from 'react-icons/fa';

const accountTypes = [
  { value: 'Personal', label: 'Personal', icon: FaWallet, color: 'bg-blue-100 text-blue-800' },
  { value: 'Business', label: 'Business', icon: FaBuilding, color: 'bg-purple-100 text-purple-800' },
  { value: 'Savings', label: 'Savings', icon: FaPiggyBank, color: 'bg-green-100 text-green-800' },
  { value: 'Investment', label: 'Investment', icon: FaChartLine, color: 'bg-orange-100 text-orange-800' }
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'THB'];

const Accounts = ({ accounts, setAccounts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Personal',
    currency: 'USD',
    balance: '',
    description: ''
  });

  const handleAddAccount = () => {
    if (!newAccount.name.trim() || !newAccount.balance) return;
    
    const account = {
      id: Date.now().toString(),
      name: newAccount.name.trim(),
      type: newAccount.type,
      currency: newAccount.currency,
      balance: parseFloat(newAccount.balance),
      description: newAccount.description.trim(),
      createdAt: new Date().toISOString()
    };
    
    setAccounts(prev => [...prev, account]);
    setNewAccount({ name: '', type: 'Personal', currency: 'USD', balance: '', description: '' });
    setIsAdding(false);
  };

  const handleEditAccount = (id) => {
    const account = accounts.find(acc => acc.id === id);
    if (account) {
      setNewAccount({
        name: account.name,
        type: account.type,
        currency: account.currency,
        balance: account.balance.toString(),
        description: account.description || ''
      });
      setEditingId(id);
    }
  };

  const handleUpdateAccount = () => {
    if (!newAccount.name.trim() || !newAccount.balance) return;
    
    setAccounts(prev => prev.map(acc => 
      acc.id === editingId 
        ? {
            ...acc,
            name: newAccount.name.trim(),
            type: newAccount.type,
            currency: newAccount.currency,
            balance: parseFloat(newAccount.balance),
            description: newAccount.description.trim(),
            updatedAt: new Date().toISOString()
          }
        : acc
    ));
    
    setNewAccount({ name: '', type: 'Personal', currency: 'USD', balance: '', description: '' });
    setEditingId(null);
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    }
  };

  const handleCancel = () => {
    setNewAccount({ name: '', type: 'Personal', currency: 'USD', balance: '', description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const getAccountTypeInfo = (type) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  const formatBalance = (balance, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(balance);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Accounts</h2>
          <p className="text-gray-600">Manage your financial accounts</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" />
          Add Account
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="bg-white border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCog className="text-indigo-600" />
              {editingId ? 'Edit Account' : 'Add New Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name *
                </label>
                <Input
                  placeholder="e.g., Main Bank Account"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <Select value={newAccount.type} onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Select value={newAccount.currency} onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief description of this account"
                value={newAccount.description}
                onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <Button 
                onClick={editingId ? handleUpdateAccount : handleAddAccount}
                disabled={!newAccount.name.trim() || !newAccount.balance}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <FaCheck className="mr-2" />
                {editingId ? 'Update Account' : 'Add Account'}
              </Button>
              <Button onClick={handleCancel} className="bg-black text-white hover:bg-gray-800">
                <FaTimes className="mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const typeInfo = getAccountTypeInfo(account.type);
          const IconComponent = typeInfo.icon;
          
          return (
            <Card key={account.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4 space-y-4">
                {/* Card Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-800 text-lg">{account.name}</h3>
                      <Badge variant="outline" className={`${typeInfo.color} border-0`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      onClick={() => handleEditAccount(account.id)}
                      className="h-8 w-8 bg-gray-800 text-white rounded-md hover:bg-blue-700"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="h-8 w-8 bg-gray-800 text-white rounded-md hover:bg-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Card Body Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatBalance(account.balance, account.currency)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {account.description && (
                      <p className="text-gray-600">{account.description}</p>
                    )}
                    <p className="text-gray-400">
                      Created: {new Date(account.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && !isAdding && (
        <Card className="bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaWallet className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Get started by adding your first account to track your finances
            </p>
            <Button 
              onClick={() => setIsAdding(true)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Accounts; 