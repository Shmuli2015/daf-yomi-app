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
- **One Component Per File**: Each React component file must define and export exactly one component. Never declare inner components (modal dialogs, cards, distinct UI sections, list items, render helpers returning JSX) inside another component file. A file that only composes imported components is acceptable as long as it still exports a single component.
- **Thin Screens**: A `*Screen.tsx` file only composes hooks and renders JSX. Feature flows, modal state machines, and static text tables must not live in a screen.
- **Extract When A Screen Has Multiple Concerns**: When a screen manages several domains (notifications, backup, reset, updates), give each domain its own `useXxx.ts` hook, and move calculations, formatting, and static copy into `utils/` or helper modules.
- **Orchestrate, Don't Own Logic**: Screens wire together the store, hooks, and presentational components; business logic does not live in the screen itself.
- **Extract Custom Hooks**: Extract business logic, complex state, listeners, and animation logic into dedicated custom hooks (`useXxx.ts`) rather than inlining them in UI components.
- **Extract Helpers & Utilities**: Move data transformations, calculations, formatters, and pure helper functions into separate helper or utility files (`utils/` or dedicated module helpers).
- **Styles & Types Separation**: When styles, types, or static data tables grow large, extract them into adjacent companion files (such as `*.styles.ts`, `*.types.ts`, `*.constants.ts`).

## SOLID Design Principles

- **Single Responsibility Principle (SRP)**: Each component, custom hook, service, and utility must serve one clear purpose and have only one reason to change. Separate presentation from business logic and data access.
- **Open/Closed Principle (OCP)**: Design components and functions to be extensible (via composition, props, and callbacks) without needing to rewrite or mutate existing verified code.
- **Liskov Substitution Principle (LSP)**: Ensure that implementations, variants, and interchangeable utilities strictly honor contract types and interfaces without unexpected divergence in behavior.
- **Interface Segregation Principle (ISP)**: Keep TypeScript types and component props minimal and specific. Do not force components or consumers to depend on broad, unused interfaces.
- **Dependency Inversion Principle (DIP)**: UI components should depend on abstractions (hooks, services, and shared types) rather than tightly coupled low-level implementations (such as direct file-system, database, or device APIs).

## Hebrew & RTL Layout Guidelines

- **Primary Hebrew RTL App**: The app is fully Right-to-Left (RTL). All screens, modals, bottom sheets, and layouts must strictly respect RTL alignment.
- **Text Alignment Inversion in React Native**: In React Native Android within RTL contexts (`direction: 'rtl'` or `I18nManager.isRTL`), hardcoding `textAlign: 'right'` inverts text to the left (`Gravity.LEFT`). Always use `textAlign: Platform.OS === 'web' ? 'right' : 'left'` and `writingDirection: 'rtl'` when explicit right-alignment of Hebrew text is required.
- **Prevent Text Box Collapse**: Ensure multi-line Hebrew texts stretch across the container using `width: '100%'` or `alignSelf: 'stretch'`.
- **RTL in Modals & Popups**: React Native `<Modal>` roots do not always inherit the parent RTL layout; ensure container views declare `direction: 'rtl'` and row elements place icons and start badges on the right side.

## Theming & Style Guidelines

- **Style Factory Pattern**: Always export a factory function `createXxxStyles(theme: Theme)` from companion `*.styles.ts` files to ensure full theme reactivity (dark and light modes).
- **Zero Hardcoded Colors**: Never hardcode hex color strings (`#...`) in components or styles. Reference `theme.colors.*`, `theme.radius.*`, and `...theme.shadow.*` from `src/theme.ts`.
- **StyleSheet Safety**: Always use `StyleSheet.absoluteFill` instead of `StyleSheet.absoluteFillObject`.
- **Safe Area Insets**: Use `SafeAreaView` from `react-native-safe-area-context` or `useSafeAreaInsets()`. Never import `SafeAreaView` from standard `react-native`.

## State Management & Store Rules

- **Atomic Selectors**: Always extract store state using selective pickers (e.g., `useAppStore(state => state.someValue)`) to avoid unnecessary component re-renders.
- **Async Persistence in Store/Services**: Keep database (SQLite), file system, and backup logic encapsulated inside store actions or dedicated service modules, never directly inside UI component event handlers.

## Performance & Virtualization

- **Long Lists**: For large datasets (masechtot, dapim, study history), always use `FlatList` with stable `keyExtractor` and `getItemLayout` when item heights are uniform. Never render hundreds of items using `.map()` inside a plain `ScrollView`.

## Quality & Verification

- **Type Check Verification**: Run `npm run typecheck` after modifying TypeScript files to ensure zero type errors before completing tasks.
- **Graceful Error Handling**: Wrap async flows (storage, backup, database queries) with proper `try/catch` blocks and clear, user-facing Hebrew feedback; never fail silently.

## Typography & Text Formatting Guidelines

- **No Em Dash**: Never use the em dash character (`—`, U+2014, or `--` used as an em dash) anywhere in text. This applies to UI text, Hebrew copy, translations, documentation, markdown files, commit messages, code strings, and agent responses. Use standard punctuation instead (such as a standard hyphen `-`, comma `,`, colon `:`, parentheses `()`, or a period `.`), or rephrase the sentence.

