import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewSupplementsComponent } from './overview-supplements.component';

describe('OverviewSupplementsComponent', () => {
  let component: OverviewSupplementsComponent;
  let fixture: ComponentFixture<OverviewSupplementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewSupplementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewSupplementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
