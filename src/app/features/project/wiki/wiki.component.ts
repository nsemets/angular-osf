import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SubHeaderComponent } from '@osf/shared/components';

import { CompareSectionComponent } from './components/compare-section/compare-section.component';
import { EditSectionComponent } from './components/edit-section/edit-section.component';
import { ViewSectionComponent } from './components/view-section/view-section.component';
import { WikiListComponent } from './components/wiki-list/wiki-list.component';

@Component({
  selector: 'osf-wiki',
  imports: [
    SubHeaderComponent,
    TranslatePipe,
    ButtonGroupModule,
    Button,
    WikiListComponent,
    ViewSectionComponent,
    EditSectionComponent,
    CompareSectionComponent,
  ],
  templateUrl: './wiki.component.html',
  styleUrl: './wiki.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WikiComponent {}
