import {
  EnvironmentProviders,
  inject,
  provideEnvironmentInitializer,
  Provider,
} from '@angular/core';
import { AppConfigService } from './app-config.service';

export const provideAppConfig = (): Array<Provider | EnvironmentProviders> => {
  return [provideEnvironmentInitializer(() => inject(AppConfigService).load())];
};
