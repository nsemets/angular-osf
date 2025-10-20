import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreprintMetricsInfoComponent } from './preprint-metrics-info.component';

describe('PreprintMetricsInfoComponent', () => {
  let component: PreprintMetricsInfoComponent;
  let fixture: ComponentFixture<PreprintMetricsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreprintMetricsInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreprintMetricsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
