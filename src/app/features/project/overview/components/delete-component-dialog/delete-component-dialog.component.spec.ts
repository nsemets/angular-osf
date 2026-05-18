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

import { DeleteComponentDialogComponent } from './delete-component-dialog.component';

describe('DeleteComponentDialogComponent', () => {
  let component: DeleteComponentDialogComponent;
  let fixture: ComponentFixture<DeleteComponentDialogComponent>;
  let dialogRef: DynamicDialogRef;

  const adminComponents: NodeShortInfoModel[] = [
    {
      id: 'c1',
      title: 'Component 1',
      isPublic: true,
      permissions: [UserPermissions.Admin],
    },
    {
      id: 'c2',
      title: 'Component 2',
      isPublic: true,
      permissions: [UserPermissions.Admin, UserPermissions.Write],
    },
  ];

  const defaultSignals: SignalOverride[] = [
    { selector: CurrentResourceSelectors.getResourceWithChildren, value: adminComponents },
    { selector: CurrentResourceSelectors.allResourceChildrenHaveAdminAccess, value: true },
  ];

  function setup(overrides: BaseSetupOverrides = {}) {
    const signals = mergeSignalOverrides(defaultSignals, overrides.selectorOverrides);

    TestBed.configureTestingModule({
      imports: [DeleteComponentDialogComponent],
      providers: [provideOSFCore(), provideDynamicDialogRefMock(), provideMockStore({ signals })],
    });

    dialogRef = TestBed.inject(DynamicDialogRef);
    fixture = TestBed.createComponent(DeleteComponentDialogComponent);
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

  it('should return true for hasAdminAccessForAllComponents when all components have admin access', () => {
    setup();

    expect(component.hasAdminAccessForAllComponents()).toBe(true);
  });

  it('should return true for hasSubComponents when there are multiple components', () => {
    setup();

    expect(component.hasSubComponents()).toBe(true);
  });

  it('should return false for hasSubComponents when there is one component', () => {
    setup({
      selectorOverrides: [{ selector: CurrentResourceSelectors.getResourceWithChildren, value: [adminComponents[0]] }],
    });

    expect(component.hasSubComponents()).toBe(false);
  });

  it('should return true for isInputValid when confirmation matches selected scientist', () => {
    setup();

    component.userInput.set(component.selectedScientist);

    expect(component.isInputValid()).toBe(true);
  });

  it('should close dialog with true on delete', () => {
    setup();

    component.handleDeleteComponent();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
