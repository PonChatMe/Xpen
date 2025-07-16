# Security Policy

## Supported Versions

We support the latest version of this project. Please update to the latest version for security patches and improvements.

## Reporting a Vulnerability

If you discover a security vulnerability, please do **not** create a public issue. Instead, report it privately by emailing the maintainer:

- **Email:** pon.chaithawat@gmail.com

We will respond as quickly as possible and work with you to resolve the issue.

## Security Best Practices

- **No secrets in code:** All sensitive information (API keys, credentials, etc.) are kept out of the repository and loaded from environment variables.
- **.env and secrets are gitignored:** No private keys or credentials are ever committed to the repository.
- **User data is protected:** Firebase security rules ensure that users can only access their own data.
- **History is clean:** The repository history has been reset to remove any previously committed secrets.

## Recommendations for Users

- Always use your own Firebase project and credentials.
- Never share your `.env` or service account files publicly.
- Keep your dependencies up to date.

## Questions?

If you have any questions about security, please open an issue or contact the maintainer directly. 