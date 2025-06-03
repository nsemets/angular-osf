import { select, Store } from '@ngxs/store';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ProjectFilesSelectors } from '@osf/features/project/files/store';
import { ToastService } from '@shared/services';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'osf-file-revisions',
  standalone: true,
  templateUrl: './file-revisions.component.html',
  styleUrls: ['./file-revisions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Button, DatePipe, Tooltip],
})
export class FileRevisionsComponent {
  readonly store = inject(Store);
  readonly destroyRef = inject(DestroyRef);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly translateService = inject(TranslateService);

  readonly fileRevisions = select(ProjectFilesSelectors.getFileRevisions);

  fileGuid = '';

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.fileGuid = params['fileGuid'];
    });
  }

  copyToClipboard(copyText: string): void {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        this.toastService.showSuccess(this.translateService.instant('project.files.detail.toast.copiedToClipboard'));
      })
      .catch((err) => {
        this.toastService.showError(err.message);
      });
  }

  downloadRevision(version: string): void {
    if (this.fileGuid) {
      window.open(`${environment.downloadUrl}/${this.fileGuid}/?revision=${version}`)?.focus();
    }
  }
}
