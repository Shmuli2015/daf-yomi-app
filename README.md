<div dir="ltr" lang="en">

# <span dir="rtl" lang="he">מסע דף</span> (Masa Daf) - Daf Yomi Tracker

**<span dir="rtl" lang="he">מסע דף</span>** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

**Version:** See the `version` field in [`package.json`](./package.json). Expo picks it up in [`app.config.js`](./app.config.js), and the app shows it in Settings (via `expo-constants`), so one source of truth stays in sync.

**App updates (APK sideload):** The app can notify users when a newer build is available and link to the published APK. Checks use the public GitHub Releases API (see [`src/services/appUpdate.ts`](./src/services/appUpdate.ts)). Repository and release file naming are configured under `expo.extra` in [`app.config.js`](./app.config.js) (`githubOwner`, `githubRepo`, `releaseApkBasename`, `updateCheckEnabled`).

---

## App Functions

### 🏠 Home Dashboard
- **Day Navigation**: Prev/next arrows on the dashboard move between calendar days for that day's Daf; tap the dates to jump back to today, or use **Return to today** (<span dir="rtl" lang="he">חזור להיום</span>) when you have moved away from the real calendar date
- **Today's Daf Display**: Shows the Daf Yomi for the selected day (tractate and page) with both Hebrew and Gregorian dates (Gregorian respects the visibility toggle)
- **Learning Tracker**: Use **Mark as learned** (<span dir="rtl" lang="he">סמן כנלמד</span>) to record that day's page; the control switches to **Finished** (<span dir="rtl" lang="he">סיימתי את הדף</span>) and asks for confirmation before unsetting
- **Masechet Progress Bar**: Visual indicator showing your progress in the current tractate
- **Sefaria Integration**: Direct link to view the Daf on Sefaria for online learning
- **Streak Counter**: Track your consecutive days of learning to maintain momentum
- **7-Day Progress Overview**: In-app mini chart of the last seven days so you can see your week at a glance
- **Shas Progress Banner**: Overall progress across Shas; **tap the banner** to open the History screen for full tractate details
- **Confetti Celebration**: Optional festive animation when marking a Daf as learned


### 📊 History & Progress Tracking
- **Complete Shas Overview**: Grid view of all 37 tractates (<span dir="rtl" lang="he">מסכתות</span>) in the Talmud
- **Masechet-by-Masechet Progress**: Individual progress bars for each tractate showing pages learned
- **Completion Statistics**: Track total pages learned and completed tractates
- **Interactive Masechet Details**: Tap any tractate to see detailed breakdown of dafim learned vs. remaining
- **Visual Progress Hero**: Large progress ring displaying overall Shas completion percentage
- **Learned Pages Counter**: Real-time count of total pages learned across all of Shas

### 📅 Hebrew Calendar View
- **Monthly Hebrew Calendar**: Hebrew dates (gematria) with gregorian day numbers per cell
- **Navigation**: Month arrows and a **Today** (<span dir="rtl" lang="he">היום</span>) shortcut when you are viewing another month
- **Learned days**: Highlighted with the accent color; **today** uses a lighter accent ring
- **Day detail**: Tap a date to open a card with that day's Daf, Sefaria link, and learn/unlearn (with confirmation when clearing)
- **Future dates**: Option to mark **learned ahead** (<span dir="rtl" lang="he">למדתי מראש</span>) when you have already studied that calendar day's page

### ⚙️ Settings & Customization
- **App updates** (<span dir="rtl" lang="he">עדכוני אפליקציה</span>): **Check for updates** (<span dir="rtl" lang="he">בדוק עדכונים</span>) verifies whether a newer published version exists; when one is available, users get an in-app prompt with a download link (install is manual, outside the store). Automatic checks are throttled (about once per 24 hours); manual checks bypass that throttle
- **Notifications Master Switch**: Toggle **Daily reminder** (<span dir="rtl" lang="he">תזכורת יומית</span>) on or off; when off, no reminders are scheduled
- **Daily Notifications**: When reminders are enabled, choose one time for every day or set up per-day behavior
- **Notification Mode**: **Every day** (<span dir="rtl" lang="he">כל יום</span>) uses a single time for the whole week; **By weekday** (<span dir="rtl" lang="he">לפי ימים</span>) lets you enable or disable each day and set a different time per enabled day
- **In-App User Guide**: Open **User guide** (<span dir="rtl" lang="he">מדריך שימוש</span>) for a Hebrew walkthrough of every major screen and feature; the guide includes the support email for feedback and questions
- **Contact & support**: **Contact** (<span dir="rtl" lang="he">יצירת קשר</span>) in Settings opens your mail app, or write to **[support.masa.daf@gmail.com](mailto:support.masa.daf@gmail.com)** for feedback, technical support, and suggestions
- **Interactive Notification Actions** (Hebrew in the app):  
  - <span dir="rtl" lang="he">✅ סיימתי את הדף!</span> — mark the current cycle page as learned from the notification  
  - <span dir="rtl" lang="he">⏰ הזכר לי עוד שעה</span> — snooze for one hour
- **Theme Selection**: Choose between Light, Dark, or System-based theme modes
- **Date Display Preferences**: Toggle visibility of Gregorian date alongside Hebrew date
- **Confetti Effects Toggle**: Enable/disable celebration animations
- **Data Management**: Complete reset option to clear all learning history
- **Privacy-First**: All data stored locally on device with SQLite database

### 🔔 Smart Notifications
- **Daily Learning Reminders**: Scheduled at your preferred time(s) while **Daily reminder** (<span dir="rtl" lang="he">תזכורת יומית</span>) stays enabled
- **Dynamic Daf Information**: Notifications show today's tractate and page number
- **Interactive Actions**: Quick actions directly from notification tray
- **Snooze Functionality**: One-hour follow-up via <span dir="rtl" lang="he">⏰ הזכר לי עוד שעה</span>
- **Expo Go**: Local notification scheduling still runs, but behavior can differ from dev/production builds; use a **development build** for full parity
- **Auto-scheduling**: Notifications automatically reschedule on device reboot
- **Per-Day Customization**: In **By weekday** (<span dir="rtl" lang="he">לפי ימים</span>) mode, turn individual weekdays on or off and assign each enabled day its own time
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

## CI/CD

Workflow: [`.github/workflows/build-android.yml`](./.github/workflows/build-android.yml).

- **Triggers**: Push of a version tag matching `v*` (for example `v1.0.12`), or **Run workflow** manually (`workflow_dispatch`).
- **Build**: Local EAS Android preview APK (`eas build … --profile preview --local`); requires `EXPO_TOKEN` in repository secrets.
- **GitHub Release (tags only)**: After the build, the APK is renamed to `{releaseApkBasename}-{version}.apk` (see `expo.extra.releaseApkBasename` in [`app.config.js`](./app.config.js), default branding prefix `masa-daf`) and attached to a **published** GitHub Release for that tag ([`softprops/action-gh-release`](https://github.com/softprops/action-gh-release)).
- **Artifacts**: Every run uploads `*.apk` as a workflow artifact (short-lived); **users should download from Releases**, which matches what the in-app updater checks.

**Maintainer checklist for a release**

1. Bump `version` in [`package.json`](./package.json) (and commit).
2. Create and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Confirm the workflow run published the Release and that the APK asset name matches `releaseApkBasename`.

---

## Support & contact

Questions, technical support, or ideas to improve the app: **[support.masa.daf@gmail.com](mailto:support.masa.daf@gmail.com)**  

You can also use **Contact** (<span dir="rtl" lang="he">יצירת קשר</span>) in the in-app Settings screen to start an email with a preset subject line.

---

## Contributing

We welcome contributions! If you have ideas for new features or want to report a bug, please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

---

## Author

Shmuel Rosenberg - see `package.json` (`author`) and the in-app Settings footer.

</div>
