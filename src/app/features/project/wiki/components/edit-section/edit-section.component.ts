import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'osf-edit-section',
  imports: [PanelModule, Button, TranslatePipe],
  templateUrl: './edit-section.component.html',
  styleUrl: './edit-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSectionComponent {}
