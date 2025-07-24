import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { StepperComponent, SubHeaderComponent } from '@osf/shared/components';
import { StepOption } from '@osf/shared/models';
import { LoaderService } from '@osf/shared/services';

import { ClearState, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-justification',
  imports: [RouterOutlet, StepperComponent, SubHeaderComponent, TranslatePipe],
  templateUrl: './justification.component.html',
  styleUrl: './justification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslateService],
})
export class JustificationComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly loaderService = inject(LoaderService);
  private readonly translateService = inject(TranslateService);
  protected readonly pages = select(RegistriesSelectors.getPagesSchema);
  protected readonly stepsData = select(RegistriesSelectors.getStepsData);
  protected stepsValidation = select(RegistriesSelectors.getStepsValidation);

  private readonly actions = createDispatchMap({
    // getSchemaBlocks: FetchSchemaBlocks,
    clearState: ClearState,
  });

  reviewStep!: StepOption;
  justificationStep!: StepOption;
  registrationId = this.route.snapshot.firstChild?.params['id'] || '';

  steps: Signal<StepOption[]> = computed(() => {
    this.justificationStep = {
      index: 1,
      value: 'justification',
      label: this.translateService.instant('registries.justification.step'),
      invalid: false,
    };

    this.reviewStep = {
      index: 1,
      value: 'review',
      label: this.translateService.instant('registries.review.step'),
      invalid: false,
    };

    const customSteps = this.pages().map((page, index) => {
      return {
        index: index + 1,
        label: page.title,
        value: page.id,
        routeLink: `${index + 1}`,
        invalid: this.stepsValidation()?.[index + 1]?.invalid || false,
      };
    });
    return [
      { ...this.justificationStep },
      ...customSteps,
      { ...this.reviewStep, index: customSteps.length + 1, invalid: false },
    ];
  });

  currentStepIndex = signal(
    this.route.snapshot.firstChild?.params['step'] ? +this.route.snapshot.firstChild?.params['step'] : 0
  );

  currentStep = computed(() => {
    return this.steps()[this.currentStepIndex()];
  });

  stepChange(step: StepOption): void {
    // [NM] TODO: before navigating, validate the current step
    this.currentStepIndex.set(step.index);
    const pageLink = this.steps()[step.index].routeLink;
    this.router.navigate([`/registries/drafts/${this.registrationId}/`, pageLink]);
  }

  ngOnDestroy(): void {
    this.actions.clearState();
  }
}
