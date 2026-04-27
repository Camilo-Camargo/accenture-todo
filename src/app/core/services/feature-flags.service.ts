import { Injectable, Signal, inject, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { RemoteConfig, fetchAndActivate, getRemoteConfig, getValue } from 'firebase/remote-config';
import { firebaseConfig } from '../firebase.config';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'flags.enableCategories';
const FETCH_INTERVAL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private storage = inject(StorageService);

  private readonly _enableCategories = signal(true);
  readonly enableCategories: Signal<boolean> = this._enableCategories.asReadonly();

  private remoteConfig?: RemoteConfig;

  async init(): Promise<void> {
    // Apply the cached value immediately so the UI doesn't flicker on cold start.
    const cached = await this.storage.get<boolean>(STORAGE_KEY);
    if (cached !== null) this._enableCategories.set(cached);

    try {
      const app = initializeApp(firebaseConfig);
      this.remoteConfig = getRemoteConfig(app);
      this.remoteConfig.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
      this.remoteConfig.defaultConfig = { enableCategories: true };
      await fetchAndActivate(this.remoteConfig);
      await this.applyFromRemote();
    } catch (err) {
      console.warn('[FeatureFlags] Remote Config unavailable, using cached / default', err);
    }
  }

  async refresh(): Promise<void> {
    if (!this.remoteConfig) return;
    // Drop the throttle so pull-to-refresh always hits the network.
    this.remoteConfig.settings.minimumFetchIntervalMillis = 0;
    try {
      await fetchAndActivate(this.remoteConfig);
      await this.applyFromRemote();
    } finally {
      this.remoteConfig.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
    }
  }

  private async applyFromRemote(): Promise<void> {
    if (!this.remoteConfig) return;
    const value = getValue(this.remoteConfig, 'enableCategories').asBoolean();
    this._enableCategories.set(value);
    await this.storage.set(STORAGE_KEY, value);
  }
}
