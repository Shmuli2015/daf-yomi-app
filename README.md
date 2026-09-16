<div dir="ltr" lang="en">

# <span dir="rtl" lang="he">מסע דף</span> (Masa Daf) - Daf Yomi Tracker

**<span dir="rtl" lang="he">מסע דף</span>** is a premium, modern mobile application designed for the global Daf Yomi community. Built with a focus on high-end aesthetics, Hebrew localization, and a seamless user experience, it helps you stay consistent on your journey through Shas.

**Version:** See the `version` field in [`package.json`](./package.json). Expo picks it up in [`app.config.js`](./app.config.js), and the app shows it in Settings (via `expo-constants`), so one source of truth stays in sync.

**App updates (APK sideload):** The app compares the installed build against the latest published APK using the public GitHub Releases API (see [`src/services/appUpdate.ts`](./src/services/appUpdate.ts)). When a newer version is available, **Download & install** (<span dir="rtl" lang="he">הורד והתקן</span>) downloads the APK in-app and opens Android’s install screen (see [`src/services/apkInstall.ts`](./src/services/apkInstall.ts)). **First install / share link:** [Download page](https://shmuli2015.github.io/daf-yomi-app/) (`docs/` on GitHub Pages): one Hebrew button, no GitHub UI. Configure the repository in `expo.extra` inside [`app.config.js`](./app.config.js) (`githubOwner`, `githubRepo`, `releaseApkBasename`, `downloadPageUrl`, `updateCheckEnabled`). **Automatic update notifications** (<span dir="rtl" lang="he">התראות עדכון אוטומטיות</span>) are optional and **off** by default.

---

## App Functions

### 🏠 Home Dashboard
- **Day Navigation**: Prev/next arrows on the dashboard move between calendar days for that day's Daf; tap the dates to jump back to today, or use **Return to today** (<span dir="rtl" lang="he">חזור להיום</span>) when you have moved away from the real calendar date
- **Yesterday's Daf Catch-up Nudge** (<span dir="rtl" lang="he">שכחת לסמן אתמול?</span>): When opening the app on the current day, if yesterday's Daf was not yet marked as learned, a top reminder banner appears. Tap **Mark** (<span dir="rtl" lang="he">סמן</span>) to quickly mark yesterday's Daf as learned without leaving today's view, tap the banner to navigate to yesterday, or dismiss it for the day
- **Quick Jump to Daf** (<span dir="rtl" lang="he">קפיצה מהירה</span>): Header shortcut to jump directly to any tractate and page in Shas. Search by selecting a tractate and page from a searchable dropdown, or type the page number using numerals or Hebrew gematria (e.g. "סד", "קכ", "12"). Direct one-tap jump to the in-app reader or Sefaria
- **Today's Daf Display**: Shows the Daf Yomi for the selected day (tractate and page) with both Hebrew and Gregorian dates (Gregorian respects the visibility toggle)
- **Learning Tracker**: Tap **Mark as learned** (<span dir="rtl" lang="he">סמן כנלמד</span>) for a full page; **long press** opens a menu for **full page**, **half page (amud א)**, or **half page (amud ב)**. When half-done, the control shows **I finished the page!** (<span dir="rtl" lang="he">סיימתי את הדף!</span>); tap to upgrade to full. When fully learned, it shows **Learned** (<span dir="rtl" lang="he">אשריך! הדף נלמד</span>) and asks for confirmation before unsetting
- **Partial progress**: Half pages count as **0.5** toward tractate progress (fractional counts such as 3.5 of 10 are possible)
- **Siyum Masechet Celebration & Share** (<span dir="rtl" lang="he">סיום מסכת ושיתוף</span>): Marking the final page of a tractate triggers a festive celebration modal featuring the traditional "Hadran Alach" (<span dir="rtl" lang="he">הדרן עלך</span>) blessing, animated confetti, and an exclusive branded Siyum share card for social media and messaging
- **Masechet Progress Bar**: Visual indicator showing your progress in the current tractate
- **Sefaria Integration**: Opens the Daf in Sefaria in your **external browser** (unchanged behavior)
- **In-app Daf Reader** (<span dir="rtl" lang="he">לימוד הדף</span>): Three tabs: vocalized **Gemara** from Sefaria with **Rashi** and **Tosafot** in a bottom sheet, a continuous **Steinsaltz** commentary that weaves the Gemara into the biur, and **Chavruta**. Includes amud/daf navigation, **fullscreen mode**, **swipe gestures**, **mark as learned** header control, font size controls (`+`/`-`), and local text caching
- **Study Link Buttons**: In Settings, choose to show **Sefaria only**, **the in-app reader only**, or **both** on Home and Calendar
- **Streak Counter**: Track your consecutive days of learning to maintain momentum; half pages **do not break** the streak but **do not add** a day either
- **Interactive 7-Day Progress Chart**: In-app mini chart of the last seven days: tall bar = full page, medium bar = half page, short bar = not learned. Learned days show a checkmark indicator. Tap any day's bar to jump directly to that date's page, with the active day highlighted
- **Share progress as an image** (<span dir="rtl" lang="he">שיתוף תמונה</span>): On the streak card, tap the **share** (<span dir="rtl" lang="he">שתף</span>) control to open a preview, then **Share image** (<span dir="rtl" lang="he">שתף תמונה</span>) to export a square graphic (streak, Hebrew date, app branding) for WhatsApp Status, Instagram Stories, etc. (requires a **development or production build**, not Expo Go; see Tech Stack)
- **Personal Track Banner & Quick Overview Card** (<span dir="rtl" lang="he">מסלול אישי</span>): Track self-paced tractate study separate from the Daf Yomi cycle. Set an active tractate, view an overview card with real-time statistics (pages completed, progress percentage, next page), mark the next page directly with one tap, or open the full tractate daf grid
- **Shas Progress Card** (<span dir="rtl" lang="he">כרטיס התקדמות הש״ס</span>): Overall progress across Shas with animated progress bar and page count; tap the card to open the History screen for full tractate details
- **Confetti Celebration**: Optional festive animation when marking a Daf as learned


### 📊 History & Progress Tracking
- **Seder Filter Bar** (<span dir="rtl" lang="he">סרגל סינון סדרים</span>): Filter Shas tractates at the top of the History screen with quick tabs: All (<span dir="rtl" lang="he">הכל</span>), Zeraim, Moed, Nashim, Nezikin, Kodashim, and Taharot
- **Complete Shas Overview**: All 37 tractates (<span dir="rtl" lang="he">מסכתות</span>) grouped by **Seder** (<span dir="rtl" lang="he">סדר</span>) in collapsible sections, each with its own progress summary
- **Masechet-by-Masechet Progress**: Individual progress bars for each tractate showing pages learned (including half pages)
- **Accurate Tractate Boundaries**: 12 tractates ending on amud א' (such as Berakhot 64a, Moed Katan, Chagigah, Niddah) are strictly bounded; amud ב' is omitted and navigation continues directly to the next tractate
- **Completion Statistics**: Track total pages learned and completed tractates
- **Interactive Masechet Details**: Tap any tractate to see a daf grid; use **Mark all** (<span dir="rtl" lang="he">סמן הכל</span>) or **Clear all** (<span dir="rtl" lang="he">בטל הכל</span>) for bulk updates (with confirmation), or tap individual daf numbers to toggle. Partial daf cells use a distinct style; tapping a half page **upgrades** it to full learned (half page marking is available from Home, Calendar, and the in-app reader)
- **Daf Yomi vs. Personal Track Mode Toggle**: Within any tractate modal, switch between **Daf Yomi** (<span dir="rtl" lang="he">דף יומי</span>) and **Personal Track** (<span dir="rtl" lang="he">מסכת אישית</span>). Study and track individual tractates independently without affecting the global Daf Yomi calendar history
- **Visual Progress Hero**: Large progress ring displaying overall Shas completion percentage
- **Share Shas progress as an image**: On the History screen, use the **share** control on the hero card (same flow: preview → **Share image**) to export a branded square graphic with ring %, pages learned, and completed tractates count
- **Learned Pages Counter**: Real-time count of total pages learned across all of Shas, including half pages (e.g. 150.5)

### 📅 Hebrew Calendar View
- **Monthly Hebrew Calendar**: Hebrew dates (gematria) with gregorian day numbers per cell; optionally show each day's **Daf number** in the cell (<span dir="rtl" lang="he">הצג דף בלוח שנה</span> in Settings)
- **Month & Year Quick Picker** (<span dir="rtl" lang="he">בורר חודש ושנה</span>): Tap the Hebrew month header to open a fast picker modal for jumping directly to any Hebrew month and year (with full leap year support for Adar I and Adar II)
- **Month Tractate Banner** (<span dir="rtl" lang="he">באנר מסכתות החודש</span>): Shows the tractate(s) being studied in the currently viewed month at the top of the calendar
- **Jewish Holidays & Events** (<span dir="rtl" lang="he">חגים, מועדים וראשי חודשים</span>): Built-in Hebrew calendar event engine recognizes Rosh Chodesh, major and minor holidays, fasts, and special days, marking them with an event indicator dot and displaying their name in the day details card
- **Monthly Progress Card** (<span dir="rtl" lang="he">כרטיס התקדמות חודשית</span>): Displays monthly statistics including pages completed out of total month days, pages remaining, percentage completion, and a visual progress bar
- **Catch-up Mode** (<span dir="rtl" lang="he">השלמת פערים</span>): Tap the Catch-up button on the monthly progress card to open a modal listing all unlearned dapim up to today in the current month, with individual selection and a bulk mark action (<span dir="rtl" lang="he">סמן X דפים כנלמדו</span>)
- **Navigation**: Month arrows, **swipe left/right** to change months, and a dedicated **Return to today** (<span dir="rtl" lang="he">היום</span>) button to jump back to the current date from any month or year
- **Learned days**: Full pages use solid accent highlight; **half pages** use a lighter/semi-transparent accent with dashed border; **today** uses a highlighted accent border
- **Compact Calendar Legend**: Bottom legend clearly indicates full page, half page, today, and not yet learned
- **Selected Day Card**: Tap any date to view full Hebrew/Gregorian dates, holiday/event badge (if applicable), tractate and daf, learning status badge, direct **Study Daf** (<span dir="rtl" lang="he">לימוד הדף</span>) button into the in-app reader, and quick mark / unmark. **Long press** the mark control for the half page menu (Amud A / Amud B). When a half page is recorded, an explicit status badge indicates which amud was studied (<span dir="rtl" lang="he">עמוד א׳ נלמד</span> / <span dir="rtl" lang="he">עמוד ב׳ נלמד</span>)
- **Future dates**: Option to mark **learned ahead** (<span dir="rtl" lang="he">למדתי מראש</span>) when you have already studied that calendar day's page

### ⚙️ Settings & Customization
- **App updates** (<span dir="rtl" lang="he">עדכוני אפליקציה</span>): **Check for updates** (<span dir="rtl" lang="he">בדוק עדכונים</span>) checks GitHub; when a newer APK exists, a modal offers **Download & install** in-app (Android) and shows Whats New highlights from the GitHub Release body. After install, a **מה חדש** window lists what changed (skipped versions are merged, up to 8 unique bullets). **Automatic update notifications** default to **off**. Fallback: **Download in browser** opens the simple [download page](https://shmuli2015.github.io/daf-yomi-app/). Tapping **later** suppresses automatic prompts for that version until a newer release ships. **Share download link** (<span dir="rtl" lang="he">שתף קישור להורדה</span>) sends the install page to friends via the system share sheet. Settings can reopen **מה חדש בגרסה זו**.
- **Notifications Master Switch**: Toggle **Daily reminder** (<span dir="rtl" lang="he">תזכורת יומית</span>) on or off; when off, no reminders are scheduled
- **Daily Notifications**: When reminders are enabled, choose one time for every day or set up per-day behavior
- **Notification Mode**: **Every day** (<span dir="rtl" lang="he">כל יום</span>) uses a single time for the whole week; **By weekday** (<span dir="rtl" lang="he">לפי ימים</span>) lets you enable or disable each day and set a different time per enabled day
- **In-App User Guide**: Open **User guide** (<span dir="rtl" lang="he">מדריך שימוש</span>) for a Hebrew walkthrough of every major screen and feature; the guide includes the support email for feedback and questions
- **Contact & support**: **Contact** (<span dir="rtl" lang="he">יצירת קשר</span>) in Settings opens your mail app, or write to **[support.masa.daf@gmail.com](mailto:support.masa.daf@gmail.com)** for feedback, technical support, and suggestions
- **Interactive Notification Actions** (Hebrew in the app):  
  - <span dir="rtl" lang="he">✅ סיימתי את הדף!</span>: mark the current cycle page as learned from the notification  
  - <span dir="rtl" lang="he">⏰ הזכר לי עוד שעה</span>: snooze for one hour
- **Theme Selection**: Choose between Light, Dark, or System-based theme modes
- **Date Display Preferences**: Toggle visibility of Gregorian date alongside Hebrew date
- **Calendar Daf Labels**: Toggle whether each calendar cell shows that day's Daf number (<span dir="rtl" lang="he">הצג דף בלוח שנה</span>)
- **Personal Track Banner Toggle**: Toggle visibility of the Personal Track banner on the Home dashboard (<span dir="rtl" lang="he">באנר מסלול אישי בבית</span>)
- **Confetti Effects Toggle**: Enable/disable celebration animations
- **Backup & restore** (<span dir="rtl" lang="he">גיבוי ושחזור</span>): **Save backup to file** writes a JSON backup to a folder on device; **Share backup** sends it via WhatsApp, Drive, etc.; **Import backup** restores from a previous file with a preview. On import, **Merge with existing data** keeps the newer record per date; **Replace all** wipes local data and replaces it with the backup. Recommended before reset or when moving to a new device
- **Data Management & Reset Options** (<span dir="rtl" lang="he">איפוס נתונים</span>): Choose between 3 granular reset modes: **Daf Yomi records only** (<span dir="rtl" lang="he">ניקוי נתוני הדף היומי</span>), **Personal Track records only** (<span dir="rtl" lang="he">ניקוי מסלול אישי בלבד</span>), or **Complete app reset** (<span dir="rtl" lang="he">איפוס כללי מלא</span>)
- **Privacy-First**: All data stored locally on device with SQLite database

### 🔔 Smart Notifications
- **Daily Learning Reminders**: Scheduled at your preferred time(s) while **Daily reminder** (<span dir="rtl" lang="he">תזכורת יומית</span>) stays enabled
- **Dynamic Daf Information**: Notifications show today's tractate and page number
- **Interactive Actions**: Quick actions directly from notification tray
- **Snooze Functionality**: One-hour follow-up via <span dir="rtl" lang="he">⏰ הזכר לי עוד שעה</span>
- **Expo Go**: Local notification scheduling still runs, but behavior can differ from dev/production builds; use a **development build** for full parity
- **Android exact alarms** (API 31+): For reminders at an exact time (e.g. 7:30), grant **Schedule exact alarms** (<span dir="rtl" lang="he">תזמון התראות מדויק</span>) in system settings. Without it, `expo-notifications` falls back to approximate timing. Settings shows **Exact reminders** (<span dir="rtl" lang="he">תזכורות מדויקות</span>) status on Android; tap to open the permission screen. Requires a **development or production build** (not Expo Go) for the status check
- **Auto-scheduling**: Notifications automatically reschedule on device reboot
- **Per-Day Customization**: In **By weekday** (<span dir="rtl" lang="he">לפי ימים</span>) mode, turn individual weekdays on or off and assign each enabled day its own time
- **Hebrew Text**: All notifications in Hebrew for native speaker experience

### 📱 User Experience
- **Full RTL Support**: Complete Right-to-Left layout optimized for Hebrew
- **Haptic Feedback** (<span dir="rtl" lang="he">משוב רטט</span>): Tactile vibration feedback powered by `expo-haptics` upon marking pages, toggling states, and navigating
- **Hebrew Gematria Parser**: Automatic resolution of Hebrew letter numbering (e.g. "סד", "קכ") or Arabic numerals for rapid page lookup
- **Smooth Animations**: Powered by React Native Reanimated for fluid transitions
- **Splash Screen**: Elegant branded loading screen on app launch with a random inspirational quote about Torah learning
- **Tab Navigation**: Intuitive bottom tab bar with Home, Calendar, History, and Settings; the Daf reader opens as a full-screen modal over the tabs
- **Offline-First (progress tracking)**: Mark learned, calendar, history, and settings work without internet; the reader needs network on first load per page, then serves from on-device cache
- **Platform Support**: Runs on iOS, Android, and Web
- **Dark Mode**: Sophisticated dark theme with gold accents for premium "Seforim" aesthetic
- **Light Mode**: Clean, bright interface for daytime use
- **System Theme**: Automatically adapts to device theme settings


### 💾 Data Persistence
- **Local SQLite Database**: Lightning-fast local storage for all learning records
- **JSON backup export/import**: Full learning history and settings can be exported to a JSON file and restored on another device (no cloud server)
- **Zustand State Management**: Reactive UI with efficient state updates
- **Progress Caching**: Optimized calculations for instant performance
- **Date-based Records**: Track every Daf by date with learned, partial (half page), or missed status
- **Settings Persistence**: All preferences saved and restored on app restart

---

## Tech Stack

- **Core**: [Expo](https://expo.dev/) & [React Native](https://reactnative.dev/) (TypeScript)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) & Vanilla CSS for custom animations.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for reactive UI states.
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for lightning-fast local persistence.
- **Study texts**: [Sefaria API](https://www.sefaria.org) (vocalized Gemara, Rashi, Tosafot, Steinsaltz), Torat Emet (Chavruta), [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) (text cache).
- **Calendar Logic**: [@hebcal/core](https://www.npmjs.com/package/@hebcal/core) & `@hebcal/learning`.
- **Animations**: [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/) & [react-native-confetti-cannon](https://www.npmjs.com/package/react-native-confetti-cannon).
- **Share card capture**: [react-native-view-shot](https://github.com/gre/react-native-view-shot) (`captureRef`) and [expo-sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) plus [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) (native modules; use a **development build** or release APK, not Expo Go).


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

**Download page** (`deploy-pages.yml`): reads the latest GitHub Release and writes `docs/latest.json` so the download page and in-app updater point at the current APK. Deploys automatically after a successful release-branch APK build (does not run on `master` push because branch protection and merge timing make that unreliable). Use **Run workflow** manually if you change `docs/` without a new APK.

**Whats New notes:** Before each release, add an entry for the **next** version in [`src/data/whatsNew.ts`](./src/data/whatsNew.ts) (Hebrew bullets). `npm run release` fails without it. The GitHub Release body and the in-app lists (pre-download modal, post-install **מה חדש**, Settings) come from that file. Unique bullets are capped at 8 overall. After install, skipped versions are merged (newest first) up to that cap. Older GitHub Releases are deleted, so the latest body is built from remaining file entries.

**Maintainer checklist for a release**

1. Add a `WHATS_NEW` entry for the next version in [`src/data/whatsNew.ts`](./src/data/whatsNew.ts).
2. Run `npm run release` to bump the patch version, create a `release/X.Y.Z` branch, and push it (starts the APK build on that branch).
3. Open a pull request from `release/X.Y.Z` into `master` and merge after the **CI** quality check passes.
4. Confirm the GitHub Release published with the APK asset named `{releaseApkBasename}-X.Y.Z.apk`, and that [GitHub Pages](https://shmuli2015.github.io/daf-yomi-app/) shows the new version.

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
