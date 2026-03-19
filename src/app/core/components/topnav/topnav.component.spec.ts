import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuComponent } from '../nav-menu/nav-menu.component';

import { TopnavComponent } from './topnav.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('TopnavComponent', () => {
  let component: TopnavComponent;
  let fixture: ComponentFixture<TopnavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TopnavComponent, MockComponent(NavMenuComponent)],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(TopnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with drawer hidden', () => {
    expect(component.isDrawerVisible()).toBe(false);
  });

  it('should toggle drawer visibility when toggleMenuVisibility is called', () => {
    component.toggleMenuVisibility();
    expect(component.isDrawerVisible()).toBe(true);

    component.toggleMenuVisibility();
    expect(component.isDrawerVisible()).toBe(false);
  });
});
