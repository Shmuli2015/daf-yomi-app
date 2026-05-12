# מסע דף (Masa Daf) — Daf Yomi Tracker

**מסע דף** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

---

## App Functions

### 🏠 Home Dashboard
- **Today's Daf Display**: Shows the current day's Daf Yomi (tractate and page) with both Hebrew and Gregorian dates
- **One-Tap Learning Tracker**: Mark today's Daf as learned/unlearned with a single tap
- **Masechet Progress Bar**: Visual indicator showing your progress in the current tractate
- **Sefaria Integration**: Direct link to view the Daf on Sefaria for online learning
- **Streak Counter**: Track your consecutive days of learning to maintain momentum
- **7-Day Learning Widget**: Visual mini-calendar showing your last week's progress at a glance
- **Shas Progress Banner**: Comprehensive progress bar displaying total pages learned out of 2,711 dafim
- **Confetti Celebration**: Optional festive animation when marking a Daf as learned

### 📊 History & Progress Tracking
- **Complete Shas Overview**: Grid view of all 37 tractates (מסכתות) in the Talmud
- **Masechet-by-Masechet Progress**: Individual progress bars for each tractate showing pages learned
- **Completion Statistics**: Track total pages learned and completed tractates
- **Interactive Masechet Details**: Tap any tractate to see detailed breakdown of dafim learned vs. remaining
- **Visual Progress Hero**: Large progress ring displaying overall Shas completion percentage
- **Learned Pages Counter**: Real-time count of total pages learned across all of Shas

### 📅 Hebrew Calendar View
- **Monthly Hebrew Calendar**: Beautiful calendar interface with Hebrew dates
- **Learning History Visualization**: Color-coded dates showing which days you learned
- **Date Navigation**: Browse through months to review your historical progress
- **Hebrew Date Formatting**: Full Hebrew date display with proper gematria formatting
- **Status Indicators**: Visual markers for learned, missed, and skipped days

### ⚙️ Settings & Customization
- **Daily Notifications**: Configurable daily reminders at your preferred time
- **Custom Day Schedules**: Set different notification times for each day of the week
- **Notification Mode Toggle**: Switch between daily uniform time or custom per-day schedules
- **Interactive Notification Actions**: 
  - "✅ I finished the Daf!" button to mark as learned directly from notification
  - "⏰ Remind me in an hour" button to snooze the reminder
- **Theme Selection**: Choose between Light, Dark, or System-based theme modes
- **Date Display Preferences**: Toggle visibility of Gregorian date alongside Hebrew date
- **Confetti Effects Toggle**: Enable/disable celebration animations
- **Data Management**: Complete reset option to clear all learning history
- **Privacy-First**: All data stored locally on device with SQLite database

### 🔔 Smart Notifications
- **Daily Learning Reminders**: Scheduled notifications at your chosen time(s)
- **Dynamic Daf Information**: Notifications show today's tractate and page number
- **Interactive Actions**: Quick actions directly from notification tray
- **Snooze Functionality**: "Remind me later" option schedules follow-up after 1 hour
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

