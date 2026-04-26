import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageService } from '../core/services/storage.service';
import { AppLang, LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private storage = inject(StorageService);
  private language = inject(LanguageService);

  readonly currentLang = this.language.current;
  readonly languages = this.language.supported;
  readonly driver = computed(() => (this.storage.ready() ? this.storage.driver() ?? 'unknown' : '...'));
  readonly storageError = this.storage.error;
  readonly version = '1.0.0';

  async use(lang: AppLang): Promise<void> {
    await this.language.use(lang);
  }
}
