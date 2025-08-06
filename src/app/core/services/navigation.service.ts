import { MenuItem } from 'primeng/api';

import { inject, Injectable } from '@angular/core';

import { AuthService } from '@osf/features/auth/services';

import { MENU_ITEMS } from '../constants';
import { filterMenuItemsByAuth } from '../helpers';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly authService = inject(AuthService);

  navigateToSignIn(): void {
    const loginUrl = `${environment.casUrl}/login?service=${environment.webUrl}/login`;
    window.location.href = loginUrl;
  }

  getFilteredMenuItems(): MenuItem[] {
    const isAuthenticated = this.authService.isAuthenticated();
    return filterMenuItemsByAuth(MENU_ITEMS, isAuthenticated);
  }
}
