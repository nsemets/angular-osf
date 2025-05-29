import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { DialogService } from 'primeng/dynamicdialog';

import { map, of } from 'rxjs';

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { LoadingSpinnerComponent, SubHeaderComponent } from '@osf/shared/components';
import { TabOption } from '@osf/shared/models';

import { RegistrationCardComponent } from './components';
import { GetRegistrations, RegistrationsSelectors } from './store';

@Component({
  selector: 'osf-registrations',
  imports: [RegistrationCardComponent, SubHeaderComponent, FormsModule, TranslatePipe, LoadingSpinnerComponent],
  templateUrl: './registrations.component.html',
  styleUrl: './registrations.component.scss',
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly projectId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));

  protected registrations = select(RegistrationsSelectors.getRegistrations);
  protected isRegistrationsLoading = select(RegistrationsSelectors.isRegistrationsLoading);

  protected actions = createDispatchMap({ getRegistrations: GetRegistrations });

  protected readonly defaultTabValue = 0;
  protected readonly tabOptions: TabOption[] = [{ label: 'Submitted', value: 0 }];
  protected readonly selectedTab = signal<number>(this.defaultTabValue);

  ngOnInit(): void {
    this.actions.getRegistrations(this.projectId());
  }
}
