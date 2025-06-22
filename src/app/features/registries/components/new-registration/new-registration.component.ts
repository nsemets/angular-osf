import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { SubHeaderComponent } from '@osf/shared/components';

import { Project } from '../../models';
import { GetProjects, GetProviders, RegistriesSelectors } from '../../store';

@Component({
  selector: 'osf-new-registration',
  imports: [SubHeaderComponent, TranslatePipe, Card, Button, Select],
  templateUrl: './new-registration.component.html',
  styleUrl: './new-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewRegistrationComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly projects = select(RegistriesSelectors.getProjects);
  protected readonly providers = select(RegistriesSelectors.getProviders);
  protected actions = createDispatchMap({
    getProjects: GetProjects,
    getProviders: GetProviders,
  });
  isProjectRegistration = true;
  draftForm = this.fb.group({
    provider: [''],
  });

  constructor() {
    this.actions.getProjects();
    this.actions.getProviders();
  }

  onSelectProject(project: Project) {
    console.log('Project selected', project);
  }
}
