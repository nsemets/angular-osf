import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliatedInstitutionSelectComponent } from '@osf/shared/components/affiliated-institution-select/affiliated-institution-select.component';
import { InstitutionsSelectors } from '@osf/shared/stores/institutions';

import { RegistriesAffiliatedInstitutionComponent } from './registries-affiliated-institution.component';

import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('RegistriesAffiliatedInstitutionComponent', () => {
  let component: RegistriesAffiliatedInstitutionComponent;
  let fixture: ComponentFixture<RegistriesAffiliatedInstitutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistriesAffiliatedInstitutionComponent,
        OSFTestingModule,
        MockComponent(AffiliatedInstitutionSelectComponent),
      ],
      providers: [
        provideMockStore({
          signals: [
            { selector: InstitutionsSelectors.getUserInstitutions, value: [] },
            { selector: InstitutionsSelectors.areUserInstitutionsLoading, value: false },
            { selector: InstitutionsSelectors.getResourceInstitutions, value: [] },
            { selector: InstitutionsSelectors.areResourceInstitutionsLoading, value: false },
            { selector: InstitutionsSelectors.areResourceInstitutionsSubmitting, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistriesAffiliatedInstitutionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('draftId', 'draft-1');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch updateResourceInstitutions on selection', () => {
    const actionsMock = {
      updateResourceInstitutions: jest.fn(),
      fetchUserInstitutions: jest.fn(),
      fetchResourceInstitutions: jest.fn(),
    };
    Object.defineProperty(component, 'actions', { value: actionsMock });
    const selected = [{ id: 'i2' }] as any;
    component.institutionsSelected(selected);
    expect(actionsMock.updateResourceInstitutions).toHaveBeenCalledWith('draft-1', 8, selected);
  });

  it('should fetch user and resource institutions on init', () => {
    const actionsMock = {
      updateResourceInstitutions: jest.fn(),
      fetchUserInstitutions: jest.fn(),
      fetchResourceInstitutions: jest.fn(),
    };
    Object.defineProperty(component, 'actions', { value: actionsMock });
    component.ngOnInit();
    expect(actionsMock.fetchUserInstitutions).toHaveBeenCalled();
    expect(actionsMock.fetchResourceInstitutions).toHaveBeenCalledWith('draft-1', 8);
  });
});
