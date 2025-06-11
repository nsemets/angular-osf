import { TranslatePipe } from '@ngx-translate/core';

import { Select } from 'primeng/select';

import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectOption } from '@osf/shared/models';

@Component({
  selector: 'osf-select',
  imports: [FormsModule, Select, TranslatePipe],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  options = input.required<SelectOption[]>();
  selectedValue = model.required<number>();
  placeholder = input<string>('');
  appendTo = input<string | null>(null);
}
