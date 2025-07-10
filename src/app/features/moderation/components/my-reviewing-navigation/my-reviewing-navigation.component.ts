import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PREPRINT_REVIEWING_TABS } from '../../constants';
import { PreprintModerationTab } from '../../enums';

@Component({
  selector: 'osf-my-reviewing-navigation',
  imports: [Button, RouterLink, TranslatePipe],
  templateUrl: './my-reviewing-navigation.component.html',
  styleUrl: './my-reviewing-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReviewingNavigationComponent {
  submissionsCount = '2';

  readonly tabOptions = PREPRINT_REVIEWING_TABS;
  readonly tabOption = PreprintModerationTab;
}
