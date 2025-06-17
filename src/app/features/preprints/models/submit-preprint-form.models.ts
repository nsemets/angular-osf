import { FormControl } from '@angular/forms';

export interface TitleAndAbstractForm {
  title: FormControl<string>;
  abstract: FormControl<string>;
}
