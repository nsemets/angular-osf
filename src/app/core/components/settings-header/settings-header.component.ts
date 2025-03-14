import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@core/components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'osf-settings-header',
  imports: [BreadcrumbComponent],
  templateUrl: './settings-header.component.html',
  styleUrl: './settings-header.component.scss',
})
export class SettingsHeaderComponent {}
