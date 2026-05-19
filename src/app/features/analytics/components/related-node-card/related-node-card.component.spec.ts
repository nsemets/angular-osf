import { MockComponents } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ContributorsListComponent } from '@osf/shared/components/contributors-list/contributors-list.component';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { TruncatedTextComponent } from '@osf/shared/components/truncated-text/truncated-text.component';

import { MOCK_NODE_WITH_ADMIN } from '@testing/mocks/node.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { RELATED_NODE_MENU_ITEMS } from '../../constants/related-node-menu-items.const';
import { RelatedNodeMenuAction } from '../../enums/related-node-menu-action.enum';

import { RelatedNodeCardComponent } from './related-node-card.component';

describe('RelatedNodeCardComponent', () => {
  let component: RelatedNodeCardComponent;
  let fixture: ComponentFixture<RelatedNodeCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RelatedNodeCardComponent,
        ...MockComponents(IconComponent, TruncatedTextComponent, ContributorsListComponent),
      ],
      providers: [provideOSFCore(), provideRouter([])],
    });

    fixture = TestBed.createComponent(RelatedNodeCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('node', MOCK_NODE_WITH_ADMIN);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose node input', () => {
    expect(component.node()).toEqual(MOCK_NODE_WITH_ADMIN);
  });

  it('should have undefined menuItems by default', () => {
    expect(component.menuItems()).toBeUndefined();
  });

  it('should set menuItems input', () => {
    fixture.componentRef.setInput('menuItems', RELATED_NODE_MENU_ITEMS);
    fixture.detectChanges();

    expect(component.menuItems()).toEqual(RELATED_NODE_MENU_ITEMS);
  });

  it('should expose dateFormat', () => {
    expect(component.dateFormat).toBe('MMM d, y, h:mm a');
  });

  it('should emit menuAction when onMenuAction is called', () => {
    const emitSpy = vi.spyOn(component.menuAction, 'emit');

    component.onMenuAction(RelatedNodeMenuAction.Settings);

    expect(emitSpy).toHaveBeenCalledWith(RelatedNodeMenuAction.Settings);
  });

  it('should render node title', () => {
    const title = fixture.nativeElement.querySelector('h2');

    expect(title?.textContent).toContain(MOCK_NODE_WITH_ADMIN.title);
  });

  it('should not render menu when menuItems is not set', () => {
    expect(fixture.nativeElement.querySelector('p-menu')).toBeNull();
  });

  it('should render menu when menuItems has items', () => {
    fixture.componentRef.setInput('menuItems', RELATED_NODE_MENU_ITEMS);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-menu')).toBeTruthy();
  });

  it('should not render description when node has no description', () => {
    fixture.componentRef.setInput('node', { ...MOCK_NODE_WITH_ADMIN, description: '' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('osf-truncated-text')).toBeNull();
  });

  it('should render description when node has description', () => {
    fixture.componentRef.setInput('node', MOCK_NODE_WITH_ADMIN);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('osf-truncated-text')).toBeTruthy();
  });
});
