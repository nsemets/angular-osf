import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperAppsComponent } from './developer-apps.component';

describe('DeveloperAppsComponent', () => {
  let component: DeveloperAppsComponent;
  let fixture: ComponentFixture<DeveloperAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperAppsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeveloperAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
