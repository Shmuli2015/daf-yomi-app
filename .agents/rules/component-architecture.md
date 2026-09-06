# File Structure & Component Architecture

- **Concise & Focused Files**: Avoid overly long or bloated files. Keep files modular and readable.
- **One Component Per File**: Each file must contain only one component. Child components, section views, and sub-items must be extracted to their own files.
- **Extract Custom Hooks**: Separate complex state, side effects, and business logic into custom hooks (`useXxx.ts`).
- **Extract Helpers**: Move calculation, formatting, and data transformation logic into helper/utility files.
- **Separate Companion Modules**: Move heavy style objects, types, and constants to adjacent files (`*.styles.ts`, `*.types.ts`, `*.constants.ts`) when components grow.
