import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextInputComponent } from '@osf/shared/components';
import { InputLimits } from '@osf/shared/constants';

@Component({
  selector: 'osf-metadata',
  imports: [Card, TextInputComponent, ReactiveFormsModule, Button, TranslatePipe],
  templateUrl: './metadata.component.html',
  styleUrl: './metadata.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataComponent {
  private readonly fb = inject(FormBuilder);
  protected inputLimits = InputLimits;

  metadataForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
  });

  submitMetadata(): void {
    // Logic to submit metadata
    console.log('Metadata submitted');
  }

  back(): void {
    // Logic to navigate back
    console.log('Navigating back');
  }
}
