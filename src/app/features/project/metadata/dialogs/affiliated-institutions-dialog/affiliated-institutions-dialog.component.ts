import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ProjectOverview } from '@osf/features/project/overview/models';

interface Institution {
  id: string;
  type: string;
  name: string;
  description: string;
  logo: string;
  selected?: boolean;
}

interface AffiliatedInstitutionsForm {
  institutions: FormArray<FormControl<boolean>>;
}

@Component({
  selector: 'osf-affiliated-institutions-dialog',
  imports: [Button, Checkbox, TranslatePipe, ReactiveFormsModule],
  templateUrl: './affiliated-institutions-dialog.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AffiliatedInstitutionsDialogComponent {
  protected dialogRef = inject(DynamicDialogRef);
  protected config = inject(DynamicDialogConfig);

  // Mock data - replace with actual institutions from API
  institutions: Institution[] = [
    { id: '1', type: 'institution', name: 'Affiliated Institutions name example', description: '', logo: '' },
    { id: '2', type: 'institution', name: 'Affiliated Institutions name example', description: '', logo: '' },
    { id: '3', type: 'institution', name: 'Affiliated Institutions name example', description: '', logo: '' },
  ];

  affiliatedInstitutionsForm = new FormGroup<AffiliatedInstitutionsForm>({
    institutions: new FormArray<FormControl<boolean>>(
      this.institutions.map(
        (institution) =>
          new FormControl(this.currentProject?.affiliatedInstitutions?.some((i) => i.id === institution.id) ?? false, {
            nonNullable: true,
          })
      )
    ),
  });

  get currentProject(): ProjectOverview | null {
    return this.config.data?.currentProject || null;
  }

  save(): void {
    const selectedInstitutions = this.institutions.filter(
      (_, index) => this.affiliatedInstitutionsForm.value.institutions?.[index]
    );
    this.dialogRef.close({
      institutions: selectedInstitutions,
      projectId: this.currentProject?.id,
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
