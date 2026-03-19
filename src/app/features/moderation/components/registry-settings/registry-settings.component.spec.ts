import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RegistrySettingsComponent } from './registry-settings.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('RegistrySettingsComponent', () => {
  let component: RegistrySettingsComponent;
  let fixture: ComponentFixture<RegistrySettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegistrySettingsComponent],
      providers: [provideOSFCore(), provideRouter([])],
    });

    fixture = TestBed.createComponent(RegistrySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
