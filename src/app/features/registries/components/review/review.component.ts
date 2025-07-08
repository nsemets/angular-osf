import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Message } from 'primeng/message';
import { Tag } from 'primeng/tag';

import { map, of } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { INPUT_VALIDATION_MESSAGES } from '@osf/shared/constants';
import { ResourceType } from '@osf/shared/enums';
import { CustomConfirmationService } from '@osf/shared/services';
import { ContributorsSelectors, GetAllContributors } from '@osf/shared/stores';

import { FieldType } from '../../enums';
import { DeleteDraft, FetchRegistrationSubjects, RegisterDraft, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-review',
  imports: [TranslatePipe, Card, Message, RouterLink, Tag, Button],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly customConfirmationService = inject(CustomConfirmationService);

  protected readonly pages = select(RegistriesSelectors.getPagesSchema);
  protected readonly draftRegistration = select(RegistriesSelectors.getDraftRegistration);
  protected readonly stepsData = select(RegistriesSelectors.getStepsData);
  readonly INPUT_VALIDATION_MESSAGES = INPUT_VALIDATION_MESSAGES;
  protected readonly contributors = select(ContributorsSelectors.getContributors);
  protected readonly subjects = select(RegistriesSelectors.getSelectedSubjects);
  protected readonly FieldType = FieldType;

  protected actions = createDispatchMap({
    getContributors: GetAllContributors,
    getSubjects: FetchRegistrationSubjects,
    deleteDraft: DeleteDraft,
    registerDraft: RegisterDraft,
  });
  private readonly draftId = toSignal(this.route.params.pipe(map((params) => params['id'])) ?? of(undefined));

  constructor() {
    if (!this.contributors()?.length) {
      this.actions.getContributors(this.draftId(), ResourceType.DraftRegistration);
    }
    if (!this.subjects()?.length) {
      this.actions.getSubjects(this.draftId());
    }
  }

  goBack(): void {
    const previousStep = this.pages().length;
    this.router.navigate(['../', previousStep], { relativeTo: this.route });
  }

  deleteDraft(): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'registries.deleteDraft',
      messageKey: 'registries.confirmDeleteDraft',
      onConfirm: () => {
        this.actions.deleteDraft(this.draftId()).subscribe({
          next: () => {
            this.router.navigateByUrl('/registries/new');
          },
        });
      },
    });
  }

  register() {
    const draftId = this.draftId();
    console.log('Registering draft with ID:', draftId);
    this.actions.registerDraft(draftId, '');
  }
}
