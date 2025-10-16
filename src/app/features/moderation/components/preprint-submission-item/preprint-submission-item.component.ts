import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ContributorsListComponent, IconComponent, TruncatedTextComponent } from '@osf/shared/components';
import { DateAgoPipe } from '@osf/shared/pipes';

import { PREPRINT_ACTION_LABEL, ReviewStatusIcon } from '../../constants';
import { ActionStatus, SubmissionReviewStatus } from '../../enums';
import { PreprintSubmissionModel, PreprintWithdrawalSubmission } from '../../models';

@Component({
  selector: 'osf-preprint-submission-item',
  imports: [
    IconComponent,
    DateAgoPipe,
    Button,
    TranslatePipe,
    TruncatedTextComponent,
    ContributorsListComponent,
    RouterLink,
  ],
  templateUrl: './preprint-submission-item.component.html',
  styleUrl: './preprint-submission-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreprintSubmissionItemComponent {
  status = input.required<SubmissionReviewStatus>();
  submission = input.required<PreprintSubmissionModel | PreprintWithdrawalSubmission>();
  selected = output<void>();

  readonly reviewStatusIcon = ReviewStatusIcon;
  readonly actionLabel = PREPRINT_ACTION_LABEL;
  readonly actionState = ActionStatus;

  limitValue = 1;
  showAll = false;

  toggleHistory() {
    this.showAll = !this.showAll;
  }
}
