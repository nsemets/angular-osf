import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { SubHeaderComponent } from '@osf/shared/components';

@Component({
  selector: 'osf-new-registration',
  imports: [SubHeaderComponent, TranslatePipe],
  templateUrl: './new-registration.component.html',
  styleUrl: './new-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewRegistrationComponent {
  private readonly fb = inject(FormBuilder);
  draftForm = this.fb.group({
    provider: [''],
  });
}
