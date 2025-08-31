import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { uploadForOCR } from '@/lib/ocr';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { db, getNetworkStatus } from './lib/firebase';
import { collection, doc, setDoc, getDocs, onSnapshot, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FaPiggyBank, FaFileUpload, FaChartPie, FaTable, FaSmile, FaChartBar, FaUser, FaWallet, FaPlus, FaListUl, FaSignOutAlt, FaUserCircle, FaPaperclip, FaFile, FaTimes, FaUpload, FaSpinner, FaMoon, FaSun, FaMoneyBillWave } from 'react-icons/fa';
import Accounts from '@/components/Accounts';
import CategoryManager from '@/components/CategoryManager';

const PIE_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', '#fbbf24', '#22d3ee', '#a3e635', '#f472b6', '#facc15', '#38bdf8', '#f87171', '#34d399', '#818cf8', '#fcd34d', '#fca5a5'
];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ffbb28', '#0088fe', '#ff8042', '#a4de6c', '#d0ed57',
];

const initialAccounts = [
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

// === Category List ===
// Personal Expenses
// Business Related
// Investment & Income
// Tax (Individual / Business Separated)
// Legal/Other

const categories = [
  // Personal
  'Food','Grocery', 'Rent', 'Gym', 'iCloud', 'Motorbike petrol', 'Laundry', 'Transportation', 'Entertainment', 'Healthcare', 'Healthcare employee', 'Shopping', 'Utilities', 'Education', 'Insurance', 'Personal interest', 'Shipping cost', 'Family support', 'Job', 'Dividend', 'Other income', 'Passive income',

  // Business & Job
  'Business', 'Business utility', 'Shipping cost', 'Business shipping cost', 'Bank loan', 'Business Bank loan', 'Job', 'Employee salary','Healthcare employee', 'Transportation fee employee',

  // Investment
  'ETF', 'Stock', 'Thai Stock', 'Global Stock', 'Bond', 'crypto', 'Investment',

  // Savings
  'Emergency Fund', 'Long-Term saving', 

  // Taxes - Individual
  'Individual tax', 'Personal income Tax', 'Personal interest', 'Withholding tax (individual)', 'Value Added Tax (individual)', 'Stamp Duty (individual)',

  // Taxes - Business
  'Business tax', 'Business income Tax', 'Business interest', 'Withholding tax (business)', 'Value Added Tax (business)', 'Stamp Duty (business)',

  // Other / Misc
  'Transportation fee employee', 'Dating', 'sex worker', 'Other expense', 'Other income',
  'Turemoney',
  'cash',
];

const incomeKeywords = ['income', 'got', 'received', 'sell', 'support'];

function getMonthName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return months[d.getMonth()];
}

// Add months array for getMonthName
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

// === Keywords for Automatic Categorization ===
const categoryKeywords = {
  // === Personal Related ===
  'Food': ['food', 'meal', 'eat out', 'pad thai', 'groceries', 'restaurant','Burger King', 'coffee', 'probiotic drink', 'baill pork rice', 'sushi', 'gill fish', 'thai noodle'],
  'Grocery': ['grocery', 'pork', 'banana','veggie','vegetable','vegetables', 'orange', 'garlic', 'tomatoes', 'veggies', 'chicken', 'beef', 'fish', 'milk', 'yogurt', 'cheese', 'butter', 'egg', 'chocolate', 'green tea', 'rice', 'noodle', 'bread', 'cake', 'cookie', 'chips', 'herb thai', 'thai herb', 'chinese herb','pineapple','fruit','watermelon','mango','coconut','pineapple','banana','orange','apple','pear','peach','plum','cherry','strawberry','blueberry','raspberry','blackberry','pineapple','watermelon','mango','coconut','pineapple','banana','orange','apple','pear','peach','plum','cherry','strawberry','blueberry','raspberry','blackberry'],
  'Rent': ['rent'],
  'Utilities': ['utilities', 'kitchen equipment', 'electric', 'water', 'internet', 'phone'],
  'Transportation': ['transportation', 'gas', 'bus', 'train', 'taxi', 'grab'],
  'Motorbike petrol': ['petrol', 'gasoline', 'bike', 'bike petrol'],
  'Laundry': ['laundry', 'dryer'],
  'Gym': ['gym', 'utcc app tapup', 'muaythai', 'jujitsu', 'fitness'],
  'iCloud': ['icloud'],
  'Entertainment': ['entertainment', 'movie', 'concert', 'game','hangout','hang out','Drink','drink'],
  'Shopping': ['shopping', 'clothes', 'electronics'],
  'Healthcare': ['healthcare', 'pill', 'medicine', 'doctor', 'pharmacy'],
  'Education': ['education', 'book', 'course'],
  'Insurance': ['insurance', 'life insurance', 'health insurance', 'car insurance', 'home insurance', 'travel insurance'],
  'Personal interest': ['interest income', 'bank interest', 'interest'],
  'Shipping cost': ['shipping', 'delivery', 'kerry', 'flash','bolt','Grab'],
  'Family support': ['mom', 'dad', 'family', 'brother', 'sister', 'parents'],
  'Job': ['part-time', 'salary', 'job', 'freelance'],
  'Dividend': ['dividend'],
  'Other income': ['other income'],
  'Passive income': ['passive income'],

  // === Business Related ===
  'Business': ['business', 'store', 'shop', 'client'],
  'Business utility': ['business utility', 'business electric', 'shop water', 'store internet', 'store phone'],
  'Employee salary': ['employee', 'salary', 'payroll','staff salary'],
  'Business shipping cost': ['business delivery', 'company shipping'],
  'Bank loan': ['loan', 'bank loan'],
  'Business Bank loan': ['business loan', 'store loan'],
  'Healthcare employee': ['medical staff', 'clinic staff', 'hospital payroll','healthcare staff','Pill staff'],
  'Transportation fee employee': ['employee transport', 'staff bus'],

  // === Investment 
  'ETF': ['etf'],
  'Stock': ['stock'],
  'Global Stock': ['us stock', 'global stock'],
  'Bond': ['bond'],
  'crypto': ['bitcoin', 'ethereum', 'solana', 'dogecoin', 'shiba inu', 'ripple'],

  // === Savings & Goals ===
  'Emergency Fund': ['emergency'],
  'Long-Term saving': ['long term', 'future saving'],

  // === Tax: Individual ===
  'Personal income Tax': ['personal income tax', 'PIT','personal income','individual tax'],
  'Withholding tax (individual)': ['withholding tax', 'WHT','withholding'],
  'Value Added Tax (individual)': ['VAT', 'value added tax','vat'],
  'Stamp Duty (individual)': ['stamp duty','stamp'],

  // === Tax: Business ===
  'Business tax': ['business tax', 'company tax', 'corporate tax','store tax','shop tax','business tax'],
  'Business income Tax': ['business income tax', 'BIT','business income'],
  'Business interest': ['business interest','business interest income'],
  'Withholding tax (business)': ['withholding tax', 'WHT','withholding','shop withholding','company withholding','store withholding','business withholding'],
  'Value Added Tax (business)': ['VAT', 'value added tax','vat','shop vat','company vat','store vat','business vat'],
  'Stamp Duty (business)': ['stamp duty','stamp'],

  // === Other / Special ===
  'Dating': ['dating', 'date'],
  'sex worker': ['escort', 'red light', 'sex worker'],
  'Other expense': ['other expense']
};

// Helper to get user-scoped Firestore refs
const getUserAccountsRef = (userId) => collection(db, 'users', userId, 'accounts');
const getUserTransactionsRef = (userId) => collection(db, 'users', userId, 'transactions');

// Helper to format large numbers as short notation (custom rule: >= 100,000 use short, else full amount)
function formatShortNumber(value) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 100_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Helper: check if a category or its keywords are business-related
function isBusinessCategory(category, customCategories) {
  const businessTerms = ["company", "store", "shop", "shop name", "business"];
  const lowerCat = category.toLowerCase();
  // Check category name
  if (businessTerms.some(term => lowerCat.includes(term))) return true;
  // Check custom category keywords
  const customCat = customCategories.find(cat => cat.name === category);
  if (customCat && customCat.keywords) {
    return customCat.keywords.some(kw => businessTerms.some(term => kw.toLowerCase().includes(term)));
  }
  return false;
}

const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  return { open, setOpen, ref };
};

// [Add after imports, before any component definitions]
function formatCurrency(value) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Add a mapping for category icons
const categoryIcons = {
  'Turemoney': FaWallet,
  'cash': FaMoneyBillWave,
  // Add more custom icons for other categories if needed
};

// Add debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Add a helper to get the current 'Other Account' category name from customCategories
function getOtherAccountCategory(customCategories) {
  return customCategories.find(cat => cat.isOtherAccount);
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || null);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickCategory, setQuickCategory] = useState('Food');
  const [quickAmount, setQuickAmount] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [statementFile, setStatementFile] = useState(null);
  const [isDraggingStatement, setIsDraggingStatement] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [editingTxId, setEditingTxId] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', category: '', date: '', time: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editFeedback, setEditFeedback] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 250);
  const [sCurveRange, setSCurveRange] = useState(1);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for persisted mode
    return localStorage.getItem('xpen-dark-mode') === 'true';
  });
  const [catDropdownActiveIdx, setCatDropdownActiveIdx] = useState(-1);
  const catDropdownRef = useRef();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('xpen-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('xpen-dark-mode', 'false');
    }
  }, [darkMode]);

  // Helper function to get selected account name
  const getSelectedAccountName = () => {
    const account = accounts.find(acc => acc.id === selectedAccount);
    return account ? account.name : 'All Accounts';
  };

  // 1. Load accounts and summary from Firestore on login
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Listen for real-time updates to accounts
    const unsubAccounts = onSnapshot(getUserAccountsRef(user.uid), (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accs.length ? accs : initialAccounts);
    });
    // Listen for real-time updates to transactions
    const unsubTxs = onSnapshot(getUserTransactionsRef(user.uid), (snapshot) => {
      // Group transactions by month for summary
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const grouped = {};
      txs.forEach(tx => {
        const month = getMonthName(tx.date);
        if (!grouped[month]) grouped[month] = [];
        grouped[month].push(tx);
      });
      setSummary(grouped);
      setLoading(false);
    });
    // Listen for real-time updates to custom categories
    const unsubCategories = onSnapshot(collection(db, 'users', user.uid, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomCategories(cats);
    });
    return () => {
      unsubAccounts();
      unsubTxs();
      unsubCategories();
    };
  }, [user]);

  // 2. Save accounts to Firestore whenever they change (except on initial load)
  useEffect(() => {
    if (!user) return;
    accounts.forEach(async (acc) => {
      if (!acc.id) return;
      await setDoc(doc(db, 'users', user.uid, 'accounts', acc.id), acc);
    });
  }, [accounts, user]);

  // 3. Save summary (transactions) to Firestore whenever it changes (except on initial load)
  useEffect(() => {
    if (!user || !summary) return;
    // Flatten summary to transactions
    const txs = Object.values(summary).flat();
    txs.forEach(async (tx) => {
      if (!tx.id) {
        // New transaction, add to Firestore
        await addDoc(collection(db, 'users', user.uid, 'transactions'), tx);
      } else {
        // Existing transaction, update
        await setDoc(doc(db, 'users', user.uid, 'transactions', tx.id), tx);
      }
    });
  }, [summary, user]);

  // Flatten all transactions
  const allTxs = useMemo(() => {
    if (!summary) return [];
    return Object.values(summary).flat();
  }, [summary]);

  // Helper to get month and year string
  function getMonthYearStr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Compute unique month-year pairs from all transactions
  const availableMonthYears = useMemo(() => {
    const set = new Set();
    allTxs.forEach(tx => {
      if (tx.date) {
        set.add(getMonthYearStr(tx.date));
      }
    });
    // Sort chronologically
    return Array.from(set).sort((a, b) => {
      const [ma, ya] = a.split(' ');
      const [mb, yb] = b.split(' ');
      const dateA = new Date(`${ma} 1, ${ya}`);
      const dateB = new Date(`${mb} 1, ${yb}`);
      return dateA - dateB;
    });
  }, [allTxs]);

  // Selected month-year state
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => getMonthYearStr(new Date().toISOString()));

  // Update selectedMonthYear if availableMonthYears changes and current selection is not present
  useEffect(() => {
    if (!availableMonthYears.includes(selectedMonthYear) && availableMonthYears.length > 0) {
      setSelectedMonthYear(availableMonthYears[availableMonthYears.length - 1]);
    }
  }, [availableMonthYears, selectedMonthYear]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Filtered transactions by account and month-year
  const filteredTxs = useMemo(() => {
    if (!allTxs) return [];
    return allTxs.filter(tx => {
      const monthYear = getMonthYearStr(tx.date);
      const accountMatch = !tx.account || tx.account === selectedAccount;
      const monthMatch = selectedMonthYear === monthYear;
      return monthMatch && accountMatch;
    });
  }, [allTxs, selectedAccount, selectedMonthYear]);

  // --- Cumulative Net Balance Logic ---
  // Helper function to check if a category is excluded from summary
  const isExcludedCategory = (cat) => {
    const otherCat = getOtherAccountCategory(customCategories);
    return cat === 'cash' || cat === 'Turemoney' || (otherCat && cat === otherCat.name);
  };
  // Map of monthYear => { income, expenses, net, cumulativeNet }
  const monthlyBalances = useMemo(() => {
    const map = {};
    allTxs.forEach(tx => {
      if (isExcludedCategory(tx.category)) return; // Exclude cash and Turemoney
      const monthYear = getMonthYearStr(tx.date);
      if (!map[monthYear]) map[monthYear] = { income: 0, expenses: 0, net: 0 };
      if (tx.amount > 0) {
        map[monthYear].income += tx.amount;
      } else {
        map[monthYear].expenses += Math.abs(tx.amount);
      }
      map[monthYear].net += tx.amount;
    });
    // Compute cumulative net
    let cumulative = 0;
    const sortedMonths = availableMonthYears;
    const result = {};
    sortedMonths.forEach(monthYear => {
      const { income = 0, expenses = 0, net = 0 } = map[monthYear] || {};
      cumulative += net;
      result[monthYear] = { income, expenses, net, cumulativeNet: cumulative };
    });
    return result;
  }, [allTxs, availableMonthYears]);

  // Use cumulative net for selected month
  const selectedMonthStats = monthlyBalances[selectedMonthYear] || { income: 0, expenses: 0, net: 0, cumulativeNet: 0 };
  const totalIncome = selectedMonthStats.income;
  const totalExpenses = selectedMonthStats.expenses;
  const netBalance = selectedMonthStats.cumulativeNet;

  // Monthly trends (sum by month)
  const monthlyTrends = useMemo(() => {
    const map = {};
    allTxs.forEach(tx => {
      const monthName = getMonthName(tx.date);
      if (!map[monthName]) map[monthName] = { income: 0, expense: 0 };
      if (tx.amount > 0) {
        map[monthName].income += tx.amount;
      } else {
        map[monthName].expense += Math.abs(tx.amount);
      }
    });
    return months.map(month => ({ 
      month, 
      Income: map[month]?.income || 0,
      Expense: map[month]?.expense || 0
    }));
  }, [allTxs]);

  // Business categories
  const businessCategories = [
    'Healthcare employee',
    'Employee salary',
    'Transportation fee employee',
    'Business',
    'Business utility',
    'Business tax',
    'Business tax withholding',
    'Business shipping cost',
    'Business interest',
    'Business Bank loan'
  ];

  // Investment categories
  const investmentCategories = ['ETF', 'Stock', 'Global Stock', 'crypto', 'Bond'];

 // Main categories and their subcategories
 const mainCategoryGroups = [
  {
    label: 'Personal',
    subcategories: [
      'Food', 'Grocery', 'Rent', 'Utilities', 'Transportation', 'Motorbike petrol', 'Laundry', 'Gym', 'iCloud', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Family support', 'Insurance', 'Personal interest', 'Shipping cost','family support','Job','Dividend','Other income','Passive income'
    ]
  },
  {
    label: 'Business ',
    subcategories: [
      'Business', 'Business utility', 'Employee salary', 'Business shipping cost', 'Bank loan', 'Healthcare employee', 'Transportation fee employee'
    ]
  },
  {
    label: 'Investment',
    subcategories: [
      'ETF', 'Stock', 'Global Stock', 'Bond', 'crypto'
    ]
  },
  {
    label: 'Saving & Goals',
    subcategories: [
      'Emergency Fund', 'Long-Term saving'
    ]
  },
  {
    label: 'Tax: Individual',
    subcategories: [
      'Personal income Tax', 'Personal interest', 'Withholding tax (individual)', 'Value Added Tax (individual)', 'Stamp Duty (individual)'
    ]
  },
  {
    label: 'Tax: Business',
    subcategories: [
      'Business income Tax', 'Business interest', 'Withholding tax (business)', 'Value Added Tax (business)', 'Stamp Duty (business)'
    ]
  },
  {
    label: 'Other / Special',
    subcategories: [
      'Dating', 'sex worker', 'Other expense', 'Other income'
    ]
  }
];

  // Expense Breakdown
  const allowedExpenseCats = getGroupSubcategories(['Personal', 'Other / Special'], mainCategoryGroups, customCategories);
  const categoryData = useMemo(() => {
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount < 0 && allowedExpenseCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Update incomeByCategory (Daily Income)
  const allowedIncomeCats = getGroupSubcategories(['Personal', 'Other / Special', 'Tax: Individual', 'Investment & Income', 'Investment', 'Saving & Goals'], mainCategoryGroups, customCategories);
  const incomeByCategory = useMemo(() => {
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount > 0 && allowedIncomeCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // [Update Investment, Emergency, Personal Tax, and Business Tax pie chart data logic:]

  // Investment (expenses only)
  const investmentData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Investment & Income', 'Investment'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount < 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Emergency (expenses only)
  const emergencyData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Saving & Goals'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount < 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Personal Tax (expenses only)
  const taxData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Tax: Individual'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount < 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Business Tax (expenses only)
  const businessTaxData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Tax: Business'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.forEach(tx => {
      if (tx.amount < 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Add income from these categories to the correct income chart
  // (Daily Income: Investment, Emergency, Personal Tax; Business Income: Business Tax)
  // Already handled by the allowedCats logic in dailyIncomeData and businessIncomeData above, since those use all relevant group labels.

  // Business Breakdown
  const businessData = useMemo(() => {
    const map = {};
    filteredTxs.forEach(tx => {
      if (!tx.category) return;
      // Exclude business tax categories from business income
      if (
        tx.amount > 0 &&
        businessCategories.includes(tx.category) &&
        tx.category !== 'Business tax' &&
        tx.category !== 'Business tax withholding'
      ) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  const transactionsByDay = useMemo(() => {
    if(!selectedMonth) return [];
    const year = new Date().getFullYear(); 
    const monthIndex = months.indexOf(selectedMonth);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const map = {};
    filteredTxs.forEach(tx => {
      const day = new Date(tx.date).getDate();
      if (!map[day]) map[day] = 0;
      map[day] += Math.abs(tx.amount);
    });
    return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      value: map[i + 1] || 0
    }));
  }, [filteredTxs, selectedMonth]);

 

  // All subcategories (unique, sorted) - including custom categories
  const allSubcategories = useMemo(() => {
    const defaultCategories = Array.from(new Set(mainCategoryGroups.flatMap(g => g.subcategories)));
    const customCategoryNames = customCategories.map(cat => cat.name);
    return Array.from(new Set([...defaultCategories, ...customCategoryNames])).sort();
  }, [customCategories]);

  // In the Dashboard component, after allSubcategories is defined:
  const allSubcategoriesWithSpecials = useMemo(() => {
    // Ensure 'cash' and 'Turemoney' are always present and at the end of the list (or you can put them at the top if you prefer)
    const set = new Set([...allSubcategories]);
    set.delete('cash');
    set.delete('Turemoney');
    return [...set, 'cash', 'Turemoney'];
  }, [allSubcategories]);

  // Filtered transactions by category
  const categorizedTxs = useMemo(() => {
    if (selectedCategoryFilter === 'All') return filteredTxs;
    // If main category selected
    const mainGroup = mainCategoryGroups.find(g => g.label === selectedCategoryFilter);
    if (mainGroup) {
      return filteredTxs.filter(tx => mainGroup.subcategories.includes(tx.category));
    }
    // Otherwise, filter by subcategory
    return filteredTxs.filter(tx => tx.category === selectedCategoryFilter);
  }, [filteredTxs, selectedCategoryFilter]);



  // Update sCurveData to use selected range
  const sCurveData = useMemo(() => {
    const now = new Date();
    const startYear = now.getFullYear() - (sCurveRange - 1); // e.g., 10 years = now - 9
    const monthlyTotals = {};
    allTxs.forEach(tx => {
      if (!tx.date) return;
      const d = new Date(tx.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      if (year < startYear || year > now.getFullYear()) return;
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      if (!monthlyTotals[key]) monthlyTotals[key] = 0;
      monthlyTotals[key] += tx.amount;
    });
    // Sort keys and calculate cumulative sum
    const sortedKeys = Object.keys(monthlyTotals).sort();
    let cumulative = 0;
    return sortedKeys.map(key => {
      cumulative += monthlyTotals[key];
      return { month: key, value: cumulative };
    });
  }, [allTxs, sCurveRange]);

  // Unique categories from all transactions
  const allCategories = useMemo(() => {
    const set = new Set();
    allTxs.forEach(tx => {
      if (tx.category) set.add(tx.category);
    });
    return Array.from(set).sort();
  }, [allTxs]);

  // Compute unique months from all transactions
  const availableMonths = useMemo(() => {
    const set = new Set();
    allTxs.forEach(tx => {
      if (tx.date) {
        set.add(getMonthName(tx.date));
      }
    });
    return Array.from(set);
  }, [allTxs]);

  const handleFile = (file) => {
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      console.log("File attached:", file.name);
      setAttachedFile(file);
    } else {
      setFeedback({ type: 'error', message: 'Please select a valid image or PDF file.' });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleOpenFile = (file) => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Clean up the object URL after it's been used
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const parseNaturalLanguageInput = (text) => {
    const lowerText = text.toLowerCase();
    // 1. Extract amount
    const amountMatch = lowerText.match(/(\d+(\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    if (!amount) {
      return { error: "Could not find an amount in the text." };
    }
    // 2. Determine type (income/expense)
    const isIncome = incomeKeywords.some(keyword => lowerText.includes(keyword));
    const type = isIncome ? 'income' : 'expense';
    // 3. Extract description
    let description = text.replace(amountMatch[0], '');
    const keywordsToRemove = ['baht', 'thb', '$', 'usd', 'expen', ...incomeKeywords];
    keywordsToRemove.forEach(k => {
      description = description.replace(new RegExp(`\\b${k}\\b`, 'ig'), '');
    });
    description = description.replace(/\(|\)/g, '').trim();
    description = description.charAt(0).toUpperCase() + description.slice(1);

    // 4. Special logic for cash/Turemoney/Tapup
    let bestCategory = null;
    let excludeFromSummary = false;
    const descTrim = description.trim();
    if (/tapup/i.test(descTrim.split(' ')[0])) {
      // Starts with Tapup: include in summary, use normal category logic
    } else if (/cash$/i.test(descTrim) || /turemoney$/i.test(descTrim)) {
      // Ends with cash or Turemoney: set category, exclude from summary
      if (/cash$/i.test(descTrim)) bestCategory = 'cash';
      if (/turemoney$/i.test(descTrim)) bestCategory = 'Turemoney';
      excludeFromSummary = true;
    }

    // First check custom categories (user-defined)
    if (!bestCategory) {
      let bestMatchLength = 0;
    for (const customCat of customCategories) {
      for (const keyword of customCat.keywords) {
        if (lowerText.includes(keyword.toLowerCase()) && keyword.length > bestMatchLength) {
          bestMatchLength = keyword.length;
          bestCategory = customCat.name;
        }
      }
    }
    // Then check default categories if no custom category matched
    if (!bestCategory) {
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        for (const keyword of keywords) {
          if (lowerText.includes(keyword) && keyword.length > bestMatchLength) {
            bestMatchLength = keyword.length;
            bestCategory = category;
          }
        }
      }
    }
    }
    if (!bestCategory) {
       bestCategory = isIncome ? 'Other income' : 'Other expense';
    }
    return {
      amount: isIncome ? amount : -amount,
      category: bestCategory,
      date: new Date().toISOString(),
      description: description || bestCategory,
      excludeFromSummary,
    };
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const newTransaction = parseNaturalLanguageInput(chatInput);

    if (newTransaction.error) {
      setFeedback({ type: 'error', message: newTransaction.error });
      return;
    }

    newTransaction.account = selectedAccount;

    if (attachedFile) {
      newTransaction.file = attachedFile;
    }

    const monthName = getMonthName(newTransaction.date);

    setSummary(prevSummary => {
      const newSummary = { ...prevSummary };
      const currentMonthTxs = newSummary[monthName] ? [...newSummary[monthName]] : [];
      newSummary[monthName] = [newTransaction, ...currentMonthTxs];
      return newSummary;
    });
    
    setSelectedMonth(monthName);
    setFeedback({ type: 'success', message: `Added: ${newTransaction.description} (${newTransaction.category})` });
    setChatInput('');
    setAttachedFile(null);
  };

  const handleAddTransaction = (type) => {
      setFeedback({ type: '', message: '' });
      if (!quickCategory || !quickAmount || isNaN(Number(quickAmount))) {
        setFeedback({ type: 'error', message: 'Please select a category and enter a valid amount.' });
        return;
      }
      // Simulate success (replace with real API call)
      setFeedback({ type: 'success', message: `${type === 'expense' ? 'Expense' : 'Income'} added successfully!` });
      setQuickAmount('');
    };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStatementDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStatement(true);
  };

  const handleStatementDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleStatementDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStatement(false);
  };

  const handleStatementFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setStatementFile(file);
    } else {
      console.error("Only PDF files are accepted for statements.");
      // You might want to show a user-facing error here
      setStatementFile(null);
    }
  }

  const handleStatementDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStatement(false);
    const file = e.dataTransfer.files[0];
    handleStatementFile(file);
  };

  const handleStatementFileSelect = (e) => {
    const file = e.target.files[0];
    handleStatementFile(file);
  };

  const parseStatement = (text) => {
    const newTransactions = [];
    const lines = text.split('\n');
    let currentMonthYear = null;
    let currentDate = null;
    const monthYearRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i;
    const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
    // Match: description (optional), amount (with or without $), baht (optional), and any trailing text
    const txLineRegex = /^\*?\s*([^\d\n]+)?\s*([\$฿]?[\d,]+(?:\.\d{1,2})?)\s*(baht)?(.*)$/i;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      // Detect month/year header
      if (monthYearRegex.test(line)) {
        currentMonthYear = line;
        console.log(`[PDF Parser] Found month/year header:`, currentMonthYear);
        continue;
      }
      // Detect date line
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        let [_, month, day, year] = dateMatch;
        if (year.length === 2) year = '20' + year; // handle 2-digit years
        if (currentMonthYear) {
          const [headerMonth, headerYear] = currentMonthYear.split(' ');
          month = headerMonth;
          year = headerYear;
        }
        currentDate = new Date(`${month} ${day}, ${year}`).toISOString();
        console.log(`[PDF Parser] Found date:`, currentDate);
        continue;
      }
      // Detect transaction line
      const txMatch = line.match(txLineRegex);
      if (txMatch && currentDate) {
        let [, desc, amt, baht, trailing] = txMatch;
        desc = desc ? desc.trim() : '';
        amt = amt.replace(/[$,฿]/g, '');
        let amount = parseFloat(amt);
        if (isNaN(amount)) {
          console.log(`[PDF Parser] Skipped line (invalid amount):`, line);
          continue;
        }
        // If 'baht' is present or no currency, treat as expense (negative)
        if (baht || !line.includes('$')) amount = -Math.abs(amount);
        // If trailing text contains 'income' or 'from', treat as income
        if (/income|from/i.test(desc + ' ' + trailing)) amount = Math.abs(amount);
        // Use parseNaturalLanguageInput for category/description logic
        const parsedData = parseNaturalLanguageInput(`${desc} ${Math.abs(amount)}`);
        if (parsedData && !parsedData.error) {
          const tx = {
            ...parsedData,
            amount,
            date: currentDate,
            account: selectedAccount,
          };
          newTransactions.push(tx);
          console.log(`[PDF Parser] Parsed transaction:`, tx);
        } else {
          console.log(`[PDF Parser] Skipped line (parse error):`, line);
        }
      } else {
        console.log(`[PDF Parser] Skipped line (no match or no date):`, line);
      }
    }
    console.log(`[PDF Parser] Total transactions parsed:`, newTransactions.length);
    return newTransactions;
  };

  const handleProcessStatement = async () => {
    if (!statementFile) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await statementFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + '\n';
      }

      const transactionsToAdd = parseStatement(fullText);
      
      if (transactionsToAdd.length > 0) {
        setSummary(prevSummary => {
          const newSummary = { ...prevSummary };
          transactionsToAdd.forEach(tx => {
            const monthName = getMonthName(tx.date);
            if (!newSummary[monthName]) {
              newSummary[monthName] = [];
            }
            newSummary[monthName].unshift(tx);
          });
          return newSummary;
        });
        
        const lastTxMonth = getMonthName(transactionsToAdd[transactionsToAdd.length - 1].date);
        setSelectedMonth(lastTxMonth);
        setFeedback({ type: 'success', message: `Successfully imported ${transactionsToAdd.length} transactions.` });
      } else {
        setFeedback({ type: 'error', message: 'Could not find any transactions in the PDF.' });
      }

      setStatementFile(null);
    } catch (error) {
      console.error("Error processing PDF:", error);
      setFeedback({ type: 'error', message: 'Failed to process PDF.' });
    }
    setIsProcessing(false);
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') {
      return 'N/A';
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => {
    const auth = getAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {});
    }
  }, []);

  // Handler to start editing
  const handleEditTx = (tx) => {
    setEditingTxId(tx.id);
    setEditingTx(tx);
    // Convert ISO date string to YYYY-MM-DD format for the date input
    const dateForInput = tx.date ? new Date(tx.date).toISOString().split('T')[0] : '';
    // Extract time part (HH:MM) from local time
    const timeForInput = tx.date ? new Date(tx.date).toLocaleTimeString('en-CA', { hour12: false }).substring(0, 5) : '';
    setEditForm({
      amount: Math.abs(tx.amount),
      description: tx.description || '',
      category: tx.category || '',
      date: dateForInput,
      time: timeForInput,
    });
  };

  // Handler to save edit
  const handleSaveEditTx = async () => {
    setEditLoading(true);
    setEditFeedback('');
    try {
      if (!editingTx) {
        throw new Error('Transaction not found');
      }

      // Combine date and time into ISO string format
      let dateISO = editingTx.date; // fallback to original date
      if (editForm.date) {
        const timeString = editForm.time || '00:00';
        const dateTimeString = `${editForm.date}T${timeString}:00`;
        dateISO = new Date(dateTimeString).toISOString();
      }
      
      const updatedTx = {
        ...editingTx,
        amount: editingTx.amount > 0 ? Number(editForm.amount) : -Number(editForm.amount),
        description: editForm.description,
        category: editForm.category,
        date: dateISO,
      };
      
      // Try to save to Firestore
      try {
        await setDoc(doc(db, 'users', user.uid, 'transactions', editingTx.id), updatedTx);
        setEditFeedback('Saved successfully!');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // If Firestore fails, still close the modal but show a warning
        setEditFeedback('Saved locally (offline mode)');
      }
      
      // Always close the modal after a short delay to show the feedback
      setTimeout(() => {
      setEditingTxId(null);
        setEditingTx(null);
        setEditFeedback('');
      }, 1500);
      
    } catch (err) {
      console.error('Edit transaction error:', err);
      setEditFeedback('Error saving. Please try again.');
      // Still close the modal after showing error
      setTimeout(() => {
        setEditingTxId(null);
        setEditingTx(null);
        setEditFeedback('');
      }, 2000);
    } finally {
      setEditLoading(false);
    }
  };

  // Handler to cancel edit
  const handleCancelEditTx = () => {
    setEditingTxId(null);
    setEditingTx(null);
  };

  // Handler to delete
  const handleDeleteTx = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', tx.id));
  };

  // Sort transactions by date descending
  function sortByDateDesc(txs) {
    return [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Daily Income: Personal, Other / Special, plus income from Tax: Individual, Investment, Emergency, Personal Tax
  const dailyIncomeData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Personal', 'Other / Special', 'Tax: Individual', 'Investment & Income', 'Investment', 'Saving & Goals'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.filter(tx => !tx.excludeFromSummary).forEach(tx => {
      if (tx.amount > 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Daily Expense: Personal, Other / Special
  const dailyExpenseData = useMemo(() => {
    const allowedCats = getGroupSubcategories(['Personal', 'Other / Special'], mainCategoryGroups, customCategories);
    const map = {};
    filteredTxs.filter(tx => !tx.excludeFromSummary).forEach(tx => {
      if (tx.amount < 0 && allowedCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Business Income: Business, plus income from Tax: Business
  const allowedBusinessIncomeCats = getGroupSubcategories(['Business', 'Tax: Business'], mainCategoryGroups, customCategories);
  const businessIncomeData = useMemo(() => {
    const map = {};
    filteredTxs.filter(tx => !tx.excludeFromSummary).forEach(tx => {
      if (tx.amount > 0 && allowedBusinessIncomeCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // Business Expense: Business
  const allowedBusinessExpenseCats = getGroupSubcategories(['Business'], mainCategoryGroups, customCategories);
  const businessExpenseData = useMemo(() => {
    const map = {};
    filteredTxs.filter(tx => !tx.excludeFromSummary).forEach(tx => {
      if (tx.amount < 0 && allowedBusinessExpenseCats.includes(tx.category)) {
        if (!map[tx.category]) map[tx.category] = 0;
        map[tx.category] += Math.abs(tx.amount);
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredTxs, mainCategoryGroups, customCategories]);

  // In the Dashboard component, before the return statement:
  // Build a list of all categories (default, custom, special) for the edit modal
  const allEditCategories = useMemo(() => {
    // Get all default categories from mainCategoryGroups
    const defaultCategories = Array.from(new Set(mainCategoryGroups.flatMap(g => g.subcategories)));
    // Get all custom categories (including special)
    const customCategoryNames = customCategories.map(cat => cat.name);
    // Merge and deduplicate
    return Array.from(new Set([...defaultCategories, ...customCategoryNames])).sort();
  }, [mainCategoryGroups, customCategories]);

  const [editCategorySearch, setEditCategorySearch] = useState("");
  const filteredEditCategories = useMemo(() => {
    if (!editCategorySearch.trim()) return allEditCategories;
    return allEditCategories.filter(cat => cat.toLowerCase().includes(editCategorySearch.toLowerCase()));
  }, [allEditCategories, editCategorySearch]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      <div id="recaptcha-container"></div>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Dark mode toggle button */}
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="mr-2 p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <FaMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <FaPiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              Xpen
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Network Status Indicator */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></div>
                  <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
                <img
                  src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">{user.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="p-2 bg-transparent dark:bg-transparent">
                  <FaSignOutAlt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400" />
                </Button>
              </div>
            ) : (
              <Button className="bg-indigo-600 text-white dark:bg-indigo-800 dark:text-gray-100">Sign In</Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Offline Notification */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-800">
                You're currently offline. Changes will be saved locally and synced when you're back online.
              </span>
            </div>
          </div>
        )}
        
        {/* Filters and Quick Add */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Select value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 text-black dark:text-gray-100 border-gray-200 dark:border-gray-700 h-10 sm:h-9 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors" >
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonthYears.length === 0 ? (
                    <SelectItem value={getMonthYearStr(new Date().toISOString())}>{getMonthYearStr(new Date().toISOString())}</SelectItem>
                  ) : (
                    availableMonthYears.map(monthYear => <SelectItem key={monthYear} value={monthYear}>{monthYear}</SelectItem>)
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: Quick Add & Recent Txs */}
          <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
            
            {/* Quick Add Form */}
            <Card 
              className={`bg-white dark:bg-gray-900 transition-all duration-200 ${isDragging ? 'border-2 border-dashed border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border dark:border-gray-700'}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ marginBottom: '1rem' }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Quick Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                  {feedback.message && (
                    <div className={`p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                      {feedback.message}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-grow">
                      <Input 
                        type="text" 
                        placeholder="e.g., Pad Thai 100 baht" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleChatSubmit();
                          }
                        }}
                        className="w-full rounded-lg border-2 border-blue-200 dark:border-blue-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 pr-10 h-10 sm:h-9 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <Button as="label" htmlFor="attach-file" variant="ghost" size="icon" className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                        <FaPaperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
                      </Button>
                      <input id="attach-file" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
                    </div>
                    <Button 
                      onClick={handleChatSubmit} 
                      className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-900 rounded-lg px-4 sm:px-6 py-2 h-10 sm:h-9"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {attachedFile && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <FaFile className="text-gray-400 dark:text-gray-500" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{attachedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setAttachedFile(null)} className="h-6 w-6">
                        <FaTimes className="h-4 w-4 text-red-500 dark:text-red-400" />
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-white dark:bg-gray-900 flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 sm:space-y-3">
                  {sortByDateDesc(filteredTxs).slice(0, 5).map((tx, i) => (
                    <li 
                      key={i} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-lg p-3 transition-colors ${tx.file ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
                      onClick={() => handleOpenFile(tx.file)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm sm:text-base lg:text-lg truncate max-w-[80vw] sm:max-w-xs dark:text-gray-100">{tx.description || tx.category}</p>
                          {tx.file && <FaPaperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>{tx.category}</span>
                           <span>•</span>
                          <span className="truncate">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-sm sm:text-base lg:text-lg mt-2 sm:mt-0 sm:ml-4 ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'} overflow-x-auto`}>{tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </div>

          {/* Right: Charts & Data */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <Tabs defaultValue="overview">
              <TabsList className="w-full h-12 sm:h-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
                <TabsTrigger value="overview" className="flex-1 text-sm sm:text-base px-3 sm:px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 dark:data-[state=active]:text-white transition-colors">Overview</TabsTrigger>
                <TabsTrigger value="all_transactions" className="flex-1 text-sm sm:text-base px-3 sm:px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-500 dark:data-[state=active]:text-white transition-colors">All Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                {/* First row: 3 summary boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 w-full">
                  {/* Total Income */}
                  <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800 shadow-md border-0 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                        <span className="text-base sm:text-lg md:text-xl">Total Income</span>
                      </CardTitle>
                      <span className="text-green-500 dark:text-green-400 text-base sm:text-lg md:text-xl">▲</span>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="relative flex items-center min-h-[3rem] sm:min-h-[3.5rem]"
                        onMouseEnter={() => setHoveredCard('income')}
                        onMouseLeave={() => setHoveredCard(null)}
                        onTouchStart={() => setHoveredCard('income')}
                        onTouchEnd={() => setHoveredCard(null)}
                      >
                        <span className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 truncate cursor-pointer select-none">
                          ${formatShortNumber(totalIncome)}
                        </span>
                        {hoveredCard === 'income' && (
                          <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded px-4 py-2 text-lg font-semibold text-green-700 dark:text-green-400 whitespace-nowrap pointer-events-none">
                            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">from {filteredTxs.filter(tx => tx.amount > 0).length} transactions</p>
                      {/* [For each relevant pie chart card, add the following after the Total/Net Amount lines:] */}
                      {/* Example for Daily Income (yearly reset): */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount > 0 && allowedIncomeCats.includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + tx.amount, 0);
                          return (
                            <span className={`font-bold text-gray-400 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-400' : 'text-red-300'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Total Expenses */}
                  <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 shadow-md border-0 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                        <span className="text-base sm:text-lg md:text-xl">Total Expenses</span>
                      </CardTitle>
                      <span className="text-red-500 dark:text-red-400 text-base sm:text-lg md:text-xl">▼</span>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="relative flex items-center min-h-[3rem] sm:min-h-[3.5rem]"
                        onMouseEnter={() => setHoveredCard('expense')}
                        onMouseLeave={() => setHoveredCard(null)}
                        onTouchStart={() => setHoveredCard('expense')}
                        onTouchEnd={() => setHoveredCard(null)}
                      >
                        <span className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-400 truncate cursor-pointer select-none">
                          ${formatShortNumber(totalExpenses)}
                        </span>
                        {hoveredCard === 'expense' && (
                          <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded px-4 py-2 text-lg font-semibold text-red-700 dark:text-red-400 whitespace-nowrap pointer-events-none">
                            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">across {categoryData.length} categories</p>
                      {/* [For each relevant pie chart card, add the following after the Total/Net Amount lines:] */}
                      {/* Example for Daily Expense (monthly reset): */}
                      <div className="flex justify-end">
                        {(() => {
                          // Calculate previous month and year
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          let prevMonth = now.getMonth() - 1;
                          let prevYear = now.getFullYear();
                          if (prevMonth < 0) {
                            prevMonth = 11;
                            prevYear -= 1;
                          }
                          // Sum all expenses in the previous month
                          const carryOver = filteredTxs.filter(tx => {
                                const txDate = new Date(tx.date);
                                return tx.amount < 0 && allowedExpenseCats.includes(tx.category) &&
                              txDate.getFullYear() === prevYear &&
                              txDate.getMonth() === prevMonth;
                              }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-red-300 dark:text-red-400 ml-2`}>
                              Previous month spending: ${formatCurrency(carryOver)}
                            </span>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  {/* Net Balance */}
                  <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 shadow-md border-0 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <span className="text-base sm:text-lg md:text-xl">Net Balance</span>
                      </CardTitle>
                      <span className="text-blue-500 dark:text-blue-400 text-base sm:text-lg md:text-xl">●</span>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`relative flex items-center min-h-[3rem] sm:min-h-[3.5rem]`}
                        onMouseEnter={() => setHoveredCard('net')}
                        onMouseLeave={() => setHoveredCard(null)}
                        onTouchStart={() => setHoveredCard('net')}
                        onTouchEnd={() => setHoveredCard(null)}
                      >
                        <span className={`text-2xl sm:text-3xl font-bold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} truncate cursor-pointer select-none`}>
                          ${formatShortNumber(netBalance)}
                        </span>
                        {hoveredCard === 'net' && (
                          <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg rounded px-4 py-2 text-lg font-semibold text-green-700 dark:text-green-400 whitespace-nowrap pointer-events-none">
                            ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">this month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Next rows: 2 summary boxes per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 w-full">
                  {/* Personal Income & Net */}
                  <Card className="bg-green-50 dark:bg-green-900/20 dark:border-gray-700">
                    <CardHeader><CardTitle className="dark:text-gray-100">Personal Income & Net </CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total Income: ${formatCurrency(dailyIncomeData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">
                          Total Expense: ${formatCurrency(
                            dailyExpenseData.reduce((sum, item) => sum + (item.value || 0), 0) +
                            investmentData.reduce((sum, item) => sum + (item.value || 0), 0) +
                            emergencyData.reduce((sum, item) => sum + (item.value || 0), 0) +
                            taxData.reduce((sum, item) => sum + (item.value || 0), 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {(() => {
                          const dailyIncomeTotal = dailyIncomeData.reduce((sum, item) => sum + (item.value || 0), 0);
                          const dailyExpenseTotal = dailyExpenseData.reduce((sum, item) => sum + (item.value || 0), 0);
                          const investmentTotal = investmentData.reduce((sum, item) => sum + (item.value || 0), 0);
                          const emergencyTotal = emergencyData.reduce((sum, item) => sum + (item.value || 0), 0);
                          const personalTaxTotal = taxData.reduce((sum, item) => sum + (item.value || 0), 0);
                          const netAmount = dailyIncomeTotal - (dailyExpenseTotal + investmentTotal + emergencyTotal + personalTaxTotal);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Net Amount: ${netAmount >= 0 ? '' : '-'}${formatCurrency(Math.abs(netAmount))}
                            </span>
                          );
                        })()}
                      </div>
                      {/* Carry Over for Daily Income */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount > 0 && allowedIncomeCats.includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + tx.amount, 0);
                          return (
                            <span className={`font-bold text-gray-400 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-400' : 'text-red-300'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {dailyIncomeData.length > 0 ? (
                        <div className="relative">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={dailyIncomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={dailyIncomeData.length <= 6}>
                                {dailyIncomeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value, name) => [`$${formatCurrency(value)}`, name]} />
                              {dailyIncomeData.length <= 6 && <Legend />}
                            </PieChart>
                          </ResponsiveContainer>
                          {dailyIncomeData.length > 6 && (
                            <div className="flex justify-center mt-4">
                              <CategoryDropdown
                                categories={dailyIncomeData}
                                buttonLabel="Show all Categories"
                              />
                            </div>
                          )}
                        </div>
                      ) : <p className="text-center text-gray-500">No income data for this period.</p>}
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-900/20 dark:border-gray-700">
                    <CardHeader><CardTitle className="dark:text-gray-100">Personal Expense </CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(dailyExpenseData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Daily Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && allowedExpenseCats.includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {dailyExpenseData.length > 0 ? (
                        <div className="relative">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={dailyExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={dailyExpenseData.length <= 6}>
                                {dailyExpenseData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value, name) => [`$${formatCurrency(value)}`, name]} />
                              {dailyExpenseData.length <= 6 && <Legend />}
                            </PieChart>
                          </ResponsiveContainer>
                          {dailyExpenseData.length > 6 && (
                            <div className="flex justify-center mt-4">
                              <CategoryDropdown
                                categories={dailyExpenseData}
                                buttonLabel="Show all Categories"
                              />
                            </div>
                          )}
                        </div>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No expense data for this period.</p>}
                    </CardContent>
                  </Card>
                  {/* Investment & Emergency Breakdown */}
                  <Card className="bg-white dark:bg-gray-900">
                    <CardHeader><CardTitle className="dark:text-gray-100">Investment expense</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(investmentData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Investment Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = allTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && investmentData.map(d => d.name).includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {investmentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={investmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {investmentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No investment data for this period.</p>}
                    </CardContent>
                  </Card>
                  <Card className="bg-white dark:bg-gray-900">
                    <CardHeader><CardTitle className="dark:text-gray-100">Emergency Expense</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(emergencyData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Emergency Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = allTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && emergencyData.map(d => d.name).includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {emergencyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={emergencyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {emergencyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No emergency data for this period.</p>}
                    </CardContent>
                  </Card>
                  {/* Business Income & Business Expense */}
                  <Card className="bg-green-50 dark:bg-green-900/20 dark:border-gray-700">
                  <CardHeader><CardTitle className="dark:text-gray-100">Business Income & Net </CardTitle></CardHeader>
<CardContent>
  {/* Total Income */}
  <div className="flex justify-end">
    <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total Income: ${formatCurrency(businessIncomeData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
  </div>
  
  {/* Total Expense */}
  <div className="flex justify-end">
    <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">
      Total Expense: ${formatCurrency(
        businessExpenseData.reduce((sum, item) => sum + (item.value || 0), 0) +
        businessTaxData.reduce((sum, item) => sum + (item.value || 0), 0)
      )}
    </span>
  </div>
  
  {/* Net Amount */}
  <div className="flex justify-end">
    {(() => {
      const businessIncomeTotal = businessIncomeData.reduce((sum, item) => sum + (item.value || 0), 0);
      const businessExpenseTotal = businessExpenseData.reduce((sum, item) => sum + (item.value || 0), 0);
      const businessTaxTotal = businessTaxData.reduce((sum, item) => sum + (item.value || 0), 0);
      const netAmount = businessIncomeTotal - (businessExpenseTotal + businessTaxTotal);
      return (
        <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${netAmount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          Net Amount: ${netAmount >= 0 ? '' : '-'}${formatCurrency(Math.abs(netAmount))}
        </span>
      );
    })()}
  </div>
  
  {/* Carry Over for Business Income */}
  <div className="flex justify-end">
    {(() => {
      const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
      const year = now.getFullYear();
      const month = now.getMonth();
      const carryOver = filteredTxs.filter(tx => {
        const txDate = new Date(tx.date);
        return tx.amount > 0 && allowedBusinessIncomeCats.includes(tx.category) &&
          txDate.getFullYear() === year &&
          txDate.getMonth() < month;
      }).reduce((sum, tx) => sum + tx.amount, 0);
      return (
        <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
        </span>
      );
    })()}
  </div>
 
  {businessIncomeData.length > 0 ? (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={businessIncomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {businessIncomeData.map((entry, index) => (
            <Cell key={`cell-inc-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  ) : <p className="text-center text-gray-500 dark:text-gray-400">No business income data for this period.</p>}
</CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-900/20 dark:border-gray-700">
                    <CardHeader><CardTitle className="dark:text-gray-100">Business Expense</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(businessExpenseData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Business Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && businessExpenseData.map(d => d.name).includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {businessExpenseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={businessExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {businessExpenseData.map((entry, index) => (
                                <Cell key={`cell-exp-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No business expense data for this period.</p>}
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20 dark:border-gray-700">
                    <CardHeader><CardTitle className="dark:text-gray-100">Personal Tax Expense</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(taxData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Personal Tax Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && taxData.map(d => d.name).includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {taxData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={taxData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {taxData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No tax data for this period.</p>}
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 dark:bg-orange-900/20 dark:border-gray-700">
                    <CardHeader><CardTitle className="dark:text-gray-100">Business Tax Expense</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <span className="font-bold text-gray-500 dark:text-gray-300 mb-1">Total: ${formatCurrency(businessTaxData.reduce((sum, item) => sum + (item.value || 0), 0))}</span>
                      </div>
                      {/* Carry Over for Business Tax Expense */}
                      <div className="flex justify-end">
                        {(() => {
                          const now = new Date(selectedMonthYear.split(' ')[0] + ' 1, ' + selectedMonthYear.split(' ')[1]);
                          const year = now.getFullYear();
                          const month = now.getMonth();
                          const carryOver = filteredTxs.filter(tx => {
                            const txDate = new Date(tx.date);
                            return tx.amount < 0 && businessTaxData.map(d => d.name).includes(tx.category) &&
                              txDate.getFullYear() === year &&
                              txDate.getMonth() < month;
                          }).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
                          return (
                            <span className={`font-bold text-gray-500 dark:text-gray-300 mb-1 ${carryOver >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              Carry Over: ${carryOver >= 0 ? '' : '-'}${formatCurrency(Math.abs(carryOver))}
                            </span>
                          );
                        })()}
                      </div>
                      {businessTaxData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={businessTaxData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {businessTaxData.map((entry, index) => (
                                <Cell key={`cell-tax-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center text-gray-500 dark:text-gray-400">No business tax data for this period.</p>}
                    </CardContent>
                  </Card>
                </div>
                {/* Add Daily Transaction Volume below the summary grid */}
                <Card className="bg-white dark:bg-gray-900 xl:col-span-2 mt-6">
                  <CardHeader><CardTitle className="dark:text-gray-100">Daily Transaction Volume</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={transactionsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                        <Bar dataKey="value" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Add Monthly Transaction Volume below Daily Transaction Volume */}
                <Card className="bg-white dark:bg-gray-900 xl:col-span-2 mt-6">
                  <CardHeader><CardTitle className="dark:text-gray-100">Monthly Transaction Volume</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                        <Legend />
                        <Bar dataKey="Income" stackId="a" fill="#10b981" />
                        <Bar dataKey="Expense" stackId="a" fill="#f43f5e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Add 10 Year Transaction Volume (S-curve) below Monthly Transaction Volume */}
                <Card className="bg-white dark:bg-gray-900 xl:col-span-2 mt-6">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Transaction Volume (S-curve)</CardTitle>
                    {/* Add range selector buttons */}
                    <div className="flex gap-2 mt-2">
                      {[1, 3, 5, 10].map((yr) => (
                        <Button
                          key={yr}
                          size="sm"
                          variant="outline"
                          className={
                            sCurveRange === yr
                              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow'
                              : 'bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 border-gray-900 dark:border-gray-600 hover:bg-gray-800 dark:hover:bg-gray-600 hover:text-white dark:hover:text-gray-100'
                          }
                          onClick={() => setSCurveRange(yr)}
                        >
                          {yr} year{yr > 1 ? 's' : ''}
                        </Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={sCurveData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Net Balance ($)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => `$${formatCurrency(value)}`}/>
                        <Legend formatter={() => 'Cumulative Net Balance'} />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Category Manager */}
                <CategoryManager user={user} />
              </TabsContent>

              <TabsContent value="all_transactions" className="mt-4">
                {/* Month-Year Selector and Category Filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month & Year</label>
                    <Select value={selectedMonthYear} onValueChange={setSelectedMonthYear}>
                      <SelectTrigger className="h-10 sm:h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {availableMonthYears.map((monthYear) => (
                          <SelectItem key={monthYear} value={monthYear} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            {monthYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Filter</label>
                    <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                      <SelectTrigger className="h-10 sm:h-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="px-2 py-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                          <Input
                            type="text"
                            value={categorySearch}
                            onChange={e => setCategorySearch(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full mb-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                            onKeyDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <SelectItem value="All" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">All Categories</SelectItem>
                        {mainCategoryGroups
                          .filter(group =>
                            debouncedCategorySearch.trim() === "" || group.label.toLowerCase().includes(debouncedCategorySearch.toLowerCase())
                          )
                          .map(group => (
                            <SelectItem
                              key={group.label}
                              value={group.label}
                              className="font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              {group.label}
                            </SelectItem>
                          ))}
                        {allSubcategoriesWithSpecials
                          .filter(category =>
                            debouncedCategorySearch.trim() === "" || category.toLowerCase().includes(debouncedCategorySearch.toLowerCase())
                          )
                          .map(category => (
                            <SelectItem key={category} value={category} className="pl-6 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transactions List */}
                <Card className="bg-white dark:bg-gray-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl dark:text-gray-100">All Transactions</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {categorizedTxs.length} transactions for {selectedMonthYear}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categorizedTxs.length > 0 ? (
                      <div className="space-y-2 sm:space-y-3">
                        {sortByDateDesc(categorizedTxs).map((tx, index) => (
                          <div 
                            key={tx.id || index} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border transition-colors bg-white dark:bg-gray-800 ${tx.file ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            onClick={() => handleOpenFile(tx.file)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-sm sm:text-base lg:text-lg truncate max-w-[80vw] sm:max-w-xs dark:text-gray-100">{tx.description || tx.category}</p>
                                {tx.file && <FaPaperclip className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${tx.amount > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                                  {categoryIcons[tx.category] && React.createElement(categoryIcons[tx.category], { className: 'inline-block mr-1' })}
                                  {tx.category}
                                </span>
                                <span>•</span>
                                <span className="truncate">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                            <div className="flex flex-row flex-wrap items-center gap-2 mt-3 sm:mt-0 sm:ml-4 min-w-fit overflow-x-auto">
                              <span className={`font-bold text-sm sm:text-base lg:text-lg ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>{tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTx(tx);
                                }}
                                className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 sm:px-4 py-2 text-xs sm:text-sm h-8 sm:h-9"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTx(tx);
                                }}
                                className="bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 sm:px-4 py-2 text-xs sm:text-sm h-8 sm:h-9"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No transactions found for the selected criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Edit Transaction Modal */}
                {editingTxId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Edit Transaction</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <Input
                            type="text"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                            className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                          <Select value={editForm.category} onValueChange={value => setEditForm({ ...editForm, category: value })}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                                <input
                                  type="text"
                                  value={editCategorySearch}
                                  onChange={e => setEditCategorySearch(e.target.value)}
                                  placeholder="Type to search categories..."
                                  className="w-full px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                  onKeyDown={e => e.stopPropagation()}
                                  onClick={e => e.stopPropagation()}
                                  onFocus={e => e.stopPropagation()}
                                />
                              </div>
                              {filteredEditCategories.length === 0 ? (
                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No categories found</div>
                              ) : (
                                filteredEditCategories.map(category => (
                                  <SelectItem key={category} value={category} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  {category}
                                </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                          <Input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                          <Input
                            type="time"
                            value={editForm.time}
                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                            className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleSaveEditTx}
                            className="flex-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10 sm:h-9"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEditTx}
                            className="flex-1 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 h-10 sm:h-9"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

function CategoryDropdown({ categories, buttonLabel }) {
  const { open, setOpen, ref } = useDropdown();
  return (
    <div className="mt-2 relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="bg-white">
        {buttonLabel}
      </Button>
      {open && (
        <div className="absolute left-0 mt-2 w-64 max-h-72 overflow-auto rounded-lg border bg-white shadow-lg z-50">
          <ul className="divide-y divide-gray-100">
            {categories.map((cat, idx) => (
              <li key={cat.name + idx} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50">
                <span className="truncate font-medium text-gray-700">{cat.name}</span>
                <span className="ml-2 text-xs text-gray-500">${formatCurrency(cat.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// [Add helper to get all subcategories for a group label]
function getGroupSubcategories(labels, mainCategoryGroups, customCategories) {
  const groupCats = mainCategoryGroups
    .filter(g => labels.includes(g.label.trim()))
    .flatMap(g => g.subcategories);
  // Include custom categories if their name matches a subcategory in the group
  const customCatNames = customCategories.map(cat => cat.name);
  return Array.from(new Set([...groupCats, ...customCatNames.filter(name => groupCats.includes(name))]));
}

// 1. Add a utility to highlight the matching part of the category name
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-yellow-200 dark:bg-yellow-600 font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default Dashboard;