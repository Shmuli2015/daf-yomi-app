# Project Instructions & Agent Rules

## Code Comments Policy

- **Do NOT add code comments**: Never add comments (`// ...`, `/* ... */`, `<!-- ... -->`, `{/* ... */}`, `# ...`) when writing new code or modifying existing code.
- **Self-documenting code**: Write clean, expressive, and self-documenting code using descriptive variable, function, and component names instead of explanations.
- **No commentary on logic**: Do not explain what functions, loops, hooks, conditions, or algorithms do via comments.
- **No commented-out code**: Never leave commented-out lines or inactive code blocks.
- **No placeholder / TODO comments**: Do not leave `// TODO` or `// FIXME` comments unless specifically instructed.
- **Preserve existing comments only when unrelated**: Do not add new comments anywhere in the codebase.

## File Structure & Component Architecture

- **Concise & Focused Files**: Avoid overly long or bloated files. Keep files modular, clean, and reasonably sized.
- **One Component Per File**: Each React component file must contain and export only one component. Sub-components, modal dialogs, cards, and distinct UI sections must be extracted into their own dedicated files.
- **Extract Custom Hooks**: Extract business logic, complex state, listeners, and animation logic into dedicated custom hooks (`useXxx.ts`) rather than inlining them in UI components.
- **Extract Helpers & Utilities**: Move data transformations, calculations, formatters, and pure helper functions into separate helper or utility files (`utils/` or dedicated module helpers).
- **Styles & Types Separation**: When styles, types, or static data tables grow large, extract them into adjacent companion files (such as `*.styles.ts`, `*.types.ts`, `*.constants.ts`).

## SOLID Design Principles

- **Single Responsibility Principle (SRP)**: Each component, custom hook, service, and utility must serve one clear purpose and have only one reason to change. Separate presentation from business logic and data access.
- **Open/Closed Principle (OCP)**: Design components and functions to be extensible (via composition, props, and callbacks) without needing to rewrite or mutate existing verified code.
- **Liskov Substitution Principle (LSP)**: Ensure that implementations, variants, and interchangeable utilities strictly honor contract types and interfaces without unexpected divergence in behavior.
- **Interface Segregation Principle (ISP)**: Keep TypeScript types and component props minimal and specific. Do not force components or consumers to depend on broad, unused interfaces.
- **Dependency Inversion Principle (DIP)**: UI components should depend on abstractions (hooks, services, and shared types) rather than tightly coupled low-level implementations (such as direct file-system, database, or device APIs).
