import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAccountConnectionModalComponent } from './confirm-account-connection-modal.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe.skip('ConfirmAccountConnectionModalComponent', () => {
  let component: ConfirmAccountConnectionModalComponent;
  let fixture: ComponentFixture<ConfirmAccountConnectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmAccountConnectionModalComponent],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmAccountConnectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
