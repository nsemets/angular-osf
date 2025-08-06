import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Carousel } from 'primeng/carousel';

import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { IconComponent, SearchInputComponent } from '@osf/shared/components';

import { integrationIcons, slides } from './data';

@Component({
  selector: 'osf-home-logged-out',
  imports: [Carousel, Button, SearchInputComponent, IconComponent, NgOptimizedImage, TranslatePipe, RouterLink],
  templateUrl: './home-logged-out.component.html',
  styleUrl: './home-logged-out.component.scss',
})
export class HomeLoggedOutComponent {
  private readonly router = inject(Router);

  protected searchControl = new FormControl<string>('');

  readonly icons = integrationIcons;
  readonly slides = slides;

  redirectToSearchPageWithValue() {
    const searchValue = this.searchControl.value;

    this.router.navigate(['/search'], { queryParams: { search: searchValue } });
  }
}
