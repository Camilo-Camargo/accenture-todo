import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { TaskService } from '../core/services/task.service';
import { LanguageService } from '../core/services/language.service';
import { CategoryService } from '../core/services/category.service';
import { FeatureFlagsService } from '../core/services/feature-flags.service';
import { Task } from '../core/models/task.model';
import { TaskInputAddEvent, TaskInputComponent } from '../shared/task-input/task-input.component';
import { TaskItemComponent } from '../shared/task-item/task-item.component';
import { CategoryPickerComponent, PickerOption } from '../shared/category-picker/category-picker.component';

const FILTER_ALL = '__all__';
const FILTER_NONE = '__none__';
const PAGE_SIZE = 50;

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    TaskInputComponent,
    TaskItemComponent,
    CategoryPickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  private taskService = inject(TaskService);
  private language = inject(LanguageService);
  private categoryService = inject(CategoryService);
  private flags = inject(FeatureFlagsService);
  private translate = inject(TranslateService);

  readonly enableCategories = this.flags.enableCategories;
  readonly categories = this.categoryService.categories;
  readonly lang = this.language.current;
  readonly today = computed(() => formatDate(Date.now(), 'longDate', this.lang()));

  readonly filterValue = signal<string>(FILTER_ALL);

  readonly filterOptions = computed<PickerOption[]>(() => {
    this.lang();
    return [
      { key: FILTER_ALL, label: this.translate.instant('tasks.filter.all') },
      { key: FILTER_NONE, label: this.translate.instant('tasks.filter.uncategorized') },
      ...this.categories().map((c) => ({ key: c.id, label: c.name, color: c.color })),
    ];
  });

  readonly filteredTasks = computed(() => {
    const all = [...this.taskService.tasks()].sort((a, b) => Number(a.done) - Number(b.done));
    if (!this.enableCategories()) return all;
    const filter = this.filterValue();
    if (filter === FILTER_ALL) return all;
    if (filter === FILTER_NONE) return all.filter((t) => !t.categoryId);
    return all.filter((t) => t.categoryId === filter);
  });

  readonly cursor = signal(PAGE_SIZE);
  readonly visibleTasks = computed(() => this.filteredTasks().slice(0, this.cursor()));
  readonly hasMore = computed(() => this.cursor() < this.filteredTasks().length);

  constructor() {
    // Reset to the first page whenever the filter changes.
    effect(() => {
      this.filterValue();
      this.cursor.set(PAGE_SIZE);
    });

    // Cursor logs are part of the dev tools — same audience as the seed buttons.
    effect(() => {
      if (!this.flags.enableDevTools()) return;
      const total = this.filteredTasks().length;
      const showing = Math.min(this.cursor(), total);
      const page = Math.ceil(this.cursor() / PAGE_SIZE);
      console.info(`[Cursor] page ${page} — showing ${showing}/${total} tasks (size ${PAGE_SIZE})`);
    });
  }

  trackById = (_: number, t: Task) => t.id;

  onAdd(event: TaskInputAddEvent): void {
    void this.taskService.add(event.title, event.categoryId);
  }

  onToggle(id: string): void {
    void this.taskService.toggleDone(id);
  }

  onRemove(id: string): void {
    void this.taskService.remove(id);
  }

  async onLoadMore(event: CustomEvent): Promise<void> {
    if (this.flags.enableDevTools()) console.info('[Cursor] load more →');
    this.cursor.update((c) => c + PAGE_SIZE);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  }

  async onRefresh(event: CustomEvent): Promise<void> {
    try {
      await this.flags.refresh();
    } finally {
      (event.target as HTMLIonRefresherElement).complete();
    }
  }
}
