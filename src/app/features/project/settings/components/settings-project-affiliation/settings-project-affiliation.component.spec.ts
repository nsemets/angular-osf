import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Institution } from '@osf/shared/models';
import { InstitutionsSelectors } from '@osf/shared/stores/institutions';

import { SettingsProjectAffiliationComponent } from './settings-project-affiliation.component';

import { MOCK_INSTITUTION } from '@testing/mocks';
import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('SettingsProjectAffiliationComponent', () => {
  let component: SettingsProjectAffiliationComponent;
  let fixture: ComponentFixture<SettingsProjectAffiliationComponent>;

  const mockInstitutions: Institution[] = [MOCK_INSTITUTION];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsProjectAffiliationComponent, OSFTestingModule],
      providers: [
        provideMockStore({
          signals: [{ selector: InstitutionsSelectors.getUserInstitutions, value: [] }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsProjectAffiliationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('affiliations', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with empty affiliations array', () => {
    fixture.componentRef.setInput('affiliations', []);
    fixture.detectChanges();

    expect(component.affiliations()).toEqual([]);
  });

  it('should display affiliations when provided', () => {
    fixture.componentRef.setInput('affiliations', mockInstitutions);
    fixture.detectChanges();

    expect(component.affiliations()).toEqual(mockInstitutions);
  });

  it('should emit removed event when removeAffiliation is called', () => {
    jest.spyOn(component.removed, 'emit');
    fixture.componentRef.setInput('affiliations', mockInstitutions);
    fixture.detectChanges();

    component.removeAffiliation(MOCK_INSTITUTION);

    expect(component.removed.emit).toHaveBeenCalledWith(MOCK_INSTITUTION);
  });
});
