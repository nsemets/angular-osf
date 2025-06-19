import { createDispatchMap, select } from '@ngxs/store';

import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { NgClass, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, HostListener, inject, output } from '@angular/core';

import { PreprintFileSource } from '@osf/features/preprints/enums';
import { SetSelectedPreprintFileSource, SubmitPreprintSelectors } from '@osf/features/preprints/store/submit-preprint';
import { ProjectFilesService } from '@osf/features/project/files/services';

@Component({
  selector: 'osf-file-step',
  imports: [Button, TitleCasePipe, NgClass, Tooltip],
  templateUrl: './file-step.component.html',
  styleUrl: './file-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileStepComponent {
  private projectFilesService = inject(ProjectFilesService);
  private actions = createDispatchMap({
    setSelectedFileSource: SetSelectedPreprintFileSource,
  });
  createdPreprint = select(SubmitPreprintSelectors.getCreatedPreprint);
  providerId = select(SubmitPreprintSelectors.getSelectedProviderId);
  nextClicked = output<void>();
  readonly PreprintFileSource = PreprintFileSource;

  isFileSourceSelected = computed(() => {
    return this.selectedFileSource() !== PreprintFileSource.None;
  });
  selectedFileSource = select(SubmitPreprintSelectors.getSelectedFileSource);

  nextButtonClicked() {
    this.nextClicked.emit();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload($event: BeforeUnloadEvent): boolean {
    $event.preventDefault();
    return false;
  }

  backButtonClicked() {
    //todo
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // this.fileName.set(file.name);
    // this.fileIsUploading = true;
    // this.projectFilesService
    //   .uploadFile(file, this.projectId(), null)
    //   .pipe(
    //     takeUntilDestroyed(this.destroyRef),
    //     finalize(() => {
    //       this.fileIsUploading = false;
    //       this.fileName.set('');
    //       input.value = '';
    //       this.updateFilesList();
    //     })
    //   )
    //   .subscribe((event) => {
    //     if (event.type === HttpEventType.Response) {
    //       if (event.body) {
    //         const fileId = event?.body?.data.id;
    //         this.approveFile(fileId);
    //       }
    //     }
    //   });
  }

  selectFileSource(fileSource: PreprintFileSource) {
    this.actions.setSelectedFileSource(fileSource);
  }
}
