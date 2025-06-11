import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';

import { debounceTime, distinctUntilChanged, skip } from 'rxjs';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

import {
  ContributorEducationHistoryComponent,
  ContributorEmploymentHistoryComponent,
} from '@osf/features/project/contributors/components';
import { SearchInputComponent } from '@osf/shared/components';
import { ToastService } from '@osf/shared/services';
import { defaultConfirmationConfig } from '@osf/shared/utils';

import { Moderator } from '../../models';
import {
  AddCollectionModerator,
  DeleteCollectionModerator,
  LoadCollectionModerators,
  ModerationSelectors,
  UpdateCollectionModerator,
  UpdateCollectionSearchValue,
} from '../../store';
import { CollectionModeratorsListComponent } from '../collection-moderators-list/collection-moderators-list.component';

@Component({
  selector: 'osf-collection-moderators',
  imports: [CollectionModeratorsListComponent, SearchInputComponent, Button, TranslatePipe],
  templateUrl: './collection-moderators.component.html',
  styleUrl: './collection-moderators.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export class CollectionModeratorsComponent implements OnInit {
  protected searchControl = new FormControl<string>('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  moderators = signal([]);
  initialModerators = select(ModerationSelectors.getCollectionModerators);
  isModeratorsLoading = select(ModerationSelectors.isModeratorsLoading);

  protected actions = createDispatchMap({
    loadModerators: LoadCollectionModerators,
    updateSearchValue: UpdateCollectionSearchValue,
    addModerators: AddCollectionModerator,
    updateModerator: UpdateCollectionModerator,
    deleteModerator: DeleteCollectionModerator,
  });

  constructor() {
    effect(() => {
      this.moderators.set(JSON.parse(JSON.stringify(this.initialModerators())));

      if (this.isModeratorsLoading()) {
        this.searchControl.disable();
      } else {
        this.searchControl.enable();
      }
    });
  }

  ngOnInit(): void {
    this.setSearchSubscription();

    this.actions.loadModerators('');
  }

  addModerator() {
    console.log('Add moderator');
  }

  removeModerator(moderator: Moderator) {
    this.confirmationService.confirm({
      ...defaultConfirmationConfig,
      header: this.translateService.instant('moderation.removeDialog.title'),
      message: this.translateService.instant('moderation.removeDialog.message', {
        name: moderator.fullName,
      }),
      acceptButtonProps: {
        ...defaultConfirmationConfig.acceptButtonProps,
        severity: 'danger',
        label: this.translateService.instant('common.buttons.remove'),
      },
      accept: () => {
        console.log('Remove moderator', moderator);
        this.toastService.showSuccess('project.contributors.removeDialog.successMessage', { name: moderator.fullName });
      },
    });
  }

  openEmploymentHistory(contributor: Moderator) {
    this.dialogService.open(ContributorEmploymentHistoryComponent, {
      width: '552px',
      data: contributor.employment,
      focusOnShow: false,
      header: this.translateService.instant('project.contributors.table.headers.employment'),
      closeOnEscape: true,
      modal: true,
      closable: true,
    });
  }

  openEducationHistory(contributor: Moderator) {
    this.dialogService.open(ContributorEducationHistoryComponent, {
      width: '552px',
      data: contributor.education,
      focusOnShow: false,
      header: this.translateService.instant('project.contributors.table.headers.education'),
      closeOnEscape: true,
      modal: true,
      closable: true,
    });
  }

  private setSearchSubscription() {
    this.searchControl.valueChanges
      .pipe(skip(1), debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => console.log(res));
  }
}
