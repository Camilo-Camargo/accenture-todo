# Accenture To-Do

🇬🇧 English · [🇪🇸 Español](README.es.md)

Ionic + Cordova to-do app with categories, persistent SQLite storage, runtime i18n (es/en),
Firebase Remote Config feature flags and cursor-based pagination.

## Stack

Angular 20 (standalone, signals) · Ionic 8 · Cordova 13 · `@ionic/storage-angular` (SQLite) ·
ngx-translate 17 · Firebase Remote Config

## Features

**Tasks**
- Add tasks via the input box (Enter or `+` button)
- Tap a task to toggle done — completed tasks fade and move to the bottom
- Tap the trash icon to delete (subtle, only visible on hover/touch)
- Cursor pagination: 50 tasks per page, the next page preloads when you've scrolled 2/3 down

**Categories** *(gated by `enableCategories` flag)*
- Create, edit and delete categories with a color
- Assign a category when creating a task
- Filter the task list by category via a search-enabled bottom-sheet picker

**i18n**
- Runtime language switch (Spanish / English) — persisted in SQLite
- Dates format in the active language via `formatDate` + registered Angular locales

**Feature flags** *(via Firebase Remote Config)*
- `enableCategories` — toggles the entire category subsystem (tab, picker, badge, filter)
- `enableDevTools` — toggles the seed/clear helpers in Settings
- Cached value in SQLite so the UI is correct on cold start, refreshed in background
- Pull-to-refresh on the tasks page forces an immediate fetch

## Run with make

```bash
make install
make live
```

Hot reload on Android (port 8100) + iOS simulator (port 8101) at the same time.

## Run without make

```bash
npm install
ionic cordova prepare

# one platform
ionic cordova run android --livereload --external --port=8100
ionic cordova run ios --livereload --external --port=8101

# headless web preview
npx ng serve
```

## Test

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

## Build

```bash
make apk   # debug + unsigned release APKs in platforms/android/app/build/outputs/apk/
make ipa   # unsigned IPA at platforms/ios/build/Todos.ipa
```

Without make:

```bash
# APK
ionic cordova prepare android
cd platforms/android && ./gradlew assembleRelease assembleDebug

# IPA (unsigned)
cd platforms/ios && xcodebuild -workspace App.xcworkspace -scheme App \
  -configuration Release -destination "generic/platform=iOS" \
  -archivePath build/App.xcarchive archive \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

## Targets

| Command | Action |
|---|---|
| `make install` | npm install |
| `make ios` | build & run on the booted iOS simulator |
| `make android` | build & run on the running Android emulator |
| `make live` | both platforms with livereload |
| `make live-ios` / `make live-android` | one platform with livereload |
| `make apk` | build APKs (debug + release) |
| `make ipa` | build unsigned IPA |
| `make clean` | remove build outputs |

## Architecture

```
src/app/
├── core/
│   ├── models/          domain types (Task, Category)
│   ├── repositories/    persistence (storage-only)
│   └── services/        signal-based state, i18n, id, feature flags
├── shared/              reusable presentational components
│   ├── task-input/
│   ├── task-item/
│   └── category-picker/   bottom-sheet picker reused by filter and selector
├── tasks/               feature page
├── categories/          feature page
├── settings/            feature page
└── tabs/                navigation shell
```

Storage falls back automatically: `cordova-sqlite-storage` on device → IndexedDB on web →
LocalStorage as last resort.

## Performance

- **Cursor pagination** in the tasks list (50/page, preloads at 33%)
- **Cached feature flags** in SQLite so the UI is correct on cold start
- **Fire-and-forget service init** at bootstrap; hydrate runs in the background
- **Repository pattern** isolates storage so the persistence driver can be swapped in one file

## Reflections

### What were the main challenges you faced implementing the new features?

The bootstrap. Modern Ionic / Angular is designed first for Capacitor; Cordova still works
by backward compatibility but lags behind — the WebView isn't a secure context (so
`crypto.randomUUID` is missing in livereload), and native plugins (SQLite, status bar,
keyboard) only respond after `deviceready`, well after Angular has booted. Most of the
boot complexity was filling those gaps.

### What performance optimization techniques did you apply, and why?

Cursor pagination on the tasks list (50/page, preloads at 33%) so the DOM stays small no
matter how many tasks you have; on-demand data refresh (pull-to-refresh + Remote Config
throttle bypass) so a flag toggle propagates in seconds without a redeploy; and a single
reusable picker component instead of two duplicated dropdowns.

### How did you ensure code quality and maintainability?

`core/shared/feature` folders, repository pattern (swapping storage is one file),
`IdService` and `StorageService` keep platform APIs out of the rest of the code, unit
tests on `TaskService` and `CategoryService`, signals + standalone components throughout.
