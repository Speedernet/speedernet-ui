import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders the header with the demo name', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('sn-app-header')?.textContent).toContain('@speedernet/ui demo');
    expect(compiled.querySelector('main.sn-container')).not.toBeNull();
  });

  it('shows a simulated logout message', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance['loggedOut'].set(true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('sn-message')?.textContent,
    ).toContain('Simulated logout.');
  });
});
