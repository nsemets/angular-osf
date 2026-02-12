import { MockComponent } from 'ng-mocks';

import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { RegistriesSelectors } from '@osf/features/registries/store';
import { LicenseComponent } from '@osf/shared/components/license/license.component';
import { LicenseModel } from '@shared/models/license/license.model';

import { RegistriesLicenseComponent } from './registries-license.component';

import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('RegistriesLicenseComponent', () => {
  let component: RegistriesLicenseComponent;
  let fixture: ComponentFixture<RegistriesLicenseComponent>;
  let mockActions: { fetchLicenses: jest.Mock; saveLicense: jest.Mock };
  let licensesSignal: WritableSignal<LicenseModel[]>;
  let selectedLicenseSignal: WritableSignal<{ id: string; options?: any } | null>;
  let draftRegistrationSignal: WritableSignal<Partial<{ providerId: string; defaultLicenseId: string }> | null>;

  beforeEach(async () => {
    licensesSignal = signal<LicenseModel[]>([]);
    selectedLicenseSignal = signal<{ id: string; options?: any } | null>(null);
    draftRegistrationSignal = signal<Partial<{ providerId: string; defaultLicenseId: string }> | null>({
      providerId: 'osf',
    });

    await TestBed.configureTestingModule({
      imports: [RegistriesLicenseComponent, OSFTestingModule, MockComponent(LicenseComponent)],
      providers: [
        provideMockStore({
          signals: [
            { selector: RegistriesSelectors.getLicenses, value: licensesSignal },
            { selector: RegistriesSelectors.getSelectedLicense, value: selectedLicenseSignal },
            { selector: RegistriesSelectors.getDraftRegistration, value: draftRegistrationSignal },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistriesLicenseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormGroup({ id: new FormControl('') }));
    fixture.componentRef.setInput('draftId', 'draft-1');
    mockActions = {
      fetchLicenses: jest.fn().mockReturnValue({}),
      saveLicense: jest.fn().mockReturnValue({}),
    };
    Object.defineProperty(component, 'actions', { value: mockActions });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch licenses on init when draft present', () => {
    expect(mockActions.fetchLicenses).toHaveBeenCalledWith('osf');
  });

  it('should fetch licenses only once even if draft re-emits', () => {
    mockActions.fetchLicenses.mockClear();
    draftRegistrationSignal.set({ providerId: 'other' });
    fixture.detectChanges();
    expect(mockActions.fetchLicenses).not.toHaveBeenCalled();
  });

  it('should sync selected license to control when license exists in list', () => {
    licensesSignal.set([{ id: 'lic-1', name: 'MIT', requiredFields: [], url: '', text: '' }]);
    selectedLicenseSignal.set({ id: 'lic-1' });
    fixture.detectChanges();
    expect(component.control().get('id')?.value).toBe('lic-1');
  });

  it('should apply default license when no selected license', () => {
    draftRegistrationSignal.set({ providerId: 'osf', defaultLicenseId: 'default-1' });
    licensesSignal.set([{ id: 'default-1', name: 'Default', requiredFields: [], url: '', text: '' }]);
    fixture.detectChanges();
    expect(component.control().get('id')?.value).toBe('default-1');
    expect(mockActions.saveLicense).toHaveBeenCalledWith('draft-1', 'default-1');
  });

  it('should apply default license but not save when it has required fields', () => {
    mockActions.saveLicense.mockClear();
    draftRegistrationSignal.set({ providerId: 'osf', defaultLicenseId: 'default-2' });
    licensesSignal.set([{ id: 'default-2', name: 'CC-BY', requiredFields: ['year'], url: '', text: '' }]);
    fixture.detectChanges();
    expect(component.control().get('id')?.value).toBe('default-2');
    expect(mockActions.saveLicense).not.toHaveBeenCalled();
  });

  it('should prefer selected license over default license', () => {
    draftRegistrationSignal.set({ providerId: 'osf', defaultLicenseId: 'default-1' });
    licensesSignal.set([
      { id: 'default-1', name: 'Default', requiredFields: [], url: '', text: '' },
      { id: 'lic-1', name: 'MIT', requiredFields: [], url: '', text: '' },
    ]);
    selectedLicenseSignal.set({ id: 'lic-1' });
    fixture.detectChanges();
    expect(component.control().get('id')?.value).toBe('lic-1');
  });

  it('should set control id and save license when selecting simple license', () => {
    component.selectLicense({ id: 'lic-1', requiredFields: [] } as any);
    expect(component.control().get('id')?.value).toBe('lic-1');
    expect(mockActions.saveLicense).toHaveBeenCalledWith('draft-1', 'lic-1');
  });

  it('should not save when license has required fields', () => {
    mockActions.saveLicense.mockClear();
    component.selectLicense({ id: 'lic-2', requiredFields: ['year'] } as any);
    expect(mockActions.saveLicense).not.toHaveBeenCalled();
  });

  it('should create license with options', () => {
    component.createLicense({ id: 'lic-3', licenseOptions: { year: '2024', copyrightHolders: 'Me' } as any });
    expect(mockActions.saveLicense).toHaveBeenCalledWith('draft-1', 'lic-3', { year: '2024', copyrightHolders: 'Me' });
  });

  it('should mark control on focus out', () => {
    const control = new FormGroup({ id: new FormControl('') });
    fixture.componentRef.setInput('control', control);
    const spy = jest.spyOn(control, 'updateValueAndValidity');
    component.onFocusOut();
    expect(control.touched).toBe(true);
    expect(control.dirty).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
