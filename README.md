<div dir="ltr" lang="en">

# <span dir="rtl" lang="he">מסע דף</span> (Masa Daf) - Daf Yomi Tracker

**<span dir="rtl" lang="he">מסע דף</span>** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

**Version:** See the `version` field in [`package.json`](./package.json). Expo picks it up in [`app.config.js`](./app.config.js), and the app shows it in Settings (via `expo-constants`), so one source of truth stays in sync.

**App updates (APK sideload):** The app compares the installed build against the latest published APK using the public GitHub Releases API (see [`src/services/appUpdate.ts`](./src/services/appUpdate.ts)). When a newer version is available, **Download & install** (<span dir="rtl" lang="he">הורד והתקן</span>) downloads the APK in-app and opens Android’s install screen (see [`src/services/apkInstall.ts`](./src/services/apkInstall.ts)). **First install / share link:** [Download page](https://shmuli2015.github.io/daf-yomi-app/) (`docs/` on GitHub Pages) — one Hebrew button, no GitHub UI. Configure the repository in `expo.extra` inside [`app.config.js`](./app.config.js) (`githubOwner`, `githubRepo`, `releaseApkBasename`, `downloadPageUrl`, `updateCheckEnabled`). **Automatic update notifications** (<span dir="rtl" lang="he">התראות עדכון אוטומטיות</span>) are optional and **off** by default.

---

## App Functions

### 🏠 Home Dashboard
- **Day Navigation**: Prev/next arrows on the dashboard move between calendar days for that day's Daf; tap the dates to jump back to today, or use **Return to today** (<span dir="rtl" lang="he">חזור להיום</span>) when you have moved away from the real calendar date
- **Today's Daf Display**: Shows the Daf Yomi for the selected day (tractate and page) with both Hebrew and Gregorian dates (Gregorian respects the visibility toggle)
- **Learning Tracker**: Use **Mark as learned** (<span dir="rtl" lang="he">סמן כנלמד</span>) to record that day's page; the control switches to **Learned** (<span dir="rtl" lang="he">אשריך! הדף נלמד</span>) and asks for confirmation before unsetting
- **Masechet Progress Bar**: Visual indicator showing your progress in the current tractate
- **Sefaria Integration**: Opens the Daf in Sefaria in your **external browser** (unchanged behavior)
- **Tzurat Hadaf Viewer** (<span dir="rtl" lang="he">צורת הדף</span>): In-app **Vilna page PDFs** from [daf-yomi.com](https://daf-yomi.com) (Sefaria Manuscripts fallback) with pinch-to-zoom, amud/daf navigation, **mark as learned** from the viewer header, **landscape rotation** for wider reading, and **local PDF cache** for fast re-open
- **Study Link Buttons**: In Settings, choose to show **Sefaria only**, **Tzurat Hadaf only**, or **both** on Home and Calendar
- **Streak Counter**: Track your consecutive days of learning to maintain momentum
- **7-Day Progress Overview**: In-app mini chart of the last seven days so you can see your week at a glance
- **Share progress as an image** (<span dir="rtl" lang="he">שיתוף תמונה</span>): On the streak card, tap the **share** (<span dir="rtl" lang="he">שתף</span>) control to open a preview, then **Share image** (<span dir="rtl" lang="he">שתף תמונה</span>) — exports a square graphic (streak, Hebrew date, app branding) for WhatsApp Status, Instagram Stories, etc. (requires a **development or production build**, not Expo Go; see Tech Stack)
- **Shas Progress Banner**: Overall progress across Shas; **tap the banner** to open the History screen for full tractate details
- **Confetti Celebration**: Optional festive animation when marking a Daf as learned


### 📊 History & Progress Tracking
- **Complete Shas Overview**: All 37 tractates (<span dir="rtl" lang="he">מסכתות</span>) grouped by **Seder** (<span dir="rtl" lang="he">סדר</span>) in collapsible sections, each with its own progress summary
- **Masechet-by-Masechet Progress**: Individual progress bars for each tractate showing pages learned
- **Completion Statistics**: Track total pages learned and completed tractates
- **Interactive Masechet Details**: Tap any tractate to see a daf grid; use **Mark all** (<span dir="rtl" lang="he">סמן הכל</span>) or **Clear all** (<span dir="rtl" lang="he">בטל הכל</span>) for bulk updates (with confirmation), or tap individual daf numbers to toggle
- **Visual Progress Hero**: Large progress ring displaying overall Shas completion percentage
- **Share Shas progress as an image**: On the History screen, use the **share** control on the hero card (same flow: preview → **Share image**) to export a branded square graphic with ring %, pages learned, and completed tractates count
- **Learned Pages Counter**: Real-time count of total pages learned across all of Shas

### 📅 Hebrew Calendar View
- **Monthly Hebrew Calendar**: Hebrew dates (gematria) with gregorian day numbers per cell; optionally show each day's **Daf number** in the cell (<span dir="rtl" lang="he">הצג דף בלוח שנה</span> in Settings)
- **Navigation**: Month arrows, **swipe left/right** to change months, and a **Return to today** (<span dir="rtl" lang="he">חזרה להיום</span>) shortcut when you are viewing another month
- **Learned days**: Highlighted with the accent color; **today** uses a lighter accent ring
- **Day detail**: Tap a date to open a card with that day's Daf, study buttons (Sefaria and/or Tzurat Hadaf per Settings), and learn/unlearn (with confirmation when clearing)
- **Future dates**: Option to mark **learned ahead** (<span dir="rtl" lang="he">למדתי מראש</span>) when you have already studied that calendar day's page

### ⚙️ Settings & Customization
- **App updates** (<span dir="rtl" lang="he">עדכוני אפליקציה</span>): **Check for updates** (<span dir="rtl" lang="he">בדוק עדכונים</span>) checks GitHub; when a newer APK exists, a modal offers **Download & install** in-app (Android). **Automatic update notifications** default to **off**. Fallback: **Download in browser** opens the simple [download page](https://shmuli2015.github.io/daf-yomi-app/). Tapping **later** suppresses automatic prompts for that version until a newer release ships. **Share download link** (<span dir="rtl" lang="he">שתף קישור להורדה</span>) sends the install page to friends via the system share sheet.
- **Notifications Master Switch**: Toggle **Daily reminder** (<span dir="rtl" lang="he">תזכורת יומית</span>) on or off; when off, no reminders are scheduled
- **Daily Notifications**: When reminders are enabled, choose one time for every day or set up per-day behavior
- **Notification Mode**: **Every day** (<span dir="rtl" lang="he">כל יום</span>) uses a single time for the whole week; **By weekday** (<span dir="rtl" lang="he">לפי ימים</span>) lets you enable or disable each day and set a different time per enabled day
- **In-App User Guide**: Open **User guide** (<span dir="rtl" lang="he">מדריך שימוש</span>) for a Hebrew walkthrough of every major screen and feature; the guide includes the support email for feedback and questions
- **Contact & support**: **Contact** (<span dir="rtl" lang="he">יצירת קשר</span>) in Settings opens your mail app, or write to **[support.masa.daf@gmail.com](mailto:support.masa.daf@gmail.com)** for feedback, technical support, and suggestions
- **Interactive Notification Actions** (Hebrew in the app):  
  - <span dir="rtl" lang="he">✅ סיימתי את הדף!</span> — mark the current cycle page as learned from the notification  
  - <span dir="rtl" lang="he">⏰ הזכר לי עוד שעה</span> — snooze for one hour
- **Theme Selection**: Choose between Light, Dark, or System-based theme modes
- **Study Link Mode** (<span dir="rtl" lang="he">כפתורי לימוד</span>): Show **Sefaria**, **Tzurat Hadaf**, or **both** on the Home dashboard and Calendar day card
- **Date Display Preferences**: Toggle visibility of Gregorian date alongside Hebrew date
- **Calendar Daf Labels**: Toggle whether each calendar cell shows that day's Daf number (<span dir="rtl" lang="he">הצג דף בלוח שנה</span>)
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
- **Splash Screen**: Elegant branded loading screen on app launch with a random inspirational quote about Torah learning
- **Tab Navigation**: Intuitive bottom tab bar with Home, Calendar, History, and Settings; Tzurat Hadaf opens as a full-screen modal over the tabs
- **Offline-First (progress tracking)**: Mark learned, calendar, history, and settings work without internet; **Tzurat Hadaf** needs network on first load per page, then serves from on-device cache
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
- **Study / Tzurat Hadaf**: [daf-yomi.com](https://daf-yomi.com) Vilna page PDFs, [Sefaria Manuscripts API](https://developers.sefaria.org/reference/get-manuscripts) (fallback), [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) (page cache), [react-native-webview](https://docs.expo.dev/versions/latest/sdk/webview/) (PDF/image viewer).
- **Calendar Logic**: [@hebcal/core](https://www.npmjs.com/package/@hebcal/core) & `@hebcal/learning`.
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) & [react-native-confetti-cannon](https://www.npmjs.com/package/react-native-confetti-cannon).
- **Share card capture**: [react-native-view-shot](https://github.com/gre/react-native-view-shot) (`captureRef`) and [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) plus [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) — native modules; use a **development build** or release APK, not Expo Go.


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

Three GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) | Pull requests and pushes to `master` | TypeScript check + Expo validation (`npm run ci`) |
| [`.github/workflows/build-android.yml`](./.github/workflows/build-android.yml) | Push to `release/**` or manual dispatch | EAS local APK build + GitHub Release |
| [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) | After successful APK build (`workflow_run`) or manual dispatch | Update [`docs/latest.json`](./docs/latest.json) and deploy [GitHub Pages](https://shmuli2015.github.io/daf-yomi-app/) |

**Quality checks** (`ci.yml`): runs `tsc --noEmit` and `expo-doctor` on every PR and `master` push (~2 min). Locally: `npm run ci`.

**APK build** (`build-android.yml`): runs the same quality checks, then a local EAS Android preview APK (`eas build … --profile preview --local`); requires `EXPO_TOKEN` in repository secrets. On `release/**` pushes only: the APK is renamed to `{releaseApkBasename}-{version}.apk` (see `expo.extra.releaseApkBasename` in [`app.config.js`](./app.config.js), default `masa-daf`), published as GitHub Release `vX.Y.Z`, and older releases are removed. Every run uploads `*.apk` as a short-lived workflow artifact.

**Download page** (`deploy-pages.yml`): reads the latest GitHub Release and writes `docs/latest.json` so the download page and in-app updater point at the current APK. Deploys automatically after a successful release-branch APK build (does not run on `master` push — branch protection and merge timing make that unreliable). Use **Run workflow** manually if you change `docs/` without a new APK.

**Maintainer checklist for a release**

1. Run `npm run release` to bump the patch version, create a `release/X.Y.Z` branch, and push it (starts the APK build on that branch).
2. Open a pull request from `release/X.Y.Z` into `master` and merge after the **CI** quality check passes.
3. Confirm the GitHub Release published with the APK asset named `{releaseApkBasename}-X.Y.Z.apk`, and that [GitHub Pages](https://shmuli2015.github.io/daf-yomi-app/) shows the new version.

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
