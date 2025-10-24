import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { filter, tap } from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { StepperComponent, SubHeaderComponent } from '@osf/shared/components';
import { ResourceType } from '@osf/shared/enums';
import { PageSchema, Question, StepOption } from '@osf/shared/models';
import { LoaderService } from '@osf/shared/services';
import { ContributorsSelectors, GetAllContributors } from '@osf/shared/stores/contributors';
import { FetchSelectedSubjects, SubjectsSelectors } from '@osf/shared/stores/subjects';

import { DEFAULT_STEPS } from '../../constants';
import { ClearState, FetchDraft, FetchSchemaBlocks, RegistriesSelectors, UpdateStepState } from '../../store';

@Component({
  selector: 'osf-drafts',
  imports: [RouterOutlet, StepperComponent, SubHeaderComponent, TranslatePipe],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TranslateService],
})
export class DraftsComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loaderService = inject(LoaderService);
  private readonly translateService = inject(TranslateService);

  readonly pages = select(RegistriesSelectors.getPagesSchema);
  readonly draftRegistration = select(RegistriesSelectors.getDraftRegistration);
  stepsState = select(RegistriesSelectors.getStepsState);
  readonly stepsData = select(RegistriesSelectors.getStepsData);
  selectedSubjects = select(SubjectsSelectors.getSelectedSubjects);
  initialContributors = select(ContributorsSelectors.getContributors);
  readonly contributors = select(ContributorsSelectors.getContributors);
  readonly subjects = select(SubjectsSelectors.getSelectedSubjects);
  readonly registrationLicense = select(RegistriesSelectors.getRegistrationLicense);

  private readonly actions = createDispatchMap({
    getSchemaBlocks: FetchSchemaBlocks,
    getDraftRegistration: FetchDraft,
    updateStepState: UpdateStepState,
    clearState: ClearState,
    getContributors: GetAllContributors,
    getSubjects: FetchSelectedSubjects,
  });

  get isReviewPage(): boolean {
    return this.router.url.includes('/review');
  }

  isMetaDataInvalid = computed(() => {
    return (
      !this.draftRegistration()?.title ||
      !this.draftRegistration()?.description ||
      !this.registrationLicense() ||
      !this.selectedSubjects()?.length ||
      !this.initialContributors()?.length
    );
  });

  defaultSteps: StepOption[] = [];

  isLoaded = false;

  steps: Signal<StepOption[]> = computed(() => {
    const stepState = this.stepsState();
    const stepData = this.stepsData();
    this.defaultSteps = DEFAULT_STEPS.map((step) => ({
      ...step,
      label: this.translateService.instant(step.label),
      invalid: stepState?.[step.index]?.invalid || false,
    }));

    this.defaultSteps[0].invalid = this.isMetaDataInvalid();
    this.defaultSteps[0].touched = true;
    const customSteps = this.pages().map((page, index) => {
      const pageStep = this.pages()[index];
      const allQuestions = this.getAllQuestions(pageStep);
      const wasTouched =
        allQuestions?.some((question) => {
          const questionData = stepData[question.responseKey!];
          return Array.isArray(questionData) ? questionData.length : questionData;
        }) || false;
      return {
        index: index + 1,
        label: page.title,
        value: page.id,
        routeLink: `${index + 1}`,
        invalid: stepState?.[index + 1]?.invalid || false,
        touched: stepState?.[index + 1]?.touched || wasTouched,
      };
    });
    return [
      this.defaultSteps[0],
      ...customSteps,
      { ...this.defaultSteps[1], index: customSteps.length + 1, invalid: false },
    ];
  });

  currentStepIndex = signal(
    this.route.snapshot.firstChild?.params['step'] ? +this.route.snapshot.firstChild?.params['step'] : 0
  );

  currentStep = computed(() => this.steps()[this.currentStepIndex()]);

  registrationId = this.route.snapshot.firstChild?.params['id'] || '';

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const step = this.route.firstChild?.snapshot.params['step'];
        if (step) {
          this.currentStepIndex.set(+step);
        } else if (this.isReviewPage) {
          const reviewStepIndex = this.pages().length + 1;
          this.currentStepIndex.set(reviewStepIndex);
        } else {
          this.currentStepIndex.set(0);
        }
      });

    this.loaderService.show();
    if (!this.draftRegistration()) {
      this.actions.getDraftRegistration(this.registrationId);
    }
    if (!this.contributors()?.length) {
      this.actions.getContributors(this.registrationId, ResourceType.DraftRegistration);
    }
    if (!this.subjects()?.length) {
      this.actions.getSubjects(this.registrationId, ResourceType.DraftRegistration);
    }
    effect(() => {
      const registrationSchemaId = this.draftRegistration()?.registrationSchemaId;
      if (registrationSchemaId && !this.isLoaded) {
        this.actions
          .getSchemaBlocks(registrationSchemaId || '')
          .pipe(
            tap(() => {
              this.isLoaded = true;
              this.loaderService.hide();
            })
          )
          .subscribe();
      }
    });

    effect(() => {
      const reviewStepIndex = this.pages().length + 1;
      if (this.isReviewPage) {
        this.currentStepIndex.set(reviewStepIndex);
      }
    });

    effect(() => {
      const stepState = untracked(() => this.stepsState());
      if (this.currentStepIndex() > 0) {
        this.actions.updateStepState('0', this.isMetaDataInvalid(), stepState?.[0]?.touched || false);
      }
      if (this.pages().length && this.currentStepIndex() > 0 && this.stepsData()) {
        for (let i = 1; i < this.currentStepIndex(); i++) {
          const pageStep = this.pages()[i - 1];
          const allQuestions = this.getAllQuestions(pageStep);
          const isStepInvalid =
            allQuestions?.some((question) => {
              const questionData = this.stepsData()[question.responseKey!];
              return question.required && (Array.isArray(questionData) ? !questionData.length : !questionData);
            }) || false;
          this.actions.updateStepState(i.toString(), isStepInvalid, stepState?.[i]?.touched || false);
        }
      }
    });
  }

  stepChange(step: StepOption): void {
    this.currentStepIndex.set(step.index);
    const pageLink = this.steps()[step.index].routeLink;
    this.router.navigate([`/registries/drafts/${this.registrationId}/`, pageLink]);
  }

  private getAllQuestions(pageStep: PageSchema): Question[] {
    return [
      ...(pageStep?.questions ?? []),
      ...(pageStep?.sections?.flatMap((section) => section.questions ?? []) ?? []),
    ];
  }

  ngOnDestroy(): void {
    this.actions.clearState();
  }
}
