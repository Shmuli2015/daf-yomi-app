# Quality & Verification Rules

- **Type Check Verification**: Run `npm run typecheck` after modifying TypeScript files to ensure zero type errors before completing tasks.
- **Graceful Error Handling**: Wrap async flows (storage, backup, database queries) with proper `try/catch` blocks and clear, user-facing Hebrew feedback; never fail silently.
