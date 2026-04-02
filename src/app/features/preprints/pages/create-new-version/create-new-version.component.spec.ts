import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { StepperComponent } from '@osf/shared/components/stepper/stepper.component';
import { IS_WEB } from '@osf/shared/helpers/breakpoints.tokens';
import { BrandService } from '@osf/shared/services/brand.service';
import { BrowserTabService } from '@osf/shared/services/browser-tab.service';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { HeaderStyleService } from '@osf/shared/services/header-style.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { FileStepComponent, ReviewStepComponent } from '../../components';
import { createNewVersionStepsConst } from '../../constants';
import { PreprintSteps } from '../../enums';
import { PreprintProviderDetails } from '../../models';
import { GetPreprintProviderById, PreprintProvidersSelectors } from '../../store/preprint-providers';
import {
  DeletePreprint,
  FetchPreprintById,
  PreprintStepperSelectors,
  ResetPreprintStepperState,
} from '../../store/preprint-stepper';

import { CreateNewVersionComponent } from './create-new-version.component';

import { PREPRINT_PROVIDER_DETAILS_MOCK } from '@testing/mocks/preprint-provider-details';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { BrandServiceMock, BrandServiceMockType } from '@testing/providers/brand-service.mock';
import { BrowserTabServiceMock, BrowserTabServiceMockType } from '@testing/providers/browser-tab-service.mock';
import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { HeaderStyleServiceMock, HeaderStyleServiceMockType } from '@testing/providers/header-style-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import { mergeSignalOverrides, provideMockStore, SignalOverride } from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

describe('CreateNewVersionComponent', () => {
  let component: CreateNewVersionComponent;
  let fixture: ComponentFixture<CreateNewVersionComponent>;
  let store: Store;
  let routerMock: RouterMockType;
  let brandServiceMock: BrandServiceMockType;
  let headerStyleMock: HeaderStyleServiceMockType;
  let browserTabMock: BrowserTabServiceMockType;
  let customConfirmationServiceMock: CustomConfirmationServiceMockType;
  let toastServiceMock: ToastServiceMockType;

  const mockProvider: PreprintProviderDetails = PREPRINT_PROVIDER_DETAILS_MOCK;
  const mockProviderId = 'osf';
  const mockPreprintId = 'test_preprint_123';

  const defaultSignals: SignalOverride[] = [
    { selector: PreprintProvidersSelectors.getPreprintProviderDetails(mockProviderId), value: mockProvider },
    { selector: PreprintProvidersSelectors.isPreprintProviderDetailsLoading, value: false },
    { selector: PreprintStepperSelectors.hasBeenSubmitted, value: false },
  ];

  function setup(overrides?: { selectorOverrides?: SignalOverride[] }) {
    const signals = mergeSignalOverrides(defaultSignals, overrides?.selectorOverrides);

    routerMock = RouterMockBuilder.create().withNavigate(jest.fn().mockResolvedValue(true)).build();
    const routeMock = ActivatedRouteMockBuilder.create()
      .withParams({ providerId: mockProviderId, preprintId: mockPreprintId })
      .withQueryParams({})
      .build();

    brandServiceMock = BrandServiceMock.simple();
    headerStyleMock = HeaderStyleServiceMock.simple();
    browserTabMock = BrowserTabServiceMock.simple();
    customConfirmationServiceMock = CustomConfirmationServiceMock.simple();
    toastServiceMock = ToastServiceMock.simple();

    TestBed.configureTestingModule({
      imports: [CreateNewVersionComponent, ...MockComponents(StepperComponent, FileStepComponent, ReviewStepComponent)],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, routeMock),
        MockProvider(Router, routerMock),
        MockProvider(BrandService, brandServiceMock),
        MockProvider(HeaderStyleService, headerStyleMock),
        MockProvider(BrowserTabService, browserTabMock),
        MockProvider(CustomConfirmationService, customConfirmationServiceMock),
        MockProvider(ToastService, toastServiceMock),
        MockProvider(IS_WEB, of(true)),
        provideMockStore({ signals }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(CreateNewVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should initialize with correct default values', () => {
    setup();

    expect(component.PreprintSteps).toBe(PreprintSteps);
    expect(component.newVersionSteps).toBe(createNewVersionStepsConst);
    expect(component.currentStep()).toEqual(createNewVersionStepsConst[0]);
    expect(component.classes).toBe('flex-1 flex flex-column w-full');
  });

  it('should dispatch initial actions on creation', () => {
    setup();

    expect(store.dispatch).toHaveBeenCalledWith(new GetPreprintProviderById(mockProviderId));
    expect(store.dispatch).toHaveBeenCalledWith(new FetchPreprintById(mockPreprintId));
  });

  it('should apply branding when provider is available', () => {
    setup();

    expect(brandServiceMock.applyBranding).toHaveBeenCalledWith(mockProvider.brand);
    expect(headerStyleMock.applyHeaderStyles).toHaveBeenCalledWith(
      mockProvider.brand.primaryColor,
      mockProvider.brand.secondaryColor,
      mockProvider.brand.heroBackgroundImageUrl
    );
    expect(browserTabMock.updateTabStyles).toHaveBeenCalledWith(mockProvider.faviconUrl, mockProvider.name);
  });

  it('should reset services on destroy', () => {
    setup();

    component.ngOnDestroy();

    expect(headerStyleMock.resetToDefaults).toHaveBeenCalled();
    expect(brandServiceMock.resetBranding).toHaveBeenCalled();
    expect(browserTabMock.resetToDefaults).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new DeletePreprint());
    expect(store.dispatch).toHaveBeenCalledWith(new ResetPreprintStepperState());
  });

  it('should prevent beforeunload when not submitted', () => {
    setup();
    const event = { preventDefault: jest.fn() } as unknown as BeforeUnloadEvent;

    component.onBeforeUnload(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent beforeunload when submitted', () => {
    setup({ selectorOverrides: [{ selector: PreprintStepperSelectors.hasBeenSubmitted, value: true }] });
    const event = { preventDefault: jest.fn() } as unknown as BeforeUnloadEvent;

    component.onBeforeUnload(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent deactivation when not submitted', () => {
    setup();

    expect(component.canDeactivate()).toBe(false);
  });

  it('should allow deactivation when submitted', () => {
    setup({ selectorOverrides: [{ selector: PreprintStepperSelectors.hasBeenSubmitted, value: true }] });

    expect(component.canDeactivate()).toBe(true);
  });

  it('should ignore stepping forward via stepper', () => {
    setup();

    component.stepChange(createNewVersionStepsConst[1]);

    expect(component.currentStep()).toEqual(createNewVersionStepsConst[0]);
  });

  it('should allow stepping back via stepper', () => {
    setup();
    component.moveToNextStep();

    component.stepChange(createNewVersionStepsConst[0]);

    expect(component.currentStep()).toEqual(createNewVersionStepsConst[0]);
  });

  it('should move to next step', () => {
    setup();

    component.moveToNextStep();

    expect(component.currentStep()).toEqual(createNewVersionStepsConst[1]);
  });

  it('should not move past the last step', () => {
    setup();
    component.currentStep.set(createNewVersionStepsConst[createNewVersionStepsConst.length - 1]);

    component.moveToNextStep();

    expect(component.currentStep()).toEqual(createNewVersionStepsConst[createNewVersionStepsConst.length - 1]);
  });

  it('should navigate back to preprint page', () => {
    setup();

    component.navigateBack();

    expect(routerMock.navigate).toHaveBeenCalledWith([mockPreprintId.split('_')[0]]);
  });

  it('should confirm preprint deletion request', () => {
    setup();

    component.requestDeletePreprint();

    expect(customConfirmationServiceMock.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'preprints.preprintStepper.deleteDraft.header',
      messageKey: 'preprints.preprintStepper.deleteDraft.message',
      onConfirm: expect.any(Function),
    });
  });

  it('should delete preprint, reset state, show toast and navigate on delete confirm', () => {
    setup();

    component.requestDeletePreprint();
    const confirmDeleteCall = customConfirmationServiceMock.confirmDelete.mock.calls[0][0];
    confirmDeleteCall.onConfirm();

    expect(store.dispatch).toHaveBeenCalledWith(new DeletePreprint());
    expect(store.dispatch).toHaveBeenCalledWith(new ResetPreprintStepperState());
    expect(toastServiceMock.showSuccess).toHaveBeenCalledWith('preprints.preprintStepper.deleteDraft.success');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/my-preprints');
  });

  it('should allow deactivation after preprint is deleted', () => {
    setup();

    component.requestDeletePreprint();
    const confirmDeleteCall = customConfirmationServiceMock.confirmDelete.mock.calls[0][0];
    confirmDeleteCall.onConfirm();

    expect(component.canDeactivate()).toBe(true);
  });

  it('should not delete preprint again on destroy after successful deletion', () => {
    setup();

    component.requestDeletePreprint();
    const confirmDeleteCall = customConfirmationServiceMock.confirmDelete.mock.calls[0][0];
    confirmDeleteCall.onConfirm();
    (store.dispatch as jest.Mock).mockClear();

    component.ngOnDestroy();

    expect(store.dispatch).toHaveBeenCalledWith(new ResetPreprintStepperState());
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });
});
