import { Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockPipe, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ToastService } from '@osf/shared/services/toast.service';

import { RequestAccessComponent } from './request-access.component';

describe.only('RequestAccessComponent', () => {
  let component: RequestAccessComponent;
  let fixture: ComponentFixture<RequestAccessComponent>;

  const mockStore: jest.Mocked<Store> = {
    dispatch: jest.fn().mockResolvedValue(undefined) as any,
    select: jest.fn().mockReturnValue(of(undefined)) as any,
    selectSnapshot: jest.fn() as any,
    reset: jest.fn() as any,
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestAccessComponent, MockPipe(TranslatePipe)],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MockProvider(ToastService),
        MockProvider(ActivatedRoute, { params: of({}) }),
      ],
    }).compileComponents();

    TestBed.overrideProvider(Store, { useValue: mockStore });

    fixture = TestBed.createComponent(RequestAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
