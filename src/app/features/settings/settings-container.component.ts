import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsHeaderComponent } from '@core/components/settings-header/settings-header.component';

@Component({
  selector: 'osf-settings-container',
  imports: [RouterOutlet, SettingsHeaderComponent],
  templateUrl: './settings-container.component.html',
  styleUrl: './settings-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsContainerComponent {}
