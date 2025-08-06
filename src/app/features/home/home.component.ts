import { select } from '@ngxs/store';

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthSelectors } from '../auth/store';

@Component({
  selector: 'osf-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly isAuthenticated = select(AuthSelectors.isAuthenticated);

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
