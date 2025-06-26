import { select } from '@ngxs/store';

import { Card } from 'primeng/card';
import { RadioButton } from 'primeng/radiobutton';
import { Textarea } from 'primeng/textarea';

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { RegistriesSelectors } from '../../store';

import { FieldType } from './../../enums/field-type.enum';

@Component({
  selector: 'osf-custom-step',
  imports: [Card, Textarea, RadioButton, FormsModule],
  templateUrl: './custom-step.component.html',
  styleUrl: './custom-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomStepComponent {
  private readonly route = inject(ActivatedRoute);
  step = signal(this.route.snapshot.params['step'].split('-')[0]);
  protected readonly pages = select(RegistriesSelectors.getPagesSchema);
  currentPage = computed(() => this.pages()[this.step() - 1]);
  protected readonly FieldType = FieldType;

  radio = null;

  constructor() {
    console.log('CustomStepComponent initialized with step:', this.step);
    console.log('Current page:', this.currentPage);
    this.route.params.subscribe((params) => {
      this.step.set(+params['step'].split('-')[0]);
    });
  }
}
