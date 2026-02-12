import { MockComponents, MockProvider } from 'ng-mocks';

import { of, Subject } from 'rxjs';

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { RegistriesSelectors } from '@osf/features/registries/store';
import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { LicenseDisplayComponent } from '@osf/shared/components/license-display/license-display.component';
import { RegistrationBlocksDataComponent } from '@osf/shared/components/registration-blocks-data/registration-blocks-data.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { ContributorsSelectors } from '@osf/shared/stores/contributors';
import { SubjectsSelectors } from '@osf/shared/stores/subjects';

import { ReviewComponent } from './review.component';

import { OSFTestingModule } from '@testing/osf.testing.module';
import { CustomConfirmationServiceMockBuilder } from '@testing/providers/custom-confirmation-provider.mock';
import { CustomDialogServiceMockBuilder } from '@testing/providers/custom-dialog-provider.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder } from '@testing/providers/router-provider.mock';
import { provideMockStore } from '@testing/providers/store-provider.mock';
import { ToastServiceMockBuilder } from '@testing/providers/toast-provider.mock';

function createDefaultSignals(overrides: { selector: any; value: any }[] = []) {
  const defaults = [
    { selector: RegistriesSelectors.getPagesSchema, value: [] },
    {
      selector: RegistriesSelectors.getDraftRegistration,
      value: {
        id: 'draft-1',
        providerId: 'prov-1',
        currentUserPermissions: [],
        hasProject: false,
        license: { options: {} },
      },
    },
    { selector: RegistriesSelectors.isDraftSubmitting, value: false },
    { selector: RegistriesSelectors.isDraftLoading, value: false },
    { selector: RegistriesSelectors.getStepsData, value: {} },
    { selector: RegistriesSelectors.getRegistrationComponents, value: [] },
    { selector: RegistriesSelectors.getRegistrationLicense, value: null },
    { selector: RegistriesSelectors.getRegistration, value: { id: 'new-reg-1' } },
    { selector: RegistriesSelectors.getStepsState, value: { 0: { invalid: false } } },
    { selector: RegistriesSelectors.hasDraftAdminAccess, value: true },
    { selector: ContributorsSelectors.getContributors, value: [] },
    { selector: ContributorsSelectors.isContributorsLoading, value: false },
    { selector: ContributorsSelectors.hasMoreContributors, value: false },
    { selector: SubjectsSelectors.getSelectedSubjects, value: [] },
  ];

  return overrides.length
    ? defaults.map((s) => {
        const override = overrides.find((o) => o.selector === s.selector);
        return override ? { ...s, value: override.value } : s;
      })
    : defaults;
}

async function setupTestBed(
  opts: {
    selectorOverrides?: { selector: any; value: any }[];
    dialogCloseSubject?: Subject<any>;
  } = {}
) {
  const mockRouter = RouterMockBuilder.create().withUrl('/registries/123/review').build();
  const mockActivatedRoute = ActivatedRouteMockBuilder.create().withParams({ id: 'draft-1' }).build();

  const dialogClose$ = opts.dialogCloseSubject ?? new Subject<any>();
  const mockDialog = CustomDialogServiceMockBuilder.create()
    .withOpen(
      jest.fn().mockReturnValue({
        onClose: dialogClose$.pipe(),
        close: jest.fn(),
      })
    )
    .build();

  const mockConfirm = CustomConfirmationServiceMockBuilder.create()
    .withConfirmDelete(jest.fn((o: any) => o.onConfirm && o.onConfirm()))
    .build();
  const mockToast = ToastServiceMockBuilder.create().build();

  await TestBed.configureTestingModule({
    imports: [
      ReviewComponent,
      OSFTestingModule,
      ...MockComponents(RegistrationBlocksDataComponent, ContributorsListComponent, LicenseDisplayComponent),
    ],
    providers: [
      MockProvider(Router, mockRouter),
      MockProvider(ActivatedRoute, mockActivatedRoute),
      MockProvider(CustomDialogService, mockDialog),
      MockProvider(CustomConfirmationService, mockConfirm),
      MockProvider(ToastService, mockToast),
      provideMockStore({ signals: createDefaultSignals(opts.selectorOverrides) }),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ReviewComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component, mockRouter, mockActivatedRoute, mockDialog, mockConfirm, mockToast, dialogClose$ };
}

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let mockRouter: ReturnType<RouterMockBuilder['build']>;
  let mockDialog: ReturnType<CustomDialogServiceMockBuilder['build']>;
  let mockToast: ReturnType<ToastServiceMockBuilder['build']>;
  let dialogClose$: Subject<any>;

  beforeEach(async () => {
    const result = await setupTestBed();
    component = result.component;
    mockRouter = result.mockRouter;
    mockDialog = result.mockDialog;
    mockToast = result.mockToast;
    dialogClose$ = result.dialogClose$;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to previous step on goBack', () => {
    Object.defineProperty(component, 'pages', { value: () => [{ id: '1' }, { id: '2' }] });

    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['../', 2],
      expect.objectContaining({ relativeTo: expect.anything() })
    );
  });

  it('should navigate to step 0 when pages is empty on goBack', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['../', 0],
      expect.objectContaining({ relativeTo: expect.anything() })
    );
  });

  it('should dispatch deleteDraft and navigate on confirm', () => {
    const mockActions = {
      deleteDraft: jest.fn().mockReturnValue(of({})),
      clearState: jest.fn(),
      resetContributorsState: jest.fn(),
    };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.deleteDraft();

    expect(mockActions.deleteDraft).toHaveBeenCalledWith('draft-1');
    expect(mockActions.clearState).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/registries/prov-1/new');
  });

  it('should open select components dialog when components exist', () => {
    Object.defineProperty(component, 'components', {
      value: () => [{ id: 'comp-1' }],
    });

    component.confirmRegistration();

    expect(mockDialog.open).toHaveBeenCalled();
    const firstCallArgs = (mockDialog.open as jest.Mock).mock.calls[0];
    expect(firstCallArgs[1].header).toBe('registries.review.selectComponents.title');
  });

  it('should open confirm registration dialog when no components', () => {
    component.confirmRegistration();

    expect(mockDialog.open).toHaveBeenCalled();
    const firstCallArgs = (mockDialog.open as jest.Mock).mock.calls[0];
    expect(firstCallArgs[1].header).toBe('registries.review.confirmation.title');
  });

  it('should show success toast and navigate on successful registration', () => {
    Object.defineProperty(component, 'newRegistration', { value: () => ({ id: 'reg-123' }) });

    component.openConfirmRegistrationDialog();
    dialogClose$.next(true);

    expect(mockToast.showSuccess).toHaveBeenCalledWith('registries.review.confirmation.successMessage');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reg-123/overview']);
  });

  it('should reopen select components dialog when confirm dialog closed with falsy result and components exist', () => {
    Object.defineProperty(component, 'components', {
      value: () => [{ id: 'comp-1' }],
    });

    component.openConfirmRegistrationDialog(['comp-1']);
    dialogClose$.next(false);

    expect(mockDialog.open).toHaveBeenCalledTimes(2);
  });

  it('should not navigate when confirm dialog closed with falsy result and no components', () => {
    component.openConfirmRegistrationDialog();
    dialogClose$.next(false);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should pass selected components from select dialog to confirm dialog', () => {
    Object.defineProperty(component, 'components', {
      value: () => [{ id: 'comp-1' }],
    });
    Object.defineProperty(component, 'draftRegistration', {
      value: () => ({ branchedFrom: { id: 'proj-1' }, providerId: 'prov-1' }),
    });

    const selectClose$ = new Subject<any>();
    const confirmClose$ = new Subject<any>();
    let callCount = 0;
    (mockDialog.open as jest.Mock).mockImplementation(() => {
      callCount++;
      const subj = callCount === 1 ? selectClose$ : confirmClose$;
      return { onClose: subj.pipe(), close: jest.fn() };
    });

    component.openSelectComponentsForRegistrationDialog();
    selectClose$.next(['comp-1']);

    expect(mockDialog.open).toHaveBeenCalledTimes(2);
    const secondCallArgs = (mockDialog.open as jest.Mock).mock.calls[1];
    expect(secondCallArgs[1].data.components).toEqual(['comp-1']);
  });

  it('should not open confirm dialog when select components dialog returns falsy', () => {
    Object.defineProperty(component, 'components', {
      value: () => [{ id: 'comp-1' }],
    });

    const selectClose$ = new Subject<any>();
    (mockDialog.open as jest.Mock).mockReturnValue({
      onClose: selectClose$.pipe(),
      close: jest.fn(),
    });

    component.openSelectComponentsForRegistrationDialog();
    selectClose$.next(null);

    expect(mockDialog.open).toHaveBeenCalledTimes(1);
  });

  it('should dispatch loadMoreContributors', () => {
    const mockActions = { loadMoreContributors: jest.fn(), resetContributorsState: jest.fn() };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.loadMoreContributors();

    expect(mockActions.loadMoreContributors).toHaveBeenCalledWith('draft-1', ResourceType.DraftRegistration);
  });

  it('should reset contributors state on destroy', () => {
    const mockActions = { resetContributorsState: jest.fn() };
    Object.defineProperty(component, 'actions', { value: mockActions });

    component.ngOnDestroy();

    expect(mockActions.resetContributorsState).toHaveBeenCalled();
  });

  it('should compute isDraftInvalid as false when all steps are valid', () => {
    expect(component.isDraftInvalid()).toBe(false);
  });

  it('should compute isDraftInvalid as true when any step is invalid', async () => {
    const { component: c } = await setupTestBed({
      selectorOverrides: [{ selector: RegistriesSelectors.getStepsState, value: { 0: { invalid: true } } }],
    });

    expect(c.isDraftInvalid()).toBe(true);
  });

  it('should compute registerButtonDisabled as false when valid and has admin access', () => {
    expect(component.registerButtonDisabled()).toBe(false);
  });

  it('should compute registerButtonDisabled as true when draft is loading', async () => {
    const { component: c } = await setupTestBed({
      selectorOverrides: [{ selector: RegistriesSelectors.isDraftLoading, value: true }],
    });

    expect(c.registerButtonDisabled()).toBe(true);
  });

  it('should compute registerButtonDisabled as true when draft is invalid', async () => {
    const { component: c } = await setupTestBed({
      selectorOverrides: [{ selector: RegistriesSelectors.getStepsState, value: { 0: { invalid: true } } }],
    });

    expect(c.registerButtonDisabled()).toBe(true);
  });

  it('should compute registerButtonDisabled as true when no admin access', async () => {
    const { component: c } = await setupTestBed({
      selectorOverrides: [{ selector: RegistriesSelectors.hasDraftAdminAccess, value: false }],
    });

    expect(c.registerButtonDisabled()).toBe(true);
  });

  it('should compute licenseOptionsRecord from draft license options', async () => {
    const { component: c } = await setupTestBed({
      selectorOverrides: [
        {
          selector: RegistriesSelectors.getDraftRegistration,
          value: {
            id: 'draft-1',
            providerId: 'prov-1',
            hasProject: false,
            license: { options: { year: '2026', copyright: 'Test' } },
          },
        },
      ],
    });

    expect(c.licenseOptionsRecord()).toEqual({ year: '2026', copyright: 'Test' });
  });

  it('should compute licenseOptionsRecord as empty when no license options', () => {
    expect(component.licenseOptionsRecord()).toEqual({});
  });

  it('should pass draftId and providerId to confirm registration dialog data', () => {
    Object.defineProperty(component, 'draftRegistration', {
      value: () => ({ branchedFrom: { id: 'proj-1', type: 'nodes' }, providerId: 'prov-1' }),
    });

    component.openConfirmRegistrationDialog();

    const callArgs = (mockDialog.open as jest.Mock).mock.calls[0];
    expect(callArgs[1].data.draftId).toBe('draft-1');
    expect(callArgs[1].data.providerId).toBe('prov-1');
    expect(callArgs[1].data.projectId).toBe('proj-1');
  });

  it('should set projectId to null when branchedFrom type is not nodes', () => {
    Object.defineProperty(component, 'draftRegistration', {
      value: () => ({ branchedFrom: { id: 'proj-1', type: 'registrations' }, providerId: 'prov-1' }),
    });

    component.openConfirmRegistrationDialog();

    const callArgs = (mockDialog.open as jest.Mock).mock.calls[0];
    expect(callArgs[1].data.projectId).toBeNull();
  });

  it('should pass components array to confirm registration dialog', () => {
    component.openConfirmRegistrationDialog(['comp-1', 'comp-2']);

    const callArgs = (mockDialog.open as jest.Mock).mock.calls[0];
    expect(callArgs[1].data.components).toEqual(['comp-1', 'comp-2']);
  });

  it('should not navigate after registration when newRegistration has no id', () => {
    Object.defineProperty(component, 'newRegistration', { value: () => ({ id: null }) });

    component.openConfirmRegistrationDialog();
    dialogClose$.next(true);

    expect(mockToast.showSuccess).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
