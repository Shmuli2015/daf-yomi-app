# Theming & Style Guidelines

- **Style Factory Pattern**: Always export a factory function `createXxxStyles(theme: Theme)` from companion `*.styles.ts` files to ensure full theme reactivity (dark and light modes).
- **Zero Hardcoded Colors**: Never hardcode hex color strings (`#...`) in components or styles. Reference `theme.colors.*`, `theme.radius.*`, and `...theme.shadow.*` from `src/theme.ts`.
- **StyleSheet Safety**: Always use `StyleSheet.absoluteFill` instead of `StyleSheet.absoluteFillObject`.
- **Safe Area Insets**: Use `SafeAreaView` from `react-native-safe-area-context` or `useSafeAreaInsets()`. Never import `SafeAreaView` from standard `react-native`.
