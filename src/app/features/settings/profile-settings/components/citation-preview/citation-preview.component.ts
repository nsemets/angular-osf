import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UserModel } from '@osf/shared/models/user/user.models';
import { CitationFormatPipe } from '@osf/shared/pipes/citation-format.pipe';

@Component({
  selector: 'osf-citation-preview',
  imports: [TranslatePipe, CitationFormatPipe],
  templateUrl: './citation-preview.component.html',
  styleUrl: './citation-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitationPreviewComponent {
  currentUser = input.required<Partial<UserModel>>();
}
