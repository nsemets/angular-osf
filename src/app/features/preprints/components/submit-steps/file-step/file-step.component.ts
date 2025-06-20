import { createDispatchMap, select } from '@ngxs/store';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select, SelectChangeEvent } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

import { debounceTime, distinctUntilChanged } from 'rxjs';

import { NgClass, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { StringOrNull } from '@core/helpers';
import { PreprintFileSource } from '@osf/features/preprints/enums';
import {
  GetAvailableProjects,
  GetPreprintFilesLinks,
  GetProjectFiles,
  SetSelectedPreprintFileSource,
  SubmitPreprintSelectors,
  UploadFile,
} from '@osf/features/preprints/store/submit-preprint';
import { IconComponent } from '@shared/components';

@Component({
  selector: 'osf-file-step',
  imports: [Button, TitleCasePipe, NgClass, Tooltip, Skeleton, IconComponent, Card, Select, ReactiveFormsModule],
  templateUrl: './file-step.component.html',
  styleUrl: './file-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileStepComponent implements OnInit {
  private actions = createDispatchMap({
    setSelectedFileSource: SetSelectedPreprintFileSource,
    getPreprintFilesLinks: GetPreprintFilesLinks,
    uploadFile: UploadFile,
    getAvailableProjects: GetAvailableProjects,
    getFilesForSelectedProject: GetProjectFiles,
  });
  private destroyRef = inject(DestroyRef);

  readonly PreprintFileSource = PreprintFileSource;

  providerId = select(SubmitPreprintSelectors.getSelectedProviderId);
  selectedFileSource = select(SubmitPreprintSelectors.getSelectedFileSource);
  fileUploadLink = select(SubmitPreprintSelectors.getUploadLink);
  preprintFiles = select(SubmitPreprintSelectors.getPreprintFiles);
  arePreprintFilesLoading = select(SubmitPreprintSelectors.arePreprintFilesLoading);
  availableProjects = select(SubmitPreprintSelectors.getAvailableProjects);
  areAvailableProjectsLoading = select(SubmitPreprintSelectors.areAvailableProjectsLoading);
  projectNameControl = new FormControl<StringOrNull>(null);

  nextClicked = output<void>();

  isFileSourceSelected = computed(() => {
    return this.selectedFileSource() !== PreprintFileSource.None;
  });

  ngOnInit() {
    this.actions.getPreprintFilesLinks();
  }

  selectFileSource(fileSource: PreprintFileSource) {
    this.actions.setSelectedFileSource(fileSource);

    if (fileSource === PreprintFileSource.Project) {
      this.actions.getAvailableProjects(null);

      this.projectNameControl.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          if (!value) return;
          this.actions.getAvailableProjects(value);
        });
    }
  }

  backButtonClicked() {
    //todo
  }

  nextButtonClicked() {
    this.nextClicked.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.actions.uploadFile(file);
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload($event: BeforeUnloadEvent): boolean {
    $event.preventDefault();
    return false;
  }

  selectProject(event: SelectChangeEvent) {
    if (!(event.originalEvent instanceof PointerEvent)) {
      return;
    }

    this.actions.getFilesForSelectedProject(event.value);
  }
}
