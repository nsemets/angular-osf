import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceDoiComponent } from './resource-doi.component';

describe('ResourceDoiComponent', () => {
  let component: ResourceDoiComponent;
  let fixture: ComponentFixture<ResourceDoiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceDoiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
