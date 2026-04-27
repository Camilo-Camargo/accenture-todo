import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { LanguageService } from '../../core/services/language.service';
import { CategoryPickerComponent, PickerOption } from '../category-picker/category-picker.component';

export interface TaskInputAddEvent {
  title: string;
  categoryId?: string;
}

const NONE_KEY = '__none__';

@Component({
  selector: 'app-task-input',
  templateUrl: './task-input.component.html',
  styleUrls: ['./task-input.component.scss'],
  imports: [FormsModule, IonIcon, TranslatePipe, CategoryPickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskInputComponent {
  private translate = inject(TranslateService);
  private lang = inject(LanguageService).current;

  readonly categories = input<Category[]>([]);
  readonly showCategorySelector = input(false);
  readonly add = output<TaskInputAddEvent>();

  readonly title = signal('');
  readonly selectedCategoryId = signal<string | undefined>(undefined);

  readonly pickerOptions = computed<PickerOption[]>(() => {
    this.lang(); // re-run on language change
    return [
      { key: NONE_KEY, label: this.translate.instant('categories.none') },
      ...this.categories().map((c) => ({ key: c.id, label: c.name, color: c.color })),
    ];
  });

  readonly pickerSelected = computed(() => this.selectedCategoryId() ?? NONE_KEY);

  constructor() {
    addIcons({ add });
  }

  onPick(key: string): void {
    this.selectedCategoryId.set(key === NONE_KEY ? undefined : key);
  }

  submit(): void {
    const value = this.title().trim();
    if (!value) return;
    this.add.emit({ title: value, categoryId: this.selectedCategoryId() });
    this.title.set('');
  }
}
