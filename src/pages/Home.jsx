import React, { useState, useMemo } from 'react';
import Header from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import WarningModal from '../components/common/WarningModal.jsx';
import { Select } from '@mantine/core';
import HorizontalCurrencyScroller from '../components/ui/HorizontalCurrencyScroller.jsx';
import QuickAdd from '../components/dashboard/QuickAdd.jsx';
import SummaryCards from '../components/dashboard/SummaryCards.jsx';
import RecentTransactions from '../components/dashboard/RecentTransactions.jsx';

const Home = () => {
  const { user, userProfile, transactions } = useAuth();
  const [isWarningModalOpen, setWarningModalOpen] = useState(false);

  const months = useMemo(() => {
    const uniqueMonths = new Set();
    transactions.forEach(tx => {
      if (tx.date) {
        const date = new Date(tx.date);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        uniqueMonths.add(`${month}-${year}`);
      }
    });

    const sortedMonths = Array.from(uniqueMonths).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);
      if (yearA !== yearB) return yearB - yearA; // Sort by year descending
      return monthB - monthA; // Then by month descending
    });

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return sortedMonths.map(monthYear => {
      const [month, year] = monthYear.split('-').map(Number);
      return {
        value: monthYear,
        label: `${monthNames[month - 1]} ${year}`
      };
    });
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (months.length > 0) {
      return months[0].value; // Default to the latest month with transactions
    } else {
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear().toString();
      return `${currentMonth}-${currentYear}`;
    }
  });

  const currencies = useMemo(() => [
    { value: 'THB', label: 'THB' },
    { value: 'USD', label: 'USD' },
    { value: 'AUD', label: 'AUD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'JPY', label: 'JPY' },
  ], []);

  const [selectedCurrency, setSelectedCurrency] = useState(userProfile?.defaultCurrency || 'THB');

  // Calculate totals for SummaryCards
  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expenses += tx.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses, netBalance: income + expenses };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-black relative">
      <main className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 2xl:max-w-full">
        <Header user={user} onShowWarningModal={() => setWarningModalOpen(true)} />

        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 mb-6">
          {/* Month Selection - 20% */}
          <div className="col-span-full md:col-span-2">
            <Select
              placeholder="Pick one"
              data={months}
              value={selectedMonth}
              onChange={setSelectedMonth}
              styles={{
                label: { color: '#FFFFFF', fontSize: '16px', fontWeight: '500', marginBottom: '8px' },
                input: {
                  backgroundColor: '#000000ff',
                  borderColor: '#4b5563',
                  color: '#FFFFFF',
                  height: '48px',
                  fontSize: '16px'
                },
                dropdown: { backgroundColor: '#b7b7b7ff', borderColor: '#4b5563' },
                item: { color: '#FFFFFF', '&[data-selected]': { backgroundColor: '#4b5563' } }
              }}
            />
          </div>

          {/* Currency Selection - 80% */}
          <div className="col-span-full md:col-span-8">
            <HorizontalCurrencyScroller
              currencies={currencies}
              selectedValue={selectedCurrency}
              onSelect={setSelectedCurrency}
              className="h-12"
            />
          </div>
        </div>

        {/* Content below the selections */}
        <div className="space-y-6">
          <QuickAdd selectedCurrency={selectedCurrency} />
          <SummaryCards 
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netBalance={netBalance}
          />
          <RecentTransactions />
        </div>

        <WarningModal
          isOpen={isWarningModalOpen}
          onClose={() => setWarningModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default Home;