import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { DialogService } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { INPUT_VALIDATION_MESSAGES } from '@osf/shared/constants';
import { CustomConfirmationService, ToastService } from '@osf/shared/services';

import { FieldType } from '../../enums';
import { DeleteSchemaResponse, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-justification-review',
  imports: [Button, Card, TranslatePipe, Tag, Message],
  templateUrl: './justification-review.component.html',
  styleUrl: './justification-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class JustificationReviewComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly translateService = inject(TranslateService);
  private readonly toastService = inject(ToastService);

  protected readonly pages = select(RegistriesSelectors.getPagesSchema);
  protected readonly schemaResponse = select(RegistriesSelectors.getSchemaResponse);
  protected readonly schemaResponseRevisionData = select(RegistriesSelectors.getSchemaResponseRevisionData);

  protected readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;
  protected readonly FieldType = FieldType;

  protected actions = createDispatchMap({
    deleteSchemaResponse: DeleteSchemaResponse,
  });

  private readonly revisionId = this.route.snapshot.params['id'];
  private readonly OSF_PROVIDER_ID = 'osf';

  submit(): void {
    console.log('Submitting justification review');
  }

  goBack(): void {
    const previousStep = this.pages().length;
    this.router.navigate(['../', previousStep], { relativeTo: this.route });
  }

  deleteDraftUpdate() {
    this.customConfirmationService.confirmDelete({
      headerKey: 'registries.justification.confirmDeleteUpdate.header',
      messageKey: 'registries.justification.confirmDeleteUpdate.message',
      onConfirm: () => {
        const registrationId = this.schemaResponse()?.registrationId || '';
        this.actions.deleteSchemaResponse(this.revisionId).subscribe({
          next: () => {
            this.router.navigateByUrl(`/registries/${registrationId}/overview`);
          },
        });
      },
    });
  }
}
