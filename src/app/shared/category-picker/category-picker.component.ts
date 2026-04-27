import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, chevronDown, close, searchOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';

export interface PickerOption {
  key: string;
  label: string;
  color?: string;
}

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  imports: [FormsModule, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryPickerComponent {
  readonly options = input.required<PickerOption[]>();
  readonly selectedKey = input.required<string>();
  readonly select = output<string>();

  readonly isOpen = signal(false);
  readonly query = signal('');

  readonly current = computed(() =>
    this.options().find((o) => o.key === this.selectedKey()),
  );

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  constructor() {
    addIcons({ checkmark, chevronDown, close, searchOutline });
  }

  open(): void {
    this.query.set('');
    this.isOpen.set(true);
  }

  dismiss(): void {
    this.isOpen.set(false);
  }

  pick(key: string): void {
    this.select.emit(key);
    this.dismiss();
  }
}
