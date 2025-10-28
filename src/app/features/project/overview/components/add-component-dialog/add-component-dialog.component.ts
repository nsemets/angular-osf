import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserSelectors } from '@core/store/user';
import { AffiliatedInstitutionSelectComponent } from '@osf/shared/components';
import { ComponentFormControls } from '@osf/shared/enums';
import { CustomValidators } from '@osf/shared/helpers';
import { ComponentForm, Institution } from '@osf/shared/models';
import { ToastService } from '@osf/shared/services';
import { FetchUserInstitutions, InstitutionsSelectors } from '@osf/shared/stores/institutions';
import { FetchRegions, RegionsSelectors } from '@osf/shared/stores/regions';

import { CreateComponent, GetComponents, ProjectOverviewSelectors } from '../../store';

@Component({
  selector: 'osf-add-component-dialog',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    Checkbox,
    Select,
    Textarea,
    TranslatePipe,
    AffiliatedInstitutionSelectComponent,
  ],
  templateUrl: './add-component-dialog.component.html',
  styleUrl: './add-component-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddComponentDialogComponent implements OnInit {
  private readonly toastService = inject(ToastService);

  dialogRef = inject(DynamicDialogRef);
  destroyRef = inject(DestroyRef);
  ComponentFormControls = ComponentFormControls;

  selectedInstitutions = signal<Institution[]>([]);
  storageLocations = select(RegionsSelectors.getRegions);
  currentUser = select(UserSelectors.getCurrentUser);
  currentProject = select(ProjectOverviewSelectors.getProject);
  areRegionsLoading = select(RegionsSelectors.areRegionsLoading);
  isSubmitting = select(ProjectOverviewSelectors.getComponentsSubmitting);
  userInstitutions = select(InstitutionsSelectors.getUserInstitutions);
  areUserInstitutionsLoading = select(InstitutionsSelectors.areUserInstitutionsLoading);

  actions = createDispatchMap({
    createComponent: CreateComponent,
    getComponents: GetComponents,
    getRegions: FetchRegions,
    fetchUserInstitutions: FetchUserInstitutions,
  });

  componentForm = new FormGroup<ComponentForm>({
    [ComponentFormControls.Title]: new FormControl('', {
      nonNullable: true,
      validators: [CustomValidators.requiredTrimmed()],
    }),
    [ComponentFormControls.StorageLocation]: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    [ComponentFormControls.Affiliations]: new FormControl<string[]>([], {
      nonNullable: true,
    }),
    [ComponentFormControls.Description]: new FormControl('', {
      nonNullable: true,
    }),
    [ComponentFormControls.AddContributors]: new FormControl(false, {
      nonNullable: true,
    }),
    [ComponentFormControls.AddTags]: new FormControl(false, {
      nonNullable: true,
    }),
  });

  constructor() {
    this.setupEffects();
  }

  ngOnInit(): void {
    this.actions.getRegions();
    this.actions.fetchUserInstitutions();
  }

  setSelectedInstitutions(institutions: Institution[]) {
    const selectedValues = institutions.map((inst) => inst.id);
    this.componentForm.get(ComponentFormControls.Affiliations)?.setValue(selectedValues);
  }

  submitForm(): void {
    if (this.componentForm.invalid) {
      this.componentForm.markAllAsTouched();
      return;
    }

    const formValue = this.componentForm.getRawValue();
    const project = this.currentProject();

    if (!project) {
      return;
    }

    const tags = formValue.addTags ? project.tags : [];

    this.actions
      .createComponent(
        project.id,
        formValue.title,
        formValue.description,
        tags,
        formValue.storageLocation,
        formValue.affiliations,
        formValue.addContributors
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dialogRef.close();
          this.actions.getComponents(project.id);
          this.toastService.showSuccess('project.overview.dialog.toast.addComponent.success');
        },
      });
  }

  private setupEffects(): void {
    effect(() => {
      const storageLocations = this.storageLocations();
      if (!storageLocations?.length) return;

      const storageLocationControl = this.componentForm.controls[ComponentFormControls.StorageLocation];
      if (!storageLocationControl.value) {
        const defaultRegion = this.currentUser()?.defaultRegionId ?? storageLocations[0].id;
        storageLocationControl.setValue(defaultRegion);
      }
    });

    effect(() => {
      const projectInstitutions = this.currentProject()?.affiliatedInstitutions;
      const userInstitutions = this.userInstitutions();

      if (projectInstitutions && projectInstitutions.length && userInstitutions.length) {
        const matchedInstitutions = projectInstitutions
          .map((projInst) => userInstitutions.find((userInst) => userInst.id === projInst.id))
          .filter((inst) => inst !== undefined);

        this.selectedInstitutions.set(matchedInstitutions);

        const institutionIds = matchedInstitutions.map((inst) => inst.id);
        this.componentForm.get(ComponentFormControls.Affiliations)?.setValue(institutionIds);
      }
    });
  }
}
