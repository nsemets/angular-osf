import { select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NavigationService } from '@osf/core/services';
import { UserSelectors } from '@osf/core/store/user';
import { AuthService } from '@osf/features/auth/services';
import { LoaderService } from '@osf/shared/services';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'osf-header',
  imports: [BreadcrumbComponent, Menu, Button, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  currentUser = select(UserSelectors.getCurrentUser);

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly loaderService = inject(LoaderService);
  private readonly navigationService = inject(NavigationService);

  items = [
    {
      label: 'navigation.myProfile',
      command: () => this.router.navigate(['my-profile']),
    },
    { label: 'navigation.settings', command: () => this.router.navigate(['settings']) },
    {
      label: 'navigation.logOut',
      command: () => {
        this.loaderService.show();
        this.authService.logout();
        this.router.navigate(['/']);
        this.loaderService.hide();
      },
    },
  ];

  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  navigateToSignIn() {
    this.navigationService.navigateToSignIn();
  }
}
