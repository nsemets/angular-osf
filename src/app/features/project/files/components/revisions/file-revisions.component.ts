import { select, Store } from '@ngxs/store';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Tooltip } from 'primeng/tooltip';

import { map, of } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ProjectFilesSelectors } from '@osf/features/project/files/store';
import { CopyButtonComponent } from '@shared/components';
import { ToastService } from '@shared/services';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'osf-file-revisions',
  templateUrl: './file-revisions.component.html',
  styleUrls: ['./file-revisions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    DatePipe,
    Tooltip,
    CopyButtonComponent,
  ],
})
export class FileRevisionsComponent {
  readonly store = inject(Store);
  readonly destroyRef = inject(DestroyRef);
  readonly toastService = inject(ToastService);
  readonly route = inject(ActivatedRoute);
  readonly translateService = inject(TranslateService);

  readonly fileRevisions = select(ProjectFilesSelectors.getFileRevisions);
  readonly fileGuid = toSignal(this.route.params.pipe(map((params) => params['fileGuid'])) ?? of(undefined));

  downloadRevision(version: string): void {
    if (this.fileGuid()) {
      window.open(`${environment.downloadUrl}/${this.fileGuid()}/?revision=${version}`)?.focus();
    }
  }
}
