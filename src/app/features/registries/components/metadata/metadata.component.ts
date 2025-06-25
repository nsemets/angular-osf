import { createDispatchMap } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TextInputComponent } from '@osf/shared/components';
import { InputLimits } from '@osf/shared/constants';
import { CustomValidators } from '@osf/shared/utils';

import { DeleteDraft } from '../../store';

import { ContributorsComponent } from './contributors/contributors.component';

@Component({
  selector: 'osf-metadata',
  imports: [
    Card,
    TextInputComponent,
    ReactiveFormsModule,
    Button,
    TranslatePipe,
    TextareaModule,
    ContributorsComponent,
  ],
  templateUrl: './metadata.component.html',
  styleUrl: './metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataComponent {
  private readonly fb = inject(FormBuilder);
  protected inputLimits = InputLimits;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly draftId = this.route.snapshot.params['id'];

  protected actions = createDispatchMap({
    deleteDraft: DeleteDraft,
  });

  metadataForm = this.fb.group({
    title: ['', CustomValidators.requiredTrimmed()],
    description: ['', CustomValidators.requiredTrimmed()],
  });

  submitMetadata(): void {
    console.log('Metadata submitted');
  }

  deleteDraft(): void {
    this.actions.deleteDraft(this.draftId).subscribe({
      next: () => {
        this.router.navigateByUrl('/registries/new');
      },
    });
  }
}
