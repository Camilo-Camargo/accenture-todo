import { Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { RemoteConfig, fetchAndActivate, getRemoteConfig, getValue } from 'firebase/remote-config';
import { firebaseConfig } from '../firebase.config';
import { StorageService } from './storage.service';

const FLAG_KEYS = ['enableCategories', 'enableDevTools'] as const;
type FlagKey = (typeof FLAG_KEYS)[number];

const FETCH_INTERVAL_MS = 60_000;
const storageKey = (key: FlagKey) => `flags.${key}`;

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private storage = inject(StorageService);
  private remoteConfig?: RemoteConfig;

  private readonly states: Record<FlagKey, WritableSignal<boolean>> = {
    enableCategories: signal(true),
    enableDevTools: signal(true),
  };

  readonly enableCategories: Signal<boolean> = this.states.enableCategories.asReadonly();
  readonly enableDevTools: Signal<boolean> = this.states.enableDevTools.asReadonly();

  async init(): Promise<void> {
    // Apply the cached values immediately so the UI doesn't flicker on cold start.
    for (const key of FLAG_KEYS) {
      const cached = await this.storage.get<boolean>(storageKey(key));
      if (cached !== null) this.states[key].set(cached);
    }

    try {
      const app = initializeApp(firebaseConfig);
      this.remoteConfig = getRemoteConfig(app);
      this.remoteConfig.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
      this.remoteConfig.defaultConfig = Object.fromEntries(FLAG_KEYS.map((k) => [k, true]));
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
    for (const key of FLAG_KEYS) {
      const value = getValue(this.remoteConfig, key).asBoolean();
      this.states[key].set(value);
      await this.storage.set(storageKey(key), value);
    }
  }
}
