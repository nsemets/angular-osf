import { Observable, Subject } from 'rxjs';

import { Router, UrlTree } from '@angular/router';

import { type Mock, vi } from 'vitest';

export type RouterMockType = Partial<Router> & {
  events: Observable<any>;
  navigate: Mock<(...args: any[]) => Promise<boolean>>;
  navigateByUrl: Mock<(...args: any[]) => Promise<boolean>>;
  createUrlTree: Mock<(...args: any[]) => UrlTree>;
};

export class RouterMockBuilder {
  private currentUrl = '/';
  private events$ = new Subject<any>();

  private navigateMock: Mock<(...args: any[]) => Promise<boolean>> = vi.fn().mockResolvedValue(true);
  private navigateByUrlMock: Mock<(...args: any[]) => Promise<boolean>> = vi.fn().mockResolvedValue(true);
  private createUrlTreeMock: Mock<(...args: any[]) => UrlTree> = vi.fn(() => ({}) as UrlTree);

  static create(): RouterMockBuilder {
    return new RouterMockBuilder();
  }

  withUrl(url: string): RouterMockBuilder {
    this.currentUrl = url;
    return this;
  }

  withNavigate(mockImpl: Mock<(...args: any[]) => Promise<boolean>>): RouterMockBuilder {
    this.navigateMock = mockImpl;
    return this;
  }

  withNavigateByUrl(mockImpl: Mock<(...args: any[]) => Promise<boolean>>): RouterMockBuilder {
    this.navigateByUrlMock = mockImpl;
    return this;
  }

  withCreateUrlTree(mockImpl: Mock<(...args: any[]) => UrlTree>): RouterMockBuilder {
    this.createUrlTreeMock = mockImpl;
    return this;
  }

  emit(event: any): RouterMockBuilder {
    this.events$.next(event);
    return this;
  }

  build(): RouterMockType {
    return {
      url: this.currentUrl,
      events: this.events$.asObservable(),
      navigate: this.navigateMock,
      navigateByUrl: this.navigateByUrlMock,
      createUrlTree: this.createUrlTreeMock,
    } as RouterMockType;
  }
}

export const RouterMock = {
  withUrl(url: string) {
    return RouterMockBuilder.create().withUrl(url);
  },
  create() {
    return RouterMockBuilder.create();
  },
};

export function provideRouterMock(mock?: RouterMockType) {
  return {
    provide: Router,
    useFactory: () => mock ?? RouterMockBuilder.create().build(),
  };
}
