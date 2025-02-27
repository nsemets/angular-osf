import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@osf/app.config';
import { AppComponent } from '@osf/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
