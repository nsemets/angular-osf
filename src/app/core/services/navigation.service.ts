import { MenuItem } from 'primeng/api';

import { Injectable } from '@angular/core';

import { MENU_ITEMS } from '../constants';
import { filterMenuItemsByAuth } from '../helpers';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  navigateToSignIn(): void {
    const loginUrl = `${environment.casUrl}/login?service=${environment.webUrl}/login`;
    window.location.href = loginUrl;
  }

  getFilteredMenuItems(isAuthenticated: boolean): MenuItem[] {
    return filterMenuItemsByAuth(MENU_ITEMS, isAuthenticated);
  }
}
