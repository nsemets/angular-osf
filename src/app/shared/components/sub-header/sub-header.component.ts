import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'osf-sub-header',
  imports: [Button],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubHeaderComponent {
  showButton = input<boolean>(false);
  buttonLabel = input<string>('');
  title = input<string>('');
  icon = input<string>('');
  description = input<string>('');
  buttonClick = output<void>();
}
