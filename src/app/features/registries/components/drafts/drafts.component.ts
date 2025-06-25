import { createDispatchMap, select } from '@ngxs/store';

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StepperComponent } from '@osf/shared/components';

import { defaultSteps } from '../../constants';
import { FetchSchemaBlocks, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-drafts',
  imports: [RouterOutlet, StepperComponent],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftsComponent {
  protected readonly pages = select(RegistriesSelectors.getPagesSchema);

  private readonly actions = createDispatchMap({
    getSchemaBlocks: FetchSchemaBlocks,
  });

  // TODO: get current  registrationSchemaId from store
  registrationSchemaId = '6797c0dedee44d144a2943fd';

  currentStep = signal<number>(0);

  steps = computed(() => {
    const customSteps = this.pages().map((page) => ({
      label: page.title,
      value: page.id,
    }));
    return [defaultSteps[0], ...customSteps, defaultSteps[1]];
  });

  constructor() {
    this.actions.getSchemaBlocks(this.registrationSchemaId);
    setTimeout(() => {
      console.log('DraftsComponent initialized with registrationSchemaId:', this.pages());
    }, 2000);
  }

  stepChange(step: number): void {
    this.currentStep.set(step);
    console.log('Current step changed to:', step);
  }
}
