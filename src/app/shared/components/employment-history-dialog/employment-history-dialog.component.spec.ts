import { MockComponent, MockProvider } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentHistoryComponent } from '../employment-history/employment-history.component';

import { EmploymentHistoryDialogComponent } from './employment-history-dialog.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('EmploymentHistoryDialogComponent', () => {
  let component: EmploymentHistoryDialogComponent;
  let fixture: ComponentFixture<EmploymentHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmploymentHistoryDialogComponent, MockComponent(EmploymentHistoryComponent)],
      providers: [provideOSFCore(), MockProvider(DynamicDialogRef), MockProvider(DynamicDialogConfig)],
    }).compileComponents();

    fixture = TestBed.createComponent(EmploymentHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call close method successfully', () => {
    const dialogRef = TestBed.inject(DynamicDialogRef);
    jest.spyOn(dialogRef, 'close');
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });
});
