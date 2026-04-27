import { Component, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline, pricetagsOutline, settingsOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';
import { FeatureFlagsService } from '../core/services/feature-flags.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TranslatePipe],
})
export class TabsPage {
  readonly enableCategories = inject(FeatureFlagsService).enableCategories;

  constructor() {
    addIcons({ checkboxOutline, pricetagsOutline, settingsOutline });
  }
}
