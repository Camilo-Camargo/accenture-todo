import { Injectable, Signal, inject, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);
  private store?: Storage;

  private readonly _ready = signal(false);
  private readonly _error = signal<string | null>(null);
  readonly ready: Signal<boolean> = this._ready.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();

  private readyPromise = this.init();

  private async init(): Promise<void> {
    try {
      await this.awaitDeviceReady();
      try {
        await this.storage.defineDriver(CordovaSQLiteDriver);
      } catch (err) {
        console.warn('[Storage] defineDriver failed, falling back', err);
      }
      this.store = await this.storage.create();
      this._ready.set(true);
      console.info('[Storage] ready, driver:', this.store.driver);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Storage] init failed:', err);
      this._error.set(msg);
      throw err;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.readyPromise;
    try {
      return (await this.store!.get(key)) ?? null;
    } catch (err) {
      console.error('[Storage] get(' + key + ') failed:', err);
      this._error.set(err instanceof Error ? err.message : String(err));
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.readyPromise;
    try {
      await this.store!.set(key, value);
      console.info('[Storage] set(' + key + ') OK');
    } catch (err) {
      console.error('[Storage] set(' + key + ') failed:', err);
      this._error.set(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  driver(): string | null {
    return this.store?.driver ?? null;
  }

  private awaitDeviceReady(): Promise<void> {
    if (!('cordova' in window)) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      document.addEventListener('deviceready', done, { once: true });
      setTimeout(done, 3000);
    });
  }
}
