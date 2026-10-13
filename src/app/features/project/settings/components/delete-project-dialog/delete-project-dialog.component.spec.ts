import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';
import { CurrentResourceSelectors } from '@osf/shared/stores/current-resource';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { provideDynamicDialogRefMock } from '@testing/providers/dynamic-dialog-ref.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { DeleteProjectDialogComponent } from './delete-project-dialog.component';

describe('DeleteProjectDialogComponent', () => {
  let component: DeleteProjectDialogComponent;
  let fixture: ComponentFixture<DeleteProjectDialogComponent>;
  let dialogRef: DynamicDialogRef;

  const projects: NodeShortInfoModel[] = [
    {
      id: 'p1',
      title: 'Project 1',
      isPublic: true,
      permissions: [UserPermissions.Admin],
    },
    {
      id: 'p2',
      title: 'Project 2',
      isPublic: true,
      permissions: [UserPermissions.Admin],
    },
  ];

  const defaultSignals: SignalOverride[] = [
    { selector: CurrentResourceSelectors.getResourceWithChildren, value: projects },
    { selector: CurrentResourceSelectors.allResourceChildrenHaveAdminAccess, value: true },
  ];

  function setup(overrides: BaseSetupOverrides = {}) {
    const signals = mergeSignalOverrides(defaultSignals, overrides.selectorOverrides);

    TestBed.configureTestingModule({
      imports: [DeleteProjectDialogComponent],
      providers: [provideOSFCore(), provideDynamicDialogRefMock(), provideMockStore({ signals })],
    });

    dialogRef = TestBed.inject(DynamicDialogRef);
    fixture = TestBed.createComponent(DeleteProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it('should return false for hasAdminAccessForAllComponents when access is denied', () => {
    setup({
      selectorOverrides: [{ selector: CurrentResourceSelectors.allResourceChildrenHaveAdminAccess, value: false }],
    });

    expect(component.hasAdminAccessForAllComponents()).toBe(false);
  });

  it('should return true for isInputValid when confirmation matches selected scientist', () => {
    setup();

    component.userInput.set(component.selectedScientist);

    expect(component.isInputValid()).toBe(true);
  });

  it('should close dialog with true on delete', () => {
    setup();

    component.handleDeleteProject();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
