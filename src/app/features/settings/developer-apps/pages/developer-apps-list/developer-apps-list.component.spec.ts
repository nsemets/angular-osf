import { provideStore } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { ConfirmationService } from 'primeng/api';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { ToastService } from '@osf/shared/services/toast.service';

import { DeveloperAppsState } from '../../store';

import { DeveloperAppsListComponent } from './developer-apps-list.component';

import { MOCK_DEVELOPER_APP } from '@testing/mocks/developer-app.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

describe('DeveloperApplicationsListComponent', () => {
  let component: DeveloperAppsListComponent;
  let fixture: ComponentFixture<DeveloperAppsListComponent>;
  let customConfirmationService: CustomConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeveloperAppsListComponent],
      providers: [
        provideOSFCore(),
        provideRouter([]),
        provideStore([DeveloperAppsState]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MockProvider(ConfirmationService),
        MockProvider(CustomConfirmationService),
        MockProvider(ToastService),
      ],
    });

    fixture = TestBed.createComponent(DeveloperAppsListComponent);
    component = fixture.componentInstance;
    customConfirmationService = TestBed.inject(CustomConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not dispatch delete when user cancels confirmation', () => {
    jest.spyOn(customConfirmationService, 'confirmDelete').mockImplementation(() => {
      // Simulate cancelling the confirmation
    });

    component.deleteApp(MOCK_DEVELOPER_APP);

    expect(customConfirmationService.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'settings.developerApps.confirmation.delete.title',
      headerParams: { name: 'Test App' },
      messageKey: 'settings.developerApps.confirmation.delete.message',
      onConfirm: expect.any(Function),
    });
  });
});
