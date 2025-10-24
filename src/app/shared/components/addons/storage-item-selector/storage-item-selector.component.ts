import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { Skeleton } from 'primeng/skeleton';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddonType, OperationNames, StorageItemType } from '@osf/shared/enums';
import { convertCamelCaseToNormal, IS_XSMALL } from '@osf/shared/helpers';
import { OperationInvokeData, StorageItem } from '@osf/shared/models';
import { CustomDialogService } from '@osf/shared/services';
import { AddonsSelectors, ClearOperationInvocations } from '@osf/shared/stores/addons';

import { GoogleFilePickerComponent } from '../../google-file-picker/google-file-picker.component';
import { SelectComponent } from '../../select/select.component';
import { ResourceTypeInfoDialogComponent } from '../resource-type-info-dialog/resource-type-info-dialog.component';

@Component({
  selector: 'osf-storage-item-selector',
  templateUrl: './storage-item-selector.component.html',
  styleUrl: './storage-item-selector.component.scss',
  imports: [
    BreadcrumbModule,
    Button,
    Card,
    FormsModule,
    GoogleFilePickerComponent,
    InputText,
    RadioButton,
    ReactiveFormsModule,
    Skeleton,
    TranslatePipe,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageItemSelectorComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private customDialogService = inject(CustomDialogService);
  private translateService = inject(TranslateService);

  readonly AddonType = AddonType;
  isMobile = toSignal(inject(IS_XSMALL));

  isGoogleFilePicker = input.required<boolean>();
  accountName = input.required<string>();
  accountId = input.required<string>();
  operationInvocationResult = input.required<StorageItem[]>();
  accountNameControl = input(new FormControl());
  isCreateMode = input(false);
  currentAddonType = input<string>(AddonType.STORAGE);
  supportedResourceTypes = input<string[]>([]);

  selectedStorageItemId = model<string>('/');
  selectedStorageItemUrl = model<string>('');
  operationInvoke = output<OperationInvokeData>();
  operationInvokeWithCursor = output<OperationInvokeData>();
  save = output<void>();
  cancelSelection = output<void>();
  readonly OperationNames = OperationNames;
  readonly StorageItemType = StorageItemType;
  hasInputChanged = signal(false);
  hasFolderChanged = signal(false);
  hasResourceTypeChanged = signal(false);
  selectedResourceType = model<string>('');
  selectedStorageItem = signal<StorageItem | null>(null);
  initialResourceType = signal<string>('');
  breadcrumbItems = signal<MenuItem[]>([]);

  selectedItemLabel = computed(() =>
    this.currentAddonType() === AddonType.LINK
      ? 'settings.addons.configureAddon.linkedItem'
      : 'settings.addons.configureAddon.selectedFolder'
  );

  noSelectionLabel = computed(() =>
    this.currentAddonType() === AddonType.LINK
      ? 'settings.addons.configureAddon.noLinkedItem'
      : 'settings.addons.configureAddon.noFolderSelected'
  );

  resourceTypeOptions = computed(() =>
    this.supportedResourceTypes().map((type) => ({
      label: convertCamelCaseToNormal(type),
      value: type,
    }))
  );

  initiallySelectedStorageItem = select(AddonsSelectors.getSelectedStorageItem);
  isOperationInvocationSubmitting = select(AddonsSelectors.getOperationInvocationSubmitting);
  isSubmitting = select(AddonsSelectors.getCreatedOrUpdatedConfiguredAddonSubmitting);
  operationInvocation = select(AddonsSelectors.getOperationInvocation);
  readonly homeBreadcrumb: MenuItem = {
    id: '/',
    label: this.translateService.instant('settings.addons.configureAddon.home'),
    state: {
      operationName: OperationNames.LIST_ROOT_ITEMS,
    },
  };

  actions = createDispatchMap({ clearOperationInvocations: ClearOperationInvocations });

  constructor() {
    effect(() => {
      const initialFolder = this.initiallySelectedStorageItem();
      if (initialFolder) {
        this.selectedStorageItem.set(initialFolder);
      }
    });

    effect(() => {
      const currentResourceType = this.selectedResourceType();
      const initialType = this.initialResourceType();

      if (initialType) {
        this.hasResourceTypeChanged.set(currentResourceType !== initialType);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.actions.clearOperationInvocations();
    });
  }

  ngOnInit(): void {
    this.initializeFormState();
    this.setupAccountNameTracking();
  }

  private initializeFormState(): void {
    this.initialResourceType.set(this.selectedResourceType());
    this.resetChangeFlags();
  }

  private resetChangeFlags(): void {
    this.hasInputChanged.set(false);
    this.hasFolderChanged.set(false);
    this.hasResourceTypeChanged.set(false);
  }

  private setupAccountNameTracking(): void {
    this.accountNameControl()
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newValue) => {
        this.hasInputChanged.set(newValue !== this.accountName());
      });
  }

  readonly isFormValid = computed(() => {
    const isLinkAddon = this.currentAddonType() === AddonType.LINK;
    const hasResourceType = isLinkAddon ? !!this.selectedResourceType() : true;

    if (!hasResourceType) {
      return false;
    }

    if (this.isCreateMode()) {
      return this.hasFolderChanged();
    }

    return this.hasInputChanged() || this.hasFolderChanged() || this.hasResourceTypeChanged();
  });

  readonly showLoadMoreButton = computed(() => {
    const invocation = this.operationInvocation();
    if (!invocation?.nextSampleCursor || !invocation?.thisSampleCursor) {
      return false;
    }
    return invocation.nextSampleCursor > invocation.thisSampleCursor;
  });

  handleCreateOperationInvocation(
    operationName: OperationNames,
    itemId: string,
    itemName?: string,
    mayContainRootCandidates?: boolean
  ): void {
    this.updateBreadcrumbs(operationName, itemId, itemName, mayContainRootCandidates);

    this.operationInvoke.emit({
      operationName,
      itemId,
    });

    this.trimBreadcrumbs(itemId);
  }

  handleLoadMore(): void {
    const invocation = this.operationInvocation();
    if (!invocation?.nextSampleCursor) {
      return;
    }

    this.operationInvokeWithCursor.emit({
      operationName: invocation.operationName as OperationNames,
      itemId: invocation.operationKwargs.itemId || '/',
      pageCursor: invocation.nextSampleCursor,
    });
  }

  handleSave(): void {
    this.selectedStorageItemId.set(this.selectedStorageItem()?.itemId || '');
    this.selectedStorageItemUrl.set(this.selectedStorageItem()?.itemLink || '');
    this.save.emit();
  }

  handleCancel(): void {
    this.cancelSelection.emit();
  }

  handleFolderSelection = (folder: StorageItem): void => {
    this.selectedStorageItem.set(folder);
    this.hasFolderChanged.set(folder?.itemId !== this.initiallySelectedStorageItem()?.itemId);
  };

  private updateBreadcrumbs(
    operationName: OperationNames,
    itemId: string,
    itemName?: string,
    mayContainRootCandidates?: boolean
  ): void {
    if (operationName === OperationNames.LIST_ROOT_ITEMS) {
      this.breadcrumbItems.set([]);
      return;
    }

    if (itemName && mayContainRootCandidates) {
      const breadcrumbs = [...this.breadcrumbItems()];
      const item = {
        id: itemId,
        label: itemName,
        state: {
          operationName: mayContainRootCandidates ? OperationNames.LIST_CHILD_ITEMS : OperationNames.GET_ITEM_INFO,
        },
      };

      this.breadcrumbItems.set([...breadcrumbs, item]);
    }
  }

  private trimBreadcrumbs(itemId: string): void {
    const currentBreadcrumbs = this.breadcrumbItems();

    const targetIndex = currentBreadcrumbs.findIndex((item) => item.id === itemId);

    if (targetIndex !== -1) {
      const trimmedBreadcrumbs = currentBreadcrumbs.slice(0, targetIndex + 1);
      this.breadcrumbItems.set(trimmedBreadcrumbs);
    }
  }

  openInfoDialog() {
    this.customDialogService.open(ResourceTypeInfoDialogComponent, {
      header: 'settings.addons.configureAddon.aboutResourceType',
      width: '850px',
    });
  }
}
