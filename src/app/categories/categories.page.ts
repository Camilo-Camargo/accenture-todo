import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add, close, createOutline, trashOutline } from 'ionicons/icons';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

import { Category } from '../core/models/category.model';
import { CategoryService } from '../core/services/category.service';

const COLOR_OPTIONS = ['#000000', '#5b8def', '#3ec28f', '#f4a72a', '#e94f4f', '#a163d9'];

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  imports: [FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  private categoryService = inject(CategoryService);

  readonly categories = this.categoryService.categories;
  readonly colors = COLOR_OPTIONS;

  readonly editingId = signal<string | null>(null);
  readonly draftName = signal('');
  readonly draftColor = signal(COLOR_OPTIONS[0]);

  readonly isEditing = computed(() => this.editingId() !== null);

  constructor() {
    addIcons({ add, close, createOutline, trashOutline });
  }

  startCreate(): void {
    this.editingId.set('new');
    this.draftName.set('');
    this.draftColor.set(COLOR_OPTIONS[0]);
  }

  startEdit(c: Category): void {
    this.editingId.set(c.id);
    this.draftName.set(c.name);
    this.draftColor.set(c.color);
  }

  cancel(): void {
    this.editingId.set(null);
  }

  async submit(): Promise<void> {
    const id = this.editingId();
    const name = this.draftName().trim();
    const color = this.draftColor();
    if (!name || !id) return;
    if (id === 'new') {
      await this.categoryService.add(name, color);
    } else {
      await this.categoryService.update(id, { name, color });
    }
    this.editingId.set(null);
  }

  async remove(id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}
