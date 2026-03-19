import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsStorageLocationCardComponent } from './settings-storage-location-card.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('SettingsStorageLocationCardComponent', () => {
  let component: SettingsStorageLocationCardComponent;
  let fixture: ComponentFixture<SettingsStorageLocationCardComponent>;

  const mockLocation = 'Location Test';
  const mockLocationText = 'Location Text Test';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsStorageLocationCardComponent],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsStorageLocationCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('location', mockLocation);
    fixture.componentRef.setInput('locationText', mockLocationText);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with location and locationText inputs', () => {
    fixture.componentRef.setInput('location', mockLocation);
    fixture.componentRef.setInput('locationText', mockLocationText);
    fixture.detectChanges();

    expect(component.location()).toBe(mockLocation);
    expect(component.locationText()).toBe(mockLocationText);
  });
});
