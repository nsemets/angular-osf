import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceLicenseComponent } from './resource-license.component';

describe('ResourceLicenseComponent', () => {
  let component: ResourceLicenseComponent;
  let fixture: ComponentFixture<ResourceLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceLicenseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
