import { Injectable, Signal, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './storage.service';

export type AppLang = 'es' | 'en';
const SUPPORTED: readonly AppLang[] = ['es', 'en'] as const;
const STORAGE_KEY = 'app-lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private storage = inject(StorageService);

  private readonly _current = signal<AppLang>('en');
  readonly current: Signal<AppLang> = this._current.asReadonly();
  readonly supported: readonly AppLang[] = SUPPORTED;

  async init(): Promise<void> {
    const stored = await this.storage.get<AppLang>(STORAGE_KEY);
    const browser = (this.translate.getBrowserLang() ?? 'en') as AppLang;
    const lang = stored ?? (SUPPORTED.includes(browser) ? browser : 'en');
    this.translate.use(lang);
    this._current.set(lang);
  }

  async use(lang: AppLang): Promise<void> {
    this.translate.use(lang);
    this._current.set(lang);
    await this.storage.set(STORAGE_KEY, lang);
  }
}
