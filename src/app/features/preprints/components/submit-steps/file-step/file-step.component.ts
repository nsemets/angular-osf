import { createDispatchMap, select } from '@ngxs/store';

import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

import { NgClass, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, OnInit, output } from '@angular/core';

import { PreprintFileSource } from '@osf/features/preprints/enums';
import {
  GetPreprintFilesLinks,
  SetSelectedPreprintFileSource,
  SubmitPreprintSelectors,
  UploadFile,
} from '@osf/features/preprints/store/submit-preprint';
import { IconComponent } from '@shared/components';

@Component({
  selector: 'osf-file-step',
  imports: [Button, TitleCasePipe, NgClass, Tooltip, Skeleton, IconComponent],
  templateUrl: './file-step.component.html',
  styleUrl: './file-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileStepComponent implements OnInit {
  private actions = createDispatchMap({
    setSelectedFileSource: SetSelectedPreprintFileSource,
    getPreprintFilesLinks: GetPreprintFilesLinks,
    uploadFile: UploadFile,
  });

  readonly PreprintFileSource = PreprintFileSource;

  providerId = select(SubmitPreprintSelectors.getSelectedProviderId);
  selectedFileSource = select(SubmitPreprintSelectors.getSelectedFileSource);
  fileUploadLink = select(SubmitPreprintSelectors.getUploadLink);
  preprintFiles = select(SubmitPreprintSelectors.getPreprintFiles);
  arePreprintFilesLoading = select(SubmitPreprintSelectors.arePreprintFilesLoading);

  nextClicked = output<void>();

  isFileSourceSelected = computed(() => {
    return this.selectedFileSource() !== PreprintFileSource.None;
  });

  ngOnInit() {
    this.actions.getPreprintFilesLinks();
  }

  selectFileSource(fileSource: PreprintFileSource) {
    this.actions.setSelectedFileSource(fileSource);
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
}
