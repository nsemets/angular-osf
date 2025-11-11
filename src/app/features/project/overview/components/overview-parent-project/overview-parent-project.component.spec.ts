import { MockComponents } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCardComponent } from '../component-card/component-card.component';

import { OverviewParentProjectComponent } from './overview-parent-project.component';

describe.skip('OverviewParentProjectComponent', () => {
  let component: OverviewParentProjectComponent;
  let fixture: ComponentFixture<OverviewParentProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewParentProjectComponent, ...MockComponents(ComponentCardComponent)],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewParentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
