import { provideAppInitializer, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { LanguageService } from './app/core/services/language.service';
import { TaskService } from './app/core/services/task.service';

registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }), // Force iOS look on Android too.
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideTranslateService({ fallbackLang: 'en', lang: 'es' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    {
      provide: Storage,
      useFactory: () =>
        new Storage({
          name: 'todos',
          driverOrder: [CordovaSQLiteDriver._driver, 'indexeddb', 'localstorage'],
        }),
    },
    provideAppInitializer(() => {
      // Fire-and-forget so the app renders fast; services await ready internally.
      void inject(LanguageService).init();
      void inject(TaskService).hydrate();
    }),
  ],
});
