
import { months } from './dashboardConstants';

export function getMonthName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return months[d.getMonth()];
}

export function formatShortNumber(value) {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (value >= 100_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function isBusinessCategory(category, customCategories) {
  const businessTerms = ["company", "store", "shop", "shop name", "business"];
  const lowerCat = category.toLowerCase();
  if (businessTerms.some(term => lowerCat.includes(term))) return true;
  const customCat = customCategories.find(cat => cat.name === category);
  if (customCat && customCat.keywords) {
    return customCat.keywords.some(kw => businessTerms.some(term => kw.toLowerCase().includes(term)));
  }
  return false;
}

export function formatCurrency(value) {
  if (typeof value !== 'number') {
      return 'N/A';
    }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getMonthYearStr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getOtherAccountCategory(customCategories) {
  if (!Array.isArray(customCategories)) {
    return undefined; 
  }
  return customCategories.find(cat => cat.isOtherAccount);
}

export const isExcludedCategory = (cat, customCategories) => {
    const otherCat = getOtherAccountCategory(customCategories);
    return cat === 'cash' || cat === 'Turemoney' || (otherCat && cat === otherCat.name);
};



export function sortByDateDesc(txs) {
    return [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const getGroupSubcategories = (groups, mainCategoryGroups, customCategories) => {
  const subcategories = new Set();
  const allGroups = [...mainCategoryGroups.expense, ...mainCategoryGroups.income];
  groups.forEach(groupLabel => {
    const group = allGroups.find(g => g.label === groupLabel);
    if (group) {
      group.categories.forEach(sub => subcategories.add(sub));
    }
  });

  // Also add custom categories that might fall under these groups
  customCategories.forEach(cat => {
    // This logic might need to be more sophisticated based on how you want to map custom categories to main groups
    // For now, we can assume that if a custom category is created, it should be considered in calculations
    subcategories.add(cat.name);
  });

  return Array.from(subcategories);
};
