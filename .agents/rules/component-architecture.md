# File Structure & Component Architecture

- **Concise & Focused Files**: Avoid overly long or bloated files. Keep files modular and readable.
- **One Component Per File**: Each React file must define and export exactly one component. Never declare inner components (modals, cards, sections, list items, render helpers returning JSX) inside another component file. A file that only composes imported components is fine as long as it still exports a single component.
- **Thin Screens**: A `*Screen.tsx` file only composes hooks and renders JSX. Feature flows, modal state machines, and static text tables must not live in a screen.
- **Extract When A Screen Has Multiple Concerns**: When a screen manages several domains (notifications, backup, reset, updates), give each domain its own `useXxx.ts` hook, and move calculations, formatting, and static copy into `utils/` or helper modules.
- **Orchestrate, Don't Own Logic**: Screens wire together the store, hooks, and presentational components; business logic does not live in the screen itself.
- **Extract Custom Hooks**: Separate complex state, side effects, and business logic into custom hooks (`useXxx.ts`).
- **Extract Helpers**: Move calculation, formatting, and data transformation logic into helper/utility files.
- **Separate Companion Modules**: Move heavy style objects, types, and constants to adjacent files (`*.styles.ts`, `*.types.ts`, `*.constants.ts`) when components grow.
