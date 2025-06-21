import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'osf-registries',
  imports: [RouterModule],
  templateUrl: './registries.component.html',
  styleUrl: './registries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistriesComponent {}
