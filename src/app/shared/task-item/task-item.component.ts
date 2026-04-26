import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { checkmark, trashOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { Task } from '../../core/models/task.model';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  imports: [DatePipe, IonIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItemComponent {
  readonly task = input.required<Task>();
  readonly toggle = output<string>();
  readonly remove = output<string>();
  readonly lang = inject(LanguageService).current;

  constructor() {
    addIcons({ checkmark, trashOutline });
  }

  onToggle(): void {
    this.toggle.emit(this.task().id);
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.task().id);
  }
}
