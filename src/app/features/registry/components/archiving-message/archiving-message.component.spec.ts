import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivingMessageComponent } from './archiving-message.component';

describe('ArchivingMessageComponent', () => {
  let component: ArchivingMessageComponent;
  let fixture: ComponentFixture<ArchivingMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivingMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivingMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
