import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SubHeaderComponent } from '@osf/shared/components';

import { MyReviewingNavigationComponent, RecentActivityListComponent } from '../../components';

@Component({
  selector: 'osf-my-preprint-reviewing',
  imports: [SubHeaderComponent, Card, TranslatePipe, RecentActivityListComponent, MyReviewingNavigationComponent],
  templateUrl: './my-preprint-reviewing.component.html',
  styleUrl: './my-preprint-reviewing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPreprintReviewingComponent {
  isLoading = false;
}
