import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { TabsModule } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';

import { forkJoin, of, switchMap } from 'rxjs';

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
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  FilesSelectors,
  GetMoveDialogConfiguredStorageAddons,
  GetMoveDialogRootFolders,
  GetStorageSupportedFeatures,
  SetCurrentProvider,
  SetMoveDialogCurrentFolder,
} from '@osf/features/files/store';
import { SupportedFeature } from '@osf/shared/enums/addon-supported-features.enum';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { mapRootFoldersToStorageLabels } from '@osf/shared/helpers/storage-addon-options.helper';
import { Primitive } from '@osf/shared/helpers/types.helper';
import { FileLabelModel } from '@osf/shared/models/files/file-label.model';
import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';
import { SelectOption } from '@osf/shared/models/select-option.model';

import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'osf-file-select-destination',
  imports: [TabsModule, Skeleton, Button, SelectComponent, Tooltip, TranslatePipe],
  templateUrl: './file-select-destination.component.html',
  styleUrl: './file-select-destination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileSelectDestinationComponent implements OnInit {
  projectId = input.required<string>();
  storageProvider = input.required<string>();
  components = input.required<NodeShortInfoModel[]>();
  areComponentsLoading = input<boolean>(false);
  selectProject = output<string>();
  selectStorage = output();

  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);

  readonly rootFolders = select(FilesSelectors.getMoveDialogRootFolders);
  readonly isRootFoldersLoading = select(FilesSelectors.isMoveDialogRootFoldersLoading);
  readonly configuredStorageAddons = select(FilesSelectors.getMoveDialogConfiguredStorageAddons);
  readonly isConfiguredStorageAddonsLoading = select(FilesSelectors.isMoveDialogConfiguredStorageAddonsLoading);
  readonly isFilesLoading = select(FilesSelectors.isMoveDialogFilesLoading);
  readonly supportedFeatures = select(FilesSelectors.getStorageSupportedFeatures);
  readonly currentFolder = select(FilesSelectors.getMoveDialogCurrentFolder);

  private readonly actions = createDispatchMap({
    setCurrentFolder: SetMoveDialogCurrentFolder,
    getRootFolders: GetMoveDialogRootFolders,
    getConfiguredStorageAddons: GetMoveDialogConfiguredStorageAddons,
    getStorageSupportedFeatures: GetStorageSupportedFeatures,
    setCurrentProvider: SetCurrentProvider,
  });

  initialSetup = true;
  currentRootFolder = model<FileLabelModel | null>(null);
  selectedProject = computed(() => this.options().find((c) => c.value === this.projectId()) || null);

  get isStorageLoading() {
    return this.isConfiguredStorageAddonsLoading() || this.isRootFoldersLoading();
  }

  get isLoading() {
    return this.isStorageLoading || this.isFilesLoading() || this.areComponentsLoading();
  }

  readonly options = computed(() => {
    const components = this.components().filter((c) => this.getHasWriteAccess(c));
    return [...this.buildOptions(components)];
  });

  readonly storageAddons = computed(() => {
    const osfLabel = this.translateService.instant('files.storageLocation');
    return mapRootFoldersToStorageLabels(this.rootFolders(), this.configuredStorageAddons(), osfLabel);
  });

  private getHasWriteAccess = (project: NodeShortInfoModel): boolean =>
    !!project?.permissions.includes(UserPermissions.Write);

  constructor() {
    effect(() => {
      const currentRootFolder = this.currentRootFolder();
      if (currentRootFolder) {
        if (!this.initialSetup) {
          this.actions.setCurrentFolder(currentRootFolder.folder);
          this.actions.setCurrentProvider(currentRootFolder.folder.provider);
        }
        this.initialSetup = false;
      }
    });
  }

  ngOnInit(): void {
    this.getStorageAddons(this.projectId());
  }

  onStorageChange(value: Primitive) {
    const rootFolder = this.storageAddons().find((option) => option.folder.id === value);
    if (rootFolder) {
      this.currentRootFolder.set(rootFolder);
      if (rootFolder.folder.provider) {
        this.actions.setCurrentProvider(rootFolder.folder.provider);
      }
    }
    this.selectStorage.emit();
  }

  onChangeProject(value: Primitive) {
    this.selectProject.emit(value as string);
    this.getStorageAddons(value as string);
  }

  hasAddUpdateFeature(provider: string): boolean {
    const features = this.supportedFeatures()[provider];
    return !!features && features.includes(SupportedFeature.AddUpdateFiles);
  }

  private getStorageAddons(projectId: string) {
    forkJoin({
      rootFolders: this.actions.getRootFolders(projectId, ResourceType.Project),
      addons: this.actions.getConfiguredStorageAddons(projectId),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => {
          const configuredAddons = this.configuredStorageAddons();

          if (!configuredAddons?.length) return of(null);

          const featureRequests = configuredAddons.map((addon) =>
            this.actions.getStorageSupportedFeatures(addon.id, addon.externalServiceName)
          );
          return forkJoin(featureRequests);
        })
      )
      .subscribe(() => {
        const storages = this.storageAddons();
        const currentStorage = storages.find((s) => s.folder.provider === this.storageProvider()) || storages[0];

        if (currentStorage) {
          this.currentRootFolder.set({
            label: currentStorage.label,
            folder: currentStorage.folder,
          });
        } else {
          this.currentRootFolder.set(null);
        }
      });
  }

  private buildOptions(nodes: NodeShortInfoModel[] = [], parentPath = '..'): SelectOption[] {
    return nodes.reduce<SelectOption[]>((acc, node) => {
      const pathParts: string[] = [];

      let current: NodeShortInfoModel | undefined = node;
      while (current) {
        pathParts.unshift(current.title ?? '');
        current = nodes.find((n) => n.id === current?.parentId);
      }

      const isRootProject = node.id === this.projectId();
      const basePath = isRootProject ? '' : parentPath;

      const fullPath = basePath ? `${basePath}/${pathParts.join('/')}` : pathParts.join('/');

      acc.push({
        value: node.id,
        label: fullPath,
      });

      return acc;
    }, []);
  }
}
