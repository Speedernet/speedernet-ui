import { InjectionToken } from '@angular/core';

/** Base URL under which the application serves the library static files (fonts, logos). */
export const SN_ASSETS_BASE = new InjectionToken<string>('SN_ASSETS_BASE', {
  providedIn: 'root',
  factory: () => '/speedernet-ui',
});
