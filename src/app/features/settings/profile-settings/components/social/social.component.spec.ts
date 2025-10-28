import { Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockComponent, MockPipe, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialFormComponent } from '../social-form/social-form.component';

import { SocialComponent } from './social.component';

import { MOCK_STORE } from '@testing/mocks';

describe.skip('SocialComponent', () => {
  let component: SocialComponent;
  let fixture: ComponentFixture<SocialComponent>;

  beforeEach(async () => {
    const store = MOCK_STORE;
    store.selectSignal.mockImplementation(() => {
      return signal([]);
    });
    store.dispatch.mockImplementation(() => {
      return of();
    });

    await TestBed.configureTestingModule({
      imports: [SocialComponent, MockComponent(SocialFormComponent), MockPipe(TranslatePipe)],
      providers: [provideHttpClient(), provideHttpClientTesting(), MockProvider(Store, store)],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
