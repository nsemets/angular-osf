import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistriesSelectors } from '@osf/features/registries/store';

import { RegistriesTagsComponent } from './registries-tags.component';

import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('RegistriesTagsComponent', () => {
  let component: RegistriesTagsComponent;
  let fixture: ComponentFixture<RegistriesTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistriesTagsComponent, OSFTestingModule],
      providers: [
        provideMockStore({
          signals: [{ selector: RegistriesSelectors.getSelectedTags, value: [] }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistriesTagsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('draftId', 'someId');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with label', () => {
    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement.textContent).toEqual('project.overview.metadata.tags (common.labels.optional)');
  });

  it('should update tags on change', () => {
    const mockActions = { updateDraft: jest.fn().mockReturnValue(of({})) };
    Object.defineProperty(component, 'actions', { value: mockActions });
    component.onTagsChanged(['a', 'b']);
    expect(mockActions.updateDraft).toHaveBeenCalledWith('someId', { tags: ['a', 'b'] });
  });
});
