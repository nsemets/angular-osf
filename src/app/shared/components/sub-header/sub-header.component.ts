import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { IS_XSMALL } from '@shared/utils/breakpoints.tokens';

@Component({
  selector: 'osf-sub-header',
  imports: [Button, Tooltip],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubHeaderComponent {
  showButton = input<boolean>(false);
  buttonLabel = input<string>('');
  title = input<string>('');
  icon = input<string>('');
  tooltip = input<string>('');
  description = input<string>('');
  buttonClick = output<void>();
  #isXSmall$ = inject(IS_XSMALL);
  isXSmall = toSignal(this.#isXSmall$);
}
