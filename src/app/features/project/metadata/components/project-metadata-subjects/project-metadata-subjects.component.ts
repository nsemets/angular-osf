import { TranslatePipe } from '@ngx-translate/core';

import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Tag } from 'primeng/tag';

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';

import { ProjectOverview, ProjectOverviewSubject } from '@osf/features/project/overview/models';
import { SearchInputComponent } from '@shared/components';

interface SubjectOption {
  id: string;
  label: string;
  children?: SubjectOption[];
  expanded?: boolean;
  selected?: boolean;
  indeterminate?: boolean;
  level?: number;
}

@Component({
  selector: 'osf-project-metadata-subjects',
  imports: [Card, Tag, TranslatePipe, FormsModule, Checkbox, NgClass, SearchInputComponent],
  templateUrl: './project-metadata-subjects.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMetadataSubjectsComponent {
  subjectsChanged = output<ProjectOverviewSubject[]>();

  currentProject = input.required<ProjectOverview | null>();

  searchControl = new FormControl('');

  editingSubjects = signal<ProjectOverviewSubject[]>([]);
  searchValue = signal<string>('');
  showDropdown = signal(false);
  filteredOptions = signal<SubjectOption[]>([]);

  subjectOptions: SubjectOption[] = [
    {
      id: 'architecture',
      label: 'Architecture',
      expanded: false,
      selected: false,
      level: 0,
      children: [
        { id: 'architecture.engineering', label: 'Architectural Engineering', selected: false, level: 1 },
        { id: 'architecture.history', label: 'Architectural History and Criticism', selected: false, level: 1 },
        { id: 'architecture.technology', label: 'Architectural Technology', selected: false, level: 1 },
      ],
    },
    {
      id: 'arts',
      label: 'Arts and Humanities',
      expanded: false,
      selected: false,
      level: 0,
      children: [
        { id: 'arts.history', label: 'Art History', selected: false, level: 1 },
        { id: 'arts.fine', label: 'Fine Arts', selected: false, level: 1 },
        { id: 'arts.music', label: 'Music', selected: false, level: 1 },
        { id: 'arts.theater', label: 'Theater', selected: false, level: 1 },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      expanded: false,
      selected: false,
      level: 0,
      children: [
        { id: 'business.accounting', label: 'Accounting', selected: false, level: 1 },
        { id: 'business.finance', label: 'Finance', selected: false, level: 1 },
        { id: 'business.management', label: 'Management', selected: false, level: 1 },
        { id: 'business.marketing', label: 'Marketing', selected: false, level: 1 },
      ],
    },
    {
      id: 'education',
      label: 'Education',
      expanded: false,
      selected: false,
      level: 0,
      children: [
        { id: 'education.curriculum', label: 'Curriculum and Instruction', selected: false, level: 1 },
        { id: 'education.psychology', label: 'Educational Psychology', selected: false, level: 1 },
        { id: 'education.higher', label: 'Higher Education', selected: false, level: 1 },
        { id: 'education.special', label: 'Special Education', selected: false, level: 1 },
      ],
    },
    {
      id: 'engineering',
      label: 'Engineering',
      expanded: false,
      selected: false,
      level: 0,
      children: [
        { id: 'engineering.computer', label: 'Computer Engineering', selected: false, level: 1 },
        { id: 'engineering.mechanical', label: 'Mechanical Engineering', selected: false, level: 1 },
        { id: 'engineering.electrical', label: 'Electrical Engineering', selected: false, level: 1 },
        { id: 'engineering.civil', label: 'Civil Engineering', selected: false, level: 1 },
      ],
    },
  ];

  startEditing() {
    const project = this.currentProject();
    this.editingSubjects.set(project ? [...(project.subjects || [])] : []);
    this.updateSelectionState();
    this.filterOptions();
  }

  cancelEditing() {
    this.editingSubjects.set([]);
    this.searchValue.set('');
    this.showDropdown.set(false);
    this.resetSelectionState();
  }

  saveChanges() {
    this.subjectsChanged.emit(this.editingSubjects());
    this.searchValue.set('');
    this.showDropdown.set(false);
    this.resetSelectionState();
  }

  onInputFocus() {
    this.showDropdown.set(true);
    this.filterOptions();
  }

  onInputChange(value: string) {
    this.searchValue.set(value);
    this.filterOptions();
  }

  onSearchChange(value: string) {
    this.searchValue.set(value);
    this.filterOptions();
  }

  filterOptions() {
    const search = this.searchValue().toLowerCase();
    const filtered = this.filterOptionsRecursive(this.subjectOptions, search);
    this.filteredOptions.set(filtered);
  }

  private filterOptionsRecursive(options: SubjectOption[], search: string): SubjectOption[] {
    const filtered: SubjectOption[] = [];

    for (const option of options) {
      const matchesSearch = !search || option.label.toLowerCase().includes(search);
      const filteredChildren = option.children ? this.filterOptionsRecursive(option.children, search) : [];

      if (matchesSearch || filteredChildren.length > 0) {
        const originalOption = this.findOptionById(this.subjectOptions, option.id);

        filtered.push({
          ...option,
          selected: originalOption ? originalOption.selected || false : false,
          indeterminate: originalOption ? originalOption.indeterminate || false : false,
          expanded: search ? true : originalOption ? originalOption.expanded || false : false,
          children: filteredChildren.length > 0 ? filteredChildren : option.children,
        });
      }
    }

    return filtered;
  }

  toggleExpand(option: SubjectOption, event: Event) {
    event.stopPropagation();
    // Update the original option in subjectOptions array
    const originalOption = this.findOptionById(this.subjectOptions, option.id);
    if (originalOption) {
      originalOption.expanded = !originalOption.expanded;
    }
    this.filterOptions();
  }

  private findOptionById(options: SubjectOption[], id: string): SubjectOption | null {
    for (const option of options) {
      if (option.id === id) {
        return option;
      }
      if (option.children) {
        const found = this.findOptionById(option.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  toggleSelection(option: SubjectOption) {
    const originalOption = this.findOptionById(this.subjectOptions, option.id);
    if (!originalOption) return;

    originalOption.selected = !originalOption.selected;

    if (originalOption.selected) {
      const newSubject: ProjectOverviewSubject = {
        id: originalOption.id,
        text: originalOption.label,
      };
      this.editingSubjects.set([...this.editingSubjects(), newSubject]);
    } else {
      this.editingSubjects.set(this.editingSubjects().filter((s) => s.id !== originalOption.id));
    }

    this.updateParentSelectionState();
    this.filterOptions();
  }

  removeSubject(subject: ProjectOverviewSubject) {
    this.editingSubjects.set(this.editingSubjects().filter((s) => s.id !== subject.id));
    this.updateSelectionState();
  }

  private updateSelectionState() {
    const selectedIds = this.editingSubjects().map((s) => s.id);
    this.updateOptionsSelection(this.subjectOptions, selectedIds);
    this.updateParentSelectionState();
  }

  private updateOptionsSelection(options: SubjectOption[], selectedIds: string[]) {
    options.forEach((option) => {
      option.selected = selectedIds.includes(option.id);
      if (option.children) {
        this.updateOptionsSelection(option.children, selectedIds);
      }
    });
  }

  private updateParentSelectionState() {
    this.subjectOptions.forEach((parent) => {
      if (parent.children) {
        const selectedChildren = parent.children.filter((child) => child.selected).length;
        const totalChildren = parent.children.length;

        if (selectedChildren === 0) {
          parent.selected = false;
          parent.indeterminate = false;
        } else if (selectedChildren === totalChildren) {
          parent.selected = true;
          parent.indeterminate = false;
        } else {
          parent.selected = false;
          parent.indeterminate = true;
        }
      }
    });
  }

  private resetSelectionState() {
    this.updateOptionsSelection(this.subjectOptions, []);
    this.updateParentSelectionState();
  }

  handleKeyboardEdit(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.startEditing();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.subjects-dropdown');
    const input = document.querySelector('.subjects-input');

    if (dropdown && input && !dropdown.contains(target) && !input.contains(target)) {
      this.showDropdown.set(false);
    }
  }

  getUniqueSubjects(): ProjectOverviewSubject[] {
    const seen = new Set<string>();
    return this.editingSubjects().filter((subject) => {
      if (seen.has(subject.id)) {
        return false;
      }
      seen.add(subject.id);
      return true;
    });
  }
}
