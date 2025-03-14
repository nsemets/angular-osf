import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'osf-breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent {
  #router = inject(Router);
  protected readonly url = signal(this.#router.url);
  protected readonly parsedUrl = computed(() => {
    return this.url().split('/').filter(Boolean);
  });
}
