import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpamTombstoneComponent } from './spam-tombstone.component';

describe('SpamTombstoneComponent', () => {
  let component: SpamTombstoneComponent;
  let fixture: ComponentFixture<SpamTombstoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpamTombstoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpamTombstoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
