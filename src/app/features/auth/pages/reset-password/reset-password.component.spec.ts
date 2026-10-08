import { MockComponent, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { PasswordInputHintComponent } from '@osf/shared/components/password-input-hint/password-input-hint.component';
import { LoaderService } from '@osf/shared/services/loader.service';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { AuthServiceMock, AuthServiceMockType } from '@testing/providers/auth-service.mock';
import { LoaderServiceMock } from '@testing/providers/loader-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';

import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authService: AuthServiceMockType;
  let loaderService: LoaderServiceMock;

  const validPassword = 'Password1!';

  beforeEach(() => {
    authService = AuthServiceMock.simple();
    loaderService = new LoaderServiceMock();
    const mockRoute = ActivatedRouteMockBuilder.create().withParams({ userId: 'user-1', token: 'token-1' }).build();

    TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, MockComponent(PasswordInputHintComponent)],
      providers: [
        provideOSFCore(),
        MockProvider(AuthService, authService),
        MockProvider(LoaderService, loaderService),
        MockProvider(ActivatedRoute, mockRoute),
      ],
    });

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not reset password when form is invalid', () => {
    component.onSubmit();

    expect(authService.resetPassword).not.toHaveBeenCalled();
    expect(loaderService.show).not.toHaveBeenCalled();
  });

  it('should show mismatch error when passwords differ and both fields are dirty', () => {
    component.resetPasswordForm.setValue({
      newPassword: validPassword,
      confirmNewPassword: 'Different1!',
    });
    component.resetPasswordForm.get('newPassword')?.markAsDirty();
    component.resetPasswordForm.get('confirmNewPassword')?.markAsDirty();
    fixture.detectChanges();

    expect(component.isMismatchError).toBe(true);
    expect(fixture.nativeElement.querySelector('p-message')).toBeTruthy();
  });

  it('should reset password, toggle loader, and show success', () => {
    component.resetPasswordForm.setValue({
      newPassword: validPassword,
      confirmNewPassword: validPassword,
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(loaderService.show).toHaveBeenCalled();
    expect(authService.resetPassword).toHaveBeenCalledWith('user-1', 'token-1', validPassword);
    expect(loaderService.hide).toHaveBeenCalled();
    expect(component.isFormSubmitted()).toBe(true);
    expect(fixture.nativeElement.querySelector('.reset-password-container')).toBeNull();
    expect(fixture.nativeElement.querySelector('.message-container')).toBeTruthy();
  });

  it('should navigate to sign in', () => {
    component.backToSignIn();

    expect(authService.navigateToSignIn).toHaveBeenCalled();
  });
});
