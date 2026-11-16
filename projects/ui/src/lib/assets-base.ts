import { InjectionToken } from '@angular/core';

/**
 * Base URL under which the application served the library static files.
 *
 * @deprecated The library no longer loads files at runtime: logos are inline SVGs and the font
 * is bundled by the application build from the styles. Remove the provider; this token will be
 * removed in the next major version.
 */
export const SPEED_ASSETS_BASE = new InjectionToken<string>('SPEED_ASSETS_BASE', {
  providedIn: 'root',
  factory: () => '/speedernet-ui',
});
