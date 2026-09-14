# State Management & Store Rules

- **Atomic Selectors**: Always extract store state using selective pickers (e.g., `useAppStore(state => state.someValue)`) to avoid unnecessary component re-renders.
- **Async Persistence in Store/Services**: Keep database (SQLite), file system, and backup logic encapsulated inside store actions or dedicated service modules, never directly inside UI component event handlers.
