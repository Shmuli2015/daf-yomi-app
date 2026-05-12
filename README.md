# מסע דף (Masa Daf) — Daf Yomi Tracker

**מסע דף** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

**Version:** See the `version` field in [`package.json`](./package.json). Expo picks it up in [`app.config.js`](./app.config.js), and the app shows it in Settings (via `expo-constants`), so one source of truth stays in sync.

---

## App Functions

### 🏠 Home Dashboard
- **Today's Daf Display**: Shows the current day's Daf Yomi (tractate and page) with both Hebrew and Gregorian dates
- **Learning Tracker**: Use **Mark as learned** (`סמן כנלמד`) to record today's page; the control switches to **Finished** (`סיימתי את הדף`) and asks for confirmation before unsetting
- **Masechet Progress Bar**: Visual indicator showing your progress in the current tractate
- **Sefaria Integration**: Direct link to view the Daf on Sefaria for online learning
- **Streak Counter**: Track your consecutive days of learning to maintain momentum
- **7-Day Learning Widget**: Visual mini-calendar showing your last week's progress at a glance
- **Shas Progress Banner**: Overall progress across Shas; **tap the banner** to open the History screen for full tractate details
- **Confetti Celebration**: Optional festive animation when marking a Daf as learned

### 📊 History & Progress Tracking
- **Complete Shas Overview**: Grid view of all 37 tractates (מסכתות) in the Talmud
- **Masechet-by-Masechet Progress**: Individual progress bars for each tractate showing pages learned
- **Completion Statistics**: Track total pages learned and completed tractates
- **Interactive Masechet Details**: Tap any tractate to see detailed breakdown of dafim learned vs. remaining
- **Visual Progress Hero**: Large progress ring displaying overall Shas completion percentage
- **Learned Pages Counter**: Real-time count of total pages learned across all of Shas

### 📅 Hebrew Calendar View
- **Monthly Hebrew Calendar**: Hebrew dates (gematria) with gregorian day numbers per cell
- **Navigation**: Month arrows and a **Today** (`היום`) shortcut when you are viewing another month
- **Learned days**: Highlighted with the accent color; **today** uses a lighter accent ring
- **Day detail**: Tap a date to open a card with that day's Daf, Sefaria link, and learn/unlearn (with confirmation when clearing)
- **Future dates**: Option to mark **learned ahead** (`למדתי מראש`) when you have already studied that calendar day's page

### ⚙️ Settings & Customization
- **Daily Notifications**: Configurable daily reminders at your preferred time
- **Custom Day Schedules**: Set different notification times for each day of the week
- **Notification Mode Toggle**: Switch between daily uniform time or custom per-day schedules
- **Interactive Notification Actions** (Hebrew in the app):  
  - `✅ סיימתי את הדף!` — mark today's page as learned from the notification  
  - `⏰ הזכר לי עוד שעה` — snooze for one hour
- **Theme Selection**: Choose between Light, Dark, or System-based theme modes
- **Date Display Preferences**: Toggle visibility of Gregorian date alongside Hebrew date
- **Confetti Effects Toggle**: Enable/disable celebration animations
- **Data Management**: Complete reset option to clear all learning history
- **Privacy-First**: All data stored locally on device with SQLite database

### 🔔 Smart Notifications
- **Daily Learning Reminders**: Scheduled notifications at your chosen time(s)
- **Dynamic Daf Information**: Notifications show today's tractate and page number
- **Interactive Actions**: Quick actions directly from notification tray
- **Snooze Functionality**: One-hour follow-up via `⏰ הזכר לי עוד שעה`
- **Expo Go**: Local notification scheduling still runs, but behavior can differ from dev/production builds; use a **development build** for full parity
- **Auto-scheduling**: Notifications automatically reschedule on device reboot
- **Per-Day Customization**: Different notification times for different days of the week
- **Hebrew Text**: All notifications in Hebrew for native speaker experience

### 📱 User Experience
- **Full RTL Support**: Complete Right-to-Left layout optimized for Hebrew
- **Smooth Animations**: Powered by React Native Reanimated for fluid transitions
- **Splash Screen**: Elegant branded loading screen on app launch
- **Tab Navigation**: Intuitive bottom tab bar with Home, Calendar, History, and Settings
- **Offline-First**: Full functionality without internet connection
- **Platform Support**: Runs on iOS, Android, and Web
- **Dark Mode**: Sophisticated dark theme with gold accents for premium "Seforim" aesthetic
- **Light Mode**: Clean, bright interface for daytime use
- **System Theme**: Automatically adapts to device theme settings

### 💾 Data Persistence
- **Local SQLite Database**: Lightning-fast local storage for all learning records
- **Zustand State Management**: Reactive UI with efficient state updates
- **Progress Caching**: Optimized calculations for instant performance
- **Date-based Records**: Track every Daf by date with learned/missed/skipped status
- **Settings Persistence**: All preferences saved and restored on app restart

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

   For a **development client** build (custom native runtime), use:
   ```bash
   npm run start:dev
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

## Contributing

We welcome contributions! If you have ideas for new features or want to report a bug, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Author

Shmuel Rosenberg — see `package.json` (`author`) and the in-app Settings footer.

