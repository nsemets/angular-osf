import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { PaginatorState } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { UserSelectors } from '@core/store/user';
import { CustomPaginatorComponent } from '@osf/shared/components/custom-paginator/custom-paginator.component';
import { RegistrationCardComponent } from '@osf/shared/components/registration-card/registration-card.component';
import { SelectComponent } from '@osf/shared/components/select/select.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { IS_XSMALL } from '@osf/shared/helpers';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { REGISTRATIONS_TABS } from '../../constants';
import { RegistrationTab } from '../../enums';
import { DeleteDraft, FetchDraftRegistrations, FetchSubmittedRegistrations, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-my-registrations',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
    TabsModule,
    FormsModule,
    SelectComponent,
    RegistrationCardComponent,
    CustomPaginatorComponent,
    Skeleton,
    Button,
    RouterLink,
    NgTemplateOutlet,
  ],
  templateUrl: './my-registrations.component.html',
  styleUrl: './my-registrations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRegistrationsComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly customConfirmationService = inject(CustomConfirmationService);
  private readonly toastService = inject(ToastService);
  private readonly environment = inject(ENVIRONMENT);

  readonly isMobile = toSignal(inject(IS_XSMALL));
  readonly tabOptions = REGISTRATIONS_TABS;

  private currentUser = select(UserSelectors.getCurrentUser);
  draftRegistrations = select(RegistriesSelectors.getDraftRegistrations);
  draftRegistrationsTotalCount = select(RegistriesSelectors.getDraftRegistrationsTotalCount);
  isDraftRegistrationsLoading = select(RegistriesSelectors.isDraftRegistrationsLoading);
  submittedRegistrations = select(RegistriesSelectors.getSubmittedRegistrations);
  submittedRegistrationsTotalCount = select(RegistriesSelectors.getSubmittedRegistrationsTotalCount);
  isSubmittedRegistrationsLoading = select(RegistriesSelectors.isSubmittedRegistrationsLoading);

  actions = createDispatchMap({
    getDraftRegistrations: FetchDraftRegistrations,
    getSubmittedRegistrations: FetchSubmittedRegistrations,
    deleteDraft: DeleteDraft,
  });

  readonly RegistrationTab = RegistrationTab;

  readonly provider = this.environment.defaultProvider;

  selectedTab = signal(RegistrationTab.Submitted);
  itemsPerPage = 10;
  skeletons = [...Array(8)];
  draftFirst = 0;
  submittedFirst = 0;

  constructor() {
    const initialTab = this.route.snapshot.queryParams['tab'];
    if (initialTab == 'drafts') {
      this.selectedTab.set(RegistrationTab.Drafts);
    } else {
      this.selectedTab.set(RegistrationTab.Submitted);
    }

    effect(() => {
      const tab = this.selectedTab();

      if (tab === 0) {
        this.draftFirst = 0;
        this.actions.getDraftRegistrations();
      } else {
        this.submittedFirst = 0;
        this.actions.getSubmittedRegistrations(this.currentUser()?.id);
      }

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: tab === RegistrationTab.Drafts ? 'drafts' : 'submitted' },
        queryParamsHandling: 'merge',
      });
    });
  }

  goToCreateRegistration(): void {
    this.router.navigate([`/registries/${this.provider}/new`]);
  }

  onDeleteDraft(id: string): void {
    this.customConfirmationService.confirmDelete({
      headerKey: 'registries.deleteDraft',
      messageKey: 'registries.confirmDeleteDraft',
      onConfirm: () => {
        this.actions.deleteDraft(id).subscribe({
          next: () => {
            this.toastService.showSuccess('registries.successDeleteDraft');
            this.actions.getDraftRegistrations();
          },
        });
      },
    });
  }

  onDraftsPageChange(event: PaginatorState): void {
    this.actions.getDraftRegistrations(event.page! + 1);
    this.draftFirst = event.first!;
  }

  onSubmittedPageChange(event: PaginatorState): void {
    this.actions.getSubmittedRegistrations(this.currentUser()?.id, event.page! + 1);
    this.submittedFirst = event.first!;
  }
}
