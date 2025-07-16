# Security Policy

## What Information Do We Collect?

- **Collected:**
  - Basic authentication information (such as email or phone number) if you sign in with Google or phone. This is required for account creation and login.
  - Expense and transaction data that you enter into the app (e.g., amounts, categories, notes).
  - Account and category names you create for your own use.

- **Not Collected:**
  - We do **not** collect or store passwords (authentication is handled by Firebase Auth).
  - We do **not** collect or store any payment or credit card information.
  - We do **not** collect or store any personal files or images unless you explicitly upload them for OCR/receipt scanning (and these are only used for that purpose).
  - We do **not** track your location, device, or browsing activity.
  - We do **not** sell or share your data with third parties.

## Data Storage & Security
- All user data is stored securely in your own Firebase project (if self-hosted) or in the project owner's Firebase instance.
- Only authenticated users can access their own data, enforced by Firebase security rules.

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** create a public issue. Instead, mention the maintainer on a GitHub pull request or issue for a private discussion.

## Questions?

If you have any questions about security or privacy, please open an issue or contact the maintainer directly. 