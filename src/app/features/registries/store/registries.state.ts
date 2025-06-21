import { State } from '@ngxs/store';

import { Injectable } from '@angular/core';

import { ProvidersService } from '../services';

import { RegistriesStateModel } from './registries.model';

const DefaultState: RegistriesStateModel = {
  providers: {
    data: [],
    isLoading: false,
    error: null,
  },
  currentProviderId: null,
};

@State<RegistriesStateModel>({
  name: 'registries',
  defaults: { ...DefaultState },
})
@Injectable()
export class RegistriesState {
  constructor(private providersService: ProvidersService) {}
}
