import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialFormComponent } from './social-form.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe.skip('SocialFormComponent', () => {
  let component: SocialFormComponent;
  let fixture: ComponentFixture<SocialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialFormComponent],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(SocialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
