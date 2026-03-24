import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { WINDOW } from './window.provider';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('Provider: WINDOW', () => {
  describe('when running in the browser', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideOSFCore(), { provide: PLATFORM_ID, useValue: 'browser' }],
      });
    });

    it('should return the real window object', () => {
      const result = TestBed.inject(WINDOW);
      expect(result).toBe(window);
    });
  });

  describe('when running on the server', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideOSFCore(), { provide: PLATFORM_ID, useValue: 'server' }],
      });
    });

    it('should return an empty object instead of window', () => {
      const result = TestBed.inject(WINDOW);
      expect(result).toEqual({});
    });
  });
});
