import { FaWallet, FaMoneyBillWave } from 'react-icons/fa';
import { masterCategories } from './masterCategories.js';

const categoryKeywords = {};

function processCategory(category, keywords) {
  categoryKeywords[category] = keywords;
  // also add the category name as a keyword
  categoryKeywords[category].push(category.toLowerCase());
}

function traverse(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      processCategory(key, obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      traverse(obj[key]);
    }
  }
}

traverse(masterCategories);

export { categoryKeywords };

export const PIE_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#fbbf24', '#22d3ee', '#a3e635', '#f472b6', '#facc15', '#38bdf8', '#f87171', '#34d399', '#818cf8', '#fcd34d', '#fca5a5'
];

export const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ffbb28', '#0088fe', '#ff8042', '#a4de6c', '#d0ed57',
];

export const initialAccounts = [
  {
    id: '1',
    name: 'Personal',
    type: 'Personal',
    currency: 'USD',
    balance: 5000,
    description: 'Main personal account',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Business',
    type: 'Business',
    currency: 'USD',
    balance: 15000,
    description: 'Business operations account',
    createdAt: new Date().toISOString()
  }
];

export const incomeKeywords = ['income', 'got', 'received', 'sell', 'support'];

export const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const categoryIcons = {
  'Turemoney': FaWallet,
  'cash': FaMoneyBillWave,
};

export const mainCategoryGroups = {
  expense: [
    {
      label: 'Personal',
      categories: [
        'Food', 'Grocery', 'Rent', 'Utilities', 'Transportation', 'Motorbike petrol', 'Laundry', 'Tap Up', 'Gym', 'iCloud', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Family support', 'Insurance', 'Personal interest', 'Shipping cost', 'Other expense'
      ]
    },
    {
      label: 'Business',
      categories: [
        'Office Supplies', 'Software', 'Marketing', 'Travel', 'Utilities (Business)', 'Rent (Business)', 'Salaries (Business)', 'Consulting Fees', 'Business Meals', 'Transportation (Business)', 'Other Business Expense'
      ]
    },
    {
      label: 'Investment',
      categories: [
        'ETF', 'Stock', 'Global Stock', 'Bond', 'crypto'
      ]
    },
    {
      label: 'Saving & Goals',
      categories: [
        'Emergency Fund', 'Long-Term saving'
      ]
    },
    {
      label: 'Tax: Individual',
      categories: [
        'Personal income Tax', 'Withholding tax (individual)', 'Value Added Tax (individual)', 'Stamp Duty (individual)'
      ]
    },
    {
      label: 'Tax: Business',
      categories: [
        'Business income Tax', 'Business interest', 'Withholding tax (business)', 'Value Added Tax (business)', 'Stamp Duty (business)'
      ]
    },
    {
      label: 'Other / Special',
      categories: [
        'Dating', 'sex worker'
      ]
    }
  ],
  income: [
    {
      label: 'Personal',
      categories: [
        'Family support', 'Salary', 'Freelance', 'Interest', 'Dividends', 'Rental Income', 'Other income'
      ]
    },
    {
      label: 'Business',
      categories: [
        'Sales Revenue', 'Service Revenue', 'Investment Income (Business)', 'Other Business Income'
      ]
    },
    {
      label: 'Investment',
      categories: [
        'Investment Income (Personal)', 'Dividends (Investment)', 'Capital Gains'
      ]
    },
    {
      label: 'Other / Special',
      categories: [
        'Refunds', 'Grants', 'Inheritance', 'Lottery Winnings'
      ]
    }
  ]
};

export const subcategoriesMap = {
  // Personal Expenses
  'Food': ['Meal', 'Restaurants', 'Takeaway', 'Dining Out'],
  'Grocery': ['Fresh Produce', 'Pantry Staples', 'Snacks', 'Beverages', 'Beef', 'Chicken', 'Pork', 'Vegetables', 'Fruits', 'egg'],
  'Rent': ['Monthly Rent', 'Security Deposit', 'Utilities Included'],
  'Utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Gas Bill'],
  'Transportation': ['Fuel', 'Public Transport', 'Taxi/Ride-share', 'Car Maintenance'],
  'Tap Up': ['UTCC App', 'Turemoney Wallet'],
  'Motorbike petrol': ['Petrol', 'Motorbike Maintenance'],
  'Laundry': ['Self-service', 'Dry Cleaning', 'Laundry Service'],
  'Gym': ['Membership Fee', 'Personal Trainer', 'Sports Equipment'],
  'iCloud': ['Cloud Storage Subscription'],
  'Entertainment': ['Movies', 'Concerts', 'Streaming Services', 'Hobbies'],
  'Shopping': ['Clothing', 'Electronics', 'Home Goods', 'Books'],
  'Healthcare': ['Doctor Visit', 'Medication', 'Dental', 'Vision'],
  'Education': ['Tuition Fees', 'Books', 'Courses', 'Workshops'],
  'Family support': ['Mom', 'Allowance', 'Gifts', 'Medical Support'],
  'Insurance': ['Health Insurance', 'Car Insurance', 'Life Insurance'],
  'Personal interest': ['Bank Interest Paid', 'Loan Interest Paid'],
  'Shipping cost': ['Postage', 'Courier Fees'],
  'Other expense': ['Miscellaneous', 'Donations', 'Gifts'],

  // Business Expenses
  'Office Supplies': ['Stationery', 'Printer Ink', 'Paper'],
  'Software': ['Subscription Fees', 'Licenses'],
  'Marketing': ['Advertising', 'Promotions', 'Website Fees'],
  'Travel': ['Flights', 'Accommodation', 'Per Diem'],
  'Utilities (Business)': ['Electricity (Office)', 'Internet (Office)'],
  'Rent (Business)': ['Office Rent', 'Lease Payments'],
  'Salaries (Business)': ['Employee Wages', 'Contractor Payments'],
  'Consulting Fees': ['Legal Fees', 'Accounting Fees'],
  'Business Meals': ['Client Dinners', 'Team Lunches'],
  'Transportation (Business)': ['Business Travel', 'Fleet Maintenance'],
  'Other Business Expense': ['Miscellaneous Business Costs'],

  // Investment Expenses (if any, usually categorized as part of investment)
  'ETF': ['Management Fees', 'Trading Fees'],
  'Stock': ['Brokerage Fees', 'Trading Commissions'],
  'Global Stock': ['Foreign Exchange Fees'],
  'Bond': ['Bond Fees'],
  'crypto': ['Transaction Fees', 'Wallet Fees'],

  // Saving & Goals Expenses (if any, usually transfers)
  'Emergency Fund': ['Transfer to Savings'],
  'Long-Term saving': ['Transfer to Investment Account'],

  // Tax: Individual Expenses
  'Personal income Tax': ['Tax Payment', 'Tax Preparation Fees'],
  'Withholding tax (individual)': ['Tax Withheld'],
  'Value Added Tax (individual)': ['VAT Payment'],
  'Stamp Duty (individual)': ['Stamp Duty Payment'],

  // Tax: Business Expenses
  'Business income Tax': ['Corporate Tax Payment'],
  'Business interest': ['Interest on Business Loans'],
  'Withholding tax (business)': ['Business Tax Withheld'],
  'Value Added Tax (business)': ['Business VAT Payment'],
  'Stamp Duty (business)': ['Business Stamp Duty Payment'],

  // Other / Special Expenses
  'Dating': ['Dating App Subscription', 'Date Activities'],
  'sex worker': ['Service Fees'],
  'Other expense': ['Uncategorized Expenses'],

  // Income Categories
  'Salary': ['Monthly Salary', 'Bonus', 'Commission'],
  'Freelance': ['Client Payments', 'Project Fees'],
  'Interest': ['Bank Interest Received', 'Loan Interest Received'],
  'Dividends': ['Stock Dividends', 'Mutual Fund Dividends'],
  'Rental Income': ['Property Rent', 'Sublease Income'],
  'Other income': ['Gifts Received', 'Refunds', 'Side Hustle Income'],
  'Sales Revenue': ['Product Sales', 'Service Sales'],
  'Service Revenue': ['Consulting Services', 'Maintenance Services'],
  'Investment Income (Business)': ['Business Investment Returns'],
  'Other Business Income': ['Miscellaneous Business Revenue'],
  'Investment Income (Personal)': ['Stock Sales Profit', 'Crypto Gains'],
  'Dividends (Investment)': ['Reinvested Dividends'],
  'Capital Gains': ['Asset Sale Profit'],
  'Refunds': ['Product Returns', 'Tax Refunds'],
  'Grants': ['Educational Grants', 'Research Grants'],
  'Inheritance': ['Inherited Funds'],
  'Lottery Winnings': ['Lottery Payout'],
};