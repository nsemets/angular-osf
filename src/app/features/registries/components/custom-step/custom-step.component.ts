import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'osf-custom-step',
  imports: [],
  templateUrl: './custom-step.component.html',
  styleUrl: './custom-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomStepComponent {}
