# מסע דף (Masa Daf) — Daf Yomi Tracker

**מסע דף** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

---

## Key Features

### Hebrew calendar integration
- **Full Hebrew Support**: Track your study progress by the Hebrew date.
- **Dynamic Mapping**: Automatically maps the daily Daf to both Hebrew and Secular calendars.
- **Visual Insights**: A beautiful calendar view to see your monthly learning history.

### Modern dashboard
- **Streak Tracker**: Keep your momentum going with a stylized study streak indicator.
- **Shas Progress Banner**: A high-end visual representation of your overall progress through the Talmud.
- **Quick Action**: Mark today's Daf as learned with a single tap directly from the home screen.

### Shas progress & history
- **Masechet Grid**: A dedicated view showing every tractate in Shas with individual progress bars.
- **Detailed History**: Browse through your entire study journey and revisit your milestones.
- **Interactive Modals**: Tap on any tractate to see a detailed breakdown of pages learned vs. remaining.

### Premium experience
- **Festive Effects**: Celebrate your learning milestones with beautiful confetti animations.
- **Dark Mode Aesthetics**: A sophisticated, dark-themed UI with gold and slate accents for a "Seforim-like" feel.
- **Full RTL Support**: Optimized for Hebrew speakers with professional Right-to-Left layout and typography.
- **Smart Settings**: Toggle between Secular/Hebrew dates, customize notifications, and manage study preferences.

---

## Tech Stack

- **Core**: [Expo](https://expo.dev/) & [React Native](https://reactnative.dev/) (TypeScript)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) & Vanilla CSS for custom animations.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for reactive UI states.
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for lightning-fast local persistence.
- **Calendar Logic**: [@hebcal/core](https://www.npmjs.com/package/@hebcal/core) & `@hebcal/learning`.
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) & [react-native-confetti-cannon](https://www.npmjs.com/package/react-native-confetti-cannon).

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- A package manager: `npm` (ships with Node) is recommended
- For running on a real device: [Expo Go](https://expo.dev/go) (optional)
- For running on Android emulator/device from Windows: Android Studio + SDK (optional)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shmuli2015/daf-yomi-app.git
   cd daf-yomi-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run start
   ```

### Run targets

- **Android**:
  ```bash
  npm run android
  ```

- **Web**:
  ```bash
  npm run web
  ```

- **iOS** (macOS only):
  ```bash
  npm run ios
  ```

---

## Screenshots

Coming soon.

---

## Contributing

We welcome contributions! If you have ideas for new features or want to report a bug, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

