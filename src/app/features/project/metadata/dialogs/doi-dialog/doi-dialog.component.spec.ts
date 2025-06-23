import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoiDialogComponent } from './doi-dialog.component';

describe('DoiDialogComponent', () => {
  let component: DoiDialogComponent;
  let fixture: ComponentFixture<DoiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoiDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DoiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
