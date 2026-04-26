import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

import { TaskService } from '../core/services/task.service';
import { LanguageService } from '../core/services/language.service';
import { Task } from '../core/models/task.model';
import { TaskInputComponent } from '../shared/task-input/task-input.component';
import { TaskItemComponent } from '../shared/task-item/task-item.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TranslatePipe,
    TaskInputComponent,
    TaskItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  private taskService = inject(TaskService);
  private language = inject(LanguageService);

  readonly tasks = computed(() =>
    [...this.taskService.tasks()].sort((a, b) => Number(a.done) - Number(b.done)),
  );
  readonly lang = this.language.current;
  readonly today = computed(() => formatDate(Date.now(), 'longDate', this.lang()));

  trackById = (_: number, t: Task) => t.id;

  onAdd(title: string): void {
    void this.taskService.add(title);
  }

  onToggle(id: string): void {
    void this.taskService.toggleDone(id);
  }

  onRemove(id: string): void {
    void this.taskService.remove(id);
  }
}
