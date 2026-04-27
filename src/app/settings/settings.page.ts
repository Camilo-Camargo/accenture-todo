import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { StorageService } from '../core/services/storage.service';
import { AppLang, LanguageService } from '../core/services/language.service';
import { TaskService } from '../core/services/task.service';
import { CategoryService } from '../core/services/category.service';
import { FeatureFlagsService } from '../core/services/feature-flags.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private storage = inject(StorageService);
  private language = inject(LanguageService);
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);
  private flags = inject(FeatureFlagsService);

  readonly currentLang = this.language.current;
  readonly languages = this.language.supported;
  readonly driver = computed(() => (this.storage.ready() ? this.storage.driver() ?? 'unknown' : '...'));
  readonly storageError = this.storage.error;
  readonly version = '1.0.0';
  readonly enableDevTools = this.flags.enableDevTools;
  readonly taskCount = computed(() => this.taskService.tasks().length);

  readonly seedAmount = signal(500);
  readonly seeding = signal(false);

  async use(lang: AppLang): Promise<void> {
    await this.language.use(lang);
  }

  async seed(): Promise<void> {
    this.seeding.set(true);
    try {
      const ids = this.categoryService.categories().map((c) => c.id);
      await this.taskService.seed(this.seedAmount(), ids);
    } finally {
      this.seeding.set(false);
    }
  }

  async clearAll(): Promise<void> {
    if (!confirm('Delete all tasks?')) return;
    await this.taskService.clearAll();
  }
}
