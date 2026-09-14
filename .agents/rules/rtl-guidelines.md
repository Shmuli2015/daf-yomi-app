# Hebrew & RTL Layout Rules

- **Primary Hebrew RTL App**: The app is strictly Right-to-Left (RTL). All screens, modals, cards, and bottom sheets must be designed and aligned for RTL Hebrew reading.
- **Text Alignment Inversion in React Native**: In React Native on Android within an RTL context (`direction: 'rtl'` or `I18nManager.isRTL`), hardcoding `textAlign: 'right'` inverts text to the left (`Gravity.LEFT`). Always use `textAlign: Platform.OS === 'web' ? 'right' : 'left'` and `writingDirection: 'rtl'` whenever explicit right alignment is required for Hebrew text.
- **Prevent Text Box Collapse**: Ensure multi-line text elements stretch across the container using `width: '100%'` or `alignSelf: 'stretch'`.
- **RTL in Modals & Popups**: React Native `<Modal>` roots do not always inherit the parent RTL layout; ensure modal containers declare `direction: 'rtl'` and row elements place icons and start badges on the right side.
