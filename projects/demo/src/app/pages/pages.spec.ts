import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';

describe('demo pages', () => {
  const words: Record<string, string> = {
    '/foundations': 'foundations',
    '/components': 'components',
    '/sample-screen': 'bookings',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  for (const path of ['/foundations', '/components', '/sample-screen']) {
    it(`loads ${path} with a single h1 containing a highlight`, async () => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(path);
      const root = harness.routeNativeElement as HTMLElement;
      const h1s = root.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].querySelector('.speed-highlight')).not.toBeNull();
      expect(h1s[0].textContent?.toLowerCase()).toContain(words[path]);
      // 30 s: the first lazy compile of a page in jsdom can exceed the default 5 s.
    }, 30000);
  }
});
