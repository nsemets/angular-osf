import { TranslateService } from '@ngx-translate/core';

import { of } from 'rxjs';

export const TranslateServiceMock = {
  provide: TranslateService,
  useValue: {
    onTranslationChange: of({ lang: 'en', translations: {} }),
    onLangChange: of({ lang: 'en', translations: {} }),
    onFallbackLangChange: of({ lang: 'en', translations: {} }),
    onDefaultLangChange: of({ lang: 'en', translations: {} }),

    get: jest.fn().mockImplementation((key: string | string[]) => of(key)),
    instant: jest.fn().mockImplementation((key: string | string[]) => key),
    stream: jest.fn().mockImplementation((key: string | string[]) => of(key)),
    getStreamOnTranslationChange: jest.fn().mockImplementation((key: string | string[]) => of(key)),

    use: jest.fn().mockReturnValue(of({})),
    setFallbackLang: jest.fn().mockReturnValue(of({})),
    setDefaultLang: jest.fn().mockReturnValue(of({})),
    reloadLang: jest.fn().mockReturnValue(of({})),
    getParsedResult: jest.fn().mockImplementation((key) => key),

    getLangs: jest.fn().mockReturnValue(['en']),
    getCurrentLang: jest.fn().mockReturnValue('en'),
    getFallbackLang: jest.fn().mockReturnValue('en'),
    getDefaultLang: jest.fn().mockReturnValue('en'),
    getBrowserLang: jest.fn().mockReturnValue('en'),
    getBrowserCultureLang: jest.fn().mockReturnValue('en-US'),

    currentLang: 'en',
    defaultLang: 'en',
    langs: ['en'],

    addLangs: jest.fn(),
    resetLang: jest.fn(),
    set: jest.fn(),
    setTranslation: jest.fn(),
  },
};
