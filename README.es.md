# Accenture To-Do

[🇬🇧 English](README.md) · 🇪🇸 Español

App de tareas Ionic + Cordova con categorías, almacenamiento SQLite persistente, i18n en
tiempo real (es/en), feature flags vía Firebase Remote Config y paginación por cursor.

## Stack

Angular 20 (standalone, signals) · Ionic 8 · Cordova 13 · `@ionic/storage-angular` (SQLite) ·
ngx-translate 17 · Firebase Remote Config

## Funcionalidades

**Tareas**
- Agregar tareas con el input (Enter o el botón `+`)
- Tap en una tarea para marcarla como completada — las completadas se atenúan y bajan al final
- Tap en el ícono basurero para eliminar (sutil, sólo visible en hover/touch)
- Paginación por cursor: 50 tareas por página, la siguiente se precarga al pasar 2/3 del scroll

**Categorías** *(controlado por el flag `enableCategories`)*
- Crear, editar y eliminar categorías con un color
- Asignar una categoría al crear una tarea
- Filtrar la lista de tareas por categoría con un picker bottom-sheet con búsqueda

**i18n**
- Cambio de idioma en tiempo real (Español / Inglés) — persistido en SQLite
- Las fechas se formatean en el idioma activo vía `formatDate` + locales de Angular registrados

**Feature flags** *(vía Firebase Remote Config)*
- `enableCategories` — activa todo el subsistema de categorías (tab, picker, badge, filtro)
- `enableDevTools` — activa los helpers de seed/clear en Settings
- Valor cacheado en SQLite para que la UI sea correcta en cold start, refrescado en background
- Pull-to-refresh en la página de tasks fuerza un fetch inmediato

## Correr con make

```bash
make install
make live
```

Hot reload en Android (puerto 8100) + simulador iOS (puerto 8101) al mismo tiempo.

## Correr sin make

```bash
npm install
ionic cordova prepare

# una sola plataforma
ionic cordova run android --livereload --external --port=8100
ionic cordova run ios --livereload --external --port=8101

# preview headless en web
npx ng serve
```

## Tests

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

## Build

```bash
make apk   # APKs debug + release sin firmar en platforms/android/app/build/outputs/apk/
make ipa   # IPA sin firmar en platforms/ios/build/Todos.ipa
```

Sin make:

```bash
# APK
ionic cordova prepare android
cd platforms/android && ./gradlew assembleRelease assembleDebug

# IPA (sin firmar)
cd platforms/ios && xcodebuild -workspace App.xcworkspace -scheme App \
  -configuration Release -destination "generic/platform=iOS" \
  -archivePath build/App.xcarchive archive \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

## Targets

| Comando | Acción |
|---|---|
| `make install` | npm install |
| `make ios` | build y correr en el simulador iOS booted |
| `make android` | build y correr en el emulador Android activo |
| `make live` | ambas plataformas con livereload |
| `make live-ios` / `make live-android` | una sola plataforma con livereload |
| `make apk` | build de APKs (debug + release) |
| `make ipa` | build de IPA sin firmar |
| `make clean` | borrar outputs de build |

## Arquitectura

```
src/app/
├── core/
│   ├── models/          tipos de dominio (Task, Category)
│   ├── repositories/    persistencia (sólo storage)
│   └── services/        estado con signals, i18n, id, feature flags
├── shared/              componentes presentacionales reusables
│   ├── task-input/
│   ├── task-item/
│   └── category-picker/   picker bottom-sheet reusado por filtro y selector
├── tasks/               feature page
├── categories/          feature page
├── settings/            feature page
└── tabs/                shell de navegación
```

El storage cae automático: `cordova-sqlite-storage` en device → IndexedDB en web →
LocalStorage como último recurso.

## Performance

- **Paginación por cursor** en la lista de tareas (50/página, precarga al 33%)
- **Feature flags cacheados** en SQLite para que la UI sea correcta en cold start
- **Init de servicios fire-and-forget** en bootstrap; hydrate corre en background
- **Repository pattern** aísla el storage para poder cambiar el driver de persistencia en un archivo

## Reflexiones

- **Mayor desafío:** el bootstrap. Ionic / Angular modernos están pensados primero para
  Capacitor; Cordova sigue funcionando por compatibilidad pero queda atrás — el WebView no
  es secure context (`crypto.randomUUID` no existe en livereload) y los plugins nativos
  (SQLite, status bar, keyboard) sólo responden después de `deviceready`, bastante después
  de que Angular booteó. La mayor parte del costo del boot fue rellenar esos huecos.
- **Optimizaciones aplicadas:** paginación por cursor, refresh de datos on-demand
  (pull-to-refresh + bypass del throttle de Remote Config), y un único componente picker
  reusable en lugar de dos dropdowns duplicados.
- **Calidad:** carpetas core/shared/feature, repository pattern (cambiar storage es un solo
  archivo), `IdService` y `StorageService` mantienen las APIs de plataforma fuera del resto
  del código, tests unitarios sobre `TaskService` y `CategoryService`, signals + standalone
  components en toda la app.
