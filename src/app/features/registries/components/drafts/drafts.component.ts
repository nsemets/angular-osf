import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { StepperComponent, SubHeaderComponent } from '@osf/shared/components';
import { StepOption } from '@osf/shared/models';

import { defaultSteps } from '../../constants';
import { FetchSchemaBlocks, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-drafts',
  imports: [RouterOutlet, StepperComponent, SubHeaderComponent, TranslatePipe],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraftsComponent {
  protected readonly pages = select(RegistriesSelectors.getPagesSchema);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly actions = createDispatchMap({
    getSchemaBlocks: FetchSchemaBlocks,
  });

  // TODO: get current  registrationSchemaId from store
  registrationSchemaId = '6797c0dedee44d144a2943fd';

  // TODO: get current  step from route
  currentStep = signal(this.route.snapshot.params['step'] ? +this.route.snapshot.params['step'].split('-')[0] : 1);

  steps: Signal<StepOption[]> = computed(() => {
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
    const pageStep = this.steps()[step];

    console.log('Navigating to step:', pageStep, 'with label:', pageStep.label);
    let pageLink = '';
    if (!pageStep.value) {
      pageLink = `${pageStep.routeLink}`;
    } else {
      pageLink = `${step}-${pageStep.value}`;
    }
    this.router.navigate([`/registries/drafts/${this.registrationSchemaId}/`, pageLink]);
  }
}
