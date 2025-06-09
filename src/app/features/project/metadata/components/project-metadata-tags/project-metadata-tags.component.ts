import { TranslatePipe } from '@ngx-translate/core';

import { AutoComplete } from 'primeng/autocomplete';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProjectOverview } from '@osf/features/project/overview/models';

@Component({
  selector: 'osf-project-metadata-tags',
  imports: [AutoComplete, Button, Card, Tag, TranslatePipe, FormsModule],
  templateUrl: './project-metadata-tags.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMetadataTagsComponent {
  tagsChanged = output<string[]>();

  currentProject = input.required<ProjectOverview | null>();

  isEditing = signal(false);
  editingTags = signal<string[]>([]);
  suggestedTags = signal<string[]>([]);
  searchValue = signal<string>('');

  allAvailableTags = [
    'research',
    'data',
    'analysis',
    'methodology',
    'experiment',
    'statistics',
    'psychology',
    'neuroscience',
    'cognitive',
    'behavioral',
    'social',
    'clinical',
    'developmental',
    'education',
    'technology',
  ];

  startEditing() {
    this.isEditing.set(true);
    this.editingTags.set([...(this.currentProject()?.tags || [])]);
  }

  cancelEditing() {
    this.isEditing.set(false);
    this.editingTags.set([]);
    this.searchValue.set('');
  }

  saveChanges() {
    this.tagsChanged.emit(this.editingTags());
    this.isEditing.set(false);
    this.searchValue.set('');
  }

  searchTags(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.suggestedTags.set(
      this.allAvailableTags.filter((tag) => tag.toLowerCase().includes(query) && !this.editingTags().includes(tag))
    );
  }

  onTagSelect(event: { value: string }) {
    const tagValue = event.value;
    if (tagValue && !this.editingTags().includes(tagValue)) {
      this.editingTags.set([...this.editingTags(), tagValue]);
    }
    this.searchValue.set('');
  }

  removeTag(tag: string) {
    this.editingTags.set(this.editingTags().filter((t) => t !== tag));
  }

  handleKeyboardEdit(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.startEditing();
    }
  }
}
