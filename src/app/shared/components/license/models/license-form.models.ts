import { FormControl } from '@angular/forms';

export interface LicenseForm {
  copyrightHolder: FormControl<string>;
  year: FormControl<string>;
}
