import { MockComponent, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { PasswordInputHintComponent } from '@osf/shared/components/password-input-hint/password-input-hint.component';
import { ToastService } from '@osf/shared/services/toast.service';

import { SignUpComponent } from './sign-up.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent, MockComponent(PasswordInputHintComponent)],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute),
        MockProvider(ToastService),
        MockProvider(AuthService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
