import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnTooltip } from './tooltip';

@Component({
  imports: [SnTooltip],
  template: `
    <sn-tooltip [text]="text()">
      <button type="button">Copy</button>
    </sn-tooltip>
  `,
})
class Host {
  readonly text = signal('Copy #0DC8D9');
}

function render(): ComponentFixture<Host> {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}

describe('SnTooltip', () => {
  it('renders its text in an element with the tooltip role', () => {
    const tip = render().nativeElement.querySelector('[role="tooltip"]')!;
    expect(tip.textContent!.trim()).toBe('Copy #0DC8D9');
  });

  it('describes the wrapped element with its text', async () => {
    const fixture = render();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const tip = root.querySelector('[role="tooltip"]')!;
    expect(tip.id).toMatch(/^sn-tooltip-\d+$/);
    expect(root.querySelector('button')!.getAttribute('aria-describedby')).toBe(tip.id);
  });

  it('follows text changes', () => {
    const fixture = render();
    fixture.componentInstance.text.set('Copied');
    fixture.detectChanges();
    const tip = fixture.nativeElement.querySelector('[role="tooltip"]')!;
    expect(tip.textContent!.trim()).toBe('Copied');
  });

  it('hides on Escape until the pointer or focus comes back', () => {
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement.querySelector('sn-tooltip');
    host
      .querySelector('button')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.classList).toContain('sn-tooltip-dismissed');

    host.dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    expect(host.classList).not.toContain('sn-tooltip-dismissed');
  });
});
