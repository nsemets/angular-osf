import { select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { ButtonGroup } from 'primeng/buttongroup';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SubHeaderComponent } from '@osf/shared/components';
import { WikiModes } from '@osf/shared/models';
import { WikiSelectors } from '@osf/shared/stores';

@Component({
  selector: 'osf-registry-wiki',
  imports: [SubHeaderComponent, Button, ButtonGroup, TranslatePipe],
  templateUrl: './registry-wiki.component.html',
  styleUrl: './registry-wiki.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryWikiComponent {
  WikiModes = WikiModes;
  protected wikiModes = select(WikiSelectors.getWikiModes);

  toggleMode(mode: WikiModes) {
    // this.actions.toggleMode(mode);
    console.log(`Toggling mode to: ${mode}`);
  }
}
