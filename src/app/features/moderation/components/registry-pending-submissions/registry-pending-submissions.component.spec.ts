import { provideStore } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockComponents, MockPipes } from 'ng-mocks';

import { of } from 'rxjs';

import { TitleCasePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { RegistrySubmissionItemComponent } from '@osf/features/moderation/components';
import { RegistryModerationState } from '@osf/features/moderation/store/registry-moderation';
import { CustomPaginatorComponent, IconComponent, LoadingSpinnerComponent, SelectComponent } from '@shared/components';

import { RegistryPendingSubmissionsComponent } from './registry-pending-submissions.component';

describe('RegistryPendingSubmissionsComponent', () => {
  let component: RegistryPendingSubmissionsComponent;
  let fixture: ComponentFixture<RegistryPendingSubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistryPendingSubmissionsComponent,
        ...MockComponents(
          SelectComponent,
          IconComponent,
          LoadingSpinnerComponent,
          RegistrySubmissionItemComponent,
          CustomPaginatorComponent
        ),
        MockPipes(TitleCasePipe, TranslatePipe),
      ],
      providers: [
        provideStore([RegistryModerationState]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              params: of({ providerId: '1' }),
            },
            snapshot: {
              queryParams: {},
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistryPendingSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
