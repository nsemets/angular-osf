import { MockProvider } from 'ng-mocks';

import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivationWarningComponent } from './deactivation-warning.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('DeactivationWarningComponent', () => {
  let component: DeactivationWarningComponent;
  let fixture: ComponentFixture<DeactivationWarningComponent>;
  let dialogRef: DynamicDialogRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeactivationWarningComponent],
      providers: [provideOSFCore(), MockProvider(DynamicDialogRef)],
    }).compileComponents();

    fixture = TestBed.createComponent(DeactivationWarningComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(DynamicDialogRef);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when deactivateAccount is called', () => {
    const closeSpy = jest.spyOn(dialogRef, 'close');

    component.deactivateAccount();

    expect(closeSpy).toHaveBeenCalledWith(true);
  });
});
