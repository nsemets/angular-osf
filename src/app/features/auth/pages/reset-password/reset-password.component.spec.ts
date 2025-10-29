import { TranslatePipe } from '@ngx-translate/core';
import { MockComponent, MockPipe, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ResetPasswordComponent } from '@osf/features/auth/pages';
import { PasswordInputHintComponent } from '@osf/shared/components/password-input-hint/password-input-hint.component';

import { TranslateServiceMock } from '@testing/mocks/translate.service.mock';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent, MockComponent(PasswordInputHintComponent), MockPipe(TranslatePipe)],
      providers: [
        TranslateServiceMock,
        MockProvider(AuthService),
        MockProvider(ActivatedRoute, { queryParams: of({}) }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
