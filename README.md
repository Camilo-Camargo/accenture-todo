# Accenture To-Do

Ionic + Cordova to-do app with persistent SQLite storage, runtime i18n (es/en) and shared iOS-style UI on Android & iOS.

## Stack

Angular 20 (standalone, signals) · Ionic 8 · Cordova 13 · `@ionic/storage-angular` (SQLite) · ngx-translate 17

## v1 features

- Add tasks via the input box (Enter or `+` button)
- Tap a task to toggle done; completed tasks fade and move to the bottom automatically
- Persistent storage on SQLite — tasks survive app restarts
- Runtime language switcher (Spanish / English) — persisted, applies to UI labels and date formatting
- Shared iOS-style UI on Android (forced via `provideIonicAngular({ mode: 'ios' })`)
- Settings screen shows storage driver, language and app version

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

With make:

```bash
make apk   # debug + unsigned release APKs in platforms/android/app/build/outputs/apk/
make ipa   # unsigned IPA at platforms/ios/build/Todos.ipa
```

Without make:

```bash
# APK
ionic cordova prepare android
cd platforms/android && ./gradlew assembleRelease assembleDebug

# IPA (unsigned, for sideloading / testing)
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
│   ├── models/          domain types
│   ├── repositories/    persistence (SQLite via ionic-storage)
│   └── services/        signal-based state, i18n, id generation
├── shared/              reusable presentational components
├── tasks/               feature page
├── settings/            feature page
└── tabs/                navigation shell
```

Storage falls back automatically: `cordova-sqlite-storage` on device → IndexedDB on web → LocalStorage as last resort.
