import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-task-input',
  templateUrl: './task-input.component.html',
  styleUrls: ['./task-input.component.scss'],
  imports: [FormsModule, IonIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskInputComponent {
  readonly add = output<string>();
  readonly title = signal('');

  constructor() {
    addIcons({ add });
  }

  submit(): void {
    const value = this.title().trim();
    if (!value) return;
    this.add.emit(value);
    this.title.set('');
  }
}
