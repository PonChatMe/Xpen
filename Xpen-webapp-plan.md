# Xpen Web App Plan

## 1. Authentication & Onboarding
- User sign up, login, and logout (Google/Firebase Auth).
- Onboarding flow: add first account, set preferences.

---

## 2. Dashboard
- **Header:** App name, user info, and quick navigation.
- **Selectors:** Account and month dropdowns (modern, black/white style).
- **Quick Add:** Input for fast transaction entry, PDF upload for OCR.
- **Summary Cards:** Total income, expenses, net balance, transaction count (colorful, gradient, icon).
- **Tabs:** Dashboard, Accounts, Budget, Add Transaction, All Transactions (pill-shaped, responsive).
- **Charts:** Monthly trends (bar), category breakdown (pie/donut).

---

## 3. Accounts Management
- List of accounts (badges, color-coded).
- Add/edit/delete accounts.
- Account-specific settings and balances.

---

## 4. Category Management
- List of categories (income/expense, color-coded).
- Add/edit/delete categories.
- Assign icons/colors to categories.

---

## 5. Budget Tracking
- Set monthly budgets per category/account.
- Visual progress bars (used/remaining).
- Edit and track budget history.

---

## 6. Add Transaction
- Form for manual entry (amount, category, date, note, account).
- Smart suggestions (recent categories, auto-complete).
- OCR from PDF/image upload (Google Cloud Vision integration).

---

## 7. All Transactions
- Table/list of all transactions (filter by account, month, category).
- Edit/delete transactions.
- Badges for category, color-coded amounts.

---

## 8. UX/UI Polish
- Pixel-perfect match to provided screenshots.
- Responsive design for mobile/tablet/desktop.
- Modern, accessible color palette and component styling (shadcn/ui, Tailwind).
- Smooth transitions, hover/active states, and feedback messages.

---

## 9. Integrations
- **Firebase:** Auth, Firestore/Realtime DB for data.
- **Google Cloud Vision:** OCR for receipts and statements.

---

## 10. Future Enhancements
- Export data (CSV, PDF).
- Recurring transactions.
- Notifications/reminders.
- Multi-currency support.
- Dark mode. 