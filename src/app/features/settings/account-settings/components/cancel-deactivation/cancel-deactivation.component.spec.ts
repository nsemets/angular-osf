import { provideStore } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsState } from '../../store';

import { CancelDeactivationComponent } from './cancel-deactivation.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('CancelDeactivationComponent', () => {
  let component: CancelDeactivationComponent;
  let fixture: ComponentFixture<CancelDeactivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelDeactivationComponent],
      providers: [
        provideOSFCore(),
        provideStore([AccountSettingsState]),
        provideHttpClient(),
        provideHttpClientTesting(),
        MockProvider(DynamicDialogRef),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelDeactivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with true when cancelDeactivation is called', () => {
    const dialogRef = TestBed.inject(DynamicDialogRef);
    jest.spyOn(dialogRef, 'close');
    component.cancelDeactivation();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
