import { provideStore } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SelectComponent } from '@osf/shared/components/select/select.component';
import { InstitutionsSearchState } from '@osf/shared/stores/institutions-search';

import { AdminInstitutionsComponent } from './admin-institutions.component';

describe.skip('AdminInstitutionsComponent', () => {
  let component: AdminInstitutionsComponent;
  let fixture: ComponentFixture<AdminInstitutionsComponent>;

  const mockActivatedRoute = {
    snapshot: {
      params: { 'institution-id': '42' },
      firstChild: { routeConfig: { path: 'summary' } },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInstitutionsComponent, ...MockComponents(LoadingSpinnerComponent, SelectComponent)],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        MockProvider(Router),
        provideStore([InstitutionsSearchState]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminInstitutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
