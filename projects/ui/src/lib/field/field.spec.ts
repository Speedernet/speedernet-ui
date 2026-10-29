import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnControl } from './control';
import { SnField } from './field';

const ERROR = "Cette date n'existe pas. Format attendu : jj/mm/aaaa.";

@Component({
  imports: [SnField, SnControl],
  template: `
    <sn-field id="first" label="Date" [hint]="hint()" [error]="error()">
      <input snControl />
    </sn-field>
    <sn-field id="second" label="Nom"><input snControl /></sn-field>
  `,
})
class Host {
  readonly hint = signal<string | null>(null);
  readonly error = signal<string | null>(null);
}

@Component({ imports: [SnControl], template: `<input snControl />` })
class Orphan {}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const input = () => root.querySelector<HTMLInputElement>('#first input')!;
  return { fixture, root, input };
}

function referencedIds(input: HTMLElement): string[] {
  return (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
}

describe('SnField', () => {
  it('links the label to the control', () => {
    const { root, input } = setup();
    const label = root.querySelector<HTMLLabelElement>('#first label')!;
    expect(label.textContent!.trim()).toBe('Date');
    expect(input().id).toBeTruthy();
    expect(label.htmlFor).toBe(input().id);
  });

  it('has no aria-invalid nor aria-describedby without hint or error', () => {
    const { input } = setup();
    expect(input().hasAttribute('aria-invalid')).toBe(false);
    expect(input().hasAttribute('aria-describedby')).toBe(false);
  });

  it('describes the control by the hint when there is one', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.hint.set('Exemple : 31/12/2026');
    fixture.detectChanges();
    const hint = root.querySelector('#first .sn-field-hint')!;
    expect(hint.textContent!.trim()).toBe('Exemple : 31/12/2026');
    expect(referencedIds(input())).toEqual([hint.id]);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('flags the control and shows the error with a decorative icon', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    const message = root.querySelector('#first .sn-field-error')!;
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(referencedIds(input())).toContain(message.id);
    expect(message.textContent!.trim()).toBe(ERROR);
    expect(message.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('lists hint and error together', () => {
    const { fixture, input } = setup();
    fixture.componentInstance.hint.set('Aide');
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    expect(referencedIds(input())).toHaveLength(2);
  });

  it('removes aria-invalid and the reference when the error goes away', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    fixture.componentInstance.error.set(null);
    fixture.detectChanges();
    expect(input().hasAttribute('aria-invalid')).toBe(false);
    expect(input().hasAttribute('aria-describedby')).toBe(false);
    expect(root.querySelector('#first .sn-field-error')).toBeNull();
    for (const id of referencedIds(input())) {
      expect(root.querySelector(`[id="${id}"]`)).not.toBeNull();
    }
  });

  it('gives each field its own ids', () => {
    const { root } = setup();
    const ids = [...root.querySelectorAll('input')].map((i) => i.id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('SnControl', () => {
  it('throws a clear error outside an sn-field', () => {
    expect(() => TestBed.createComponent(Orphan)).toThrowError(/sn-field/);
  });
});
