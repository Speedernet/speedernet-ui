import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpeedControl } from './control';
import { SpeedField } from './field';

const ERROR = 'This date does not exist. Expected format: dd/mm/yyyy.';

@Component({
  imports: [SpeedField, SpeedControl],
  template: `
    <speed-field id="first" label="Date" [hint]="hint()" [error]="error()">
      <input speedControl />
    </speed-field>
    <speed-field id="second" label="Name"><input speedControl /></speed-field>
  `,
})
class Host {
  readonly hint = signal<string | null>(null);
  readonly error = signal<string | null>(null);
}

@Component({
  imports: [SpeedField, SpeedControl],
  template: `<speed-field label="Status"
    ><select speedControl>
      <option>A</option>
    </select></speed-field
  >`,
})
class SelectHost {}

@Component({ imports: [SpeedControl], template: `<input speedControl />` })
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

describe('SpeedField', () => {
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
    fixture.componentInstance.hint.set('Example: 31/12/2026');
    fixture.detectChanges();
    const hint = root.querySelector('#first .speed-field-hint')!;
    expect(hint.textContent!.trim()).toBe('Example: 31/12/2026');
    expect(referencedIds(input())).toEqual([hint.id]);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('flags the control and shows the error with a decorative icon', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    const message = root.querySelector('#first .speed-field-error')!;
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(referencedIds(input())).toContain(message.id);
    expect(message.textContent!.trim()).toBe(ERROR);
    expect(message.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('lists hint and error together', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.hint.set('Help');
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    const hintId = root.querySelector('#first .speed-field-hint')!.id;
    const errorId = root.querySelector('#first .speed-field-error')!.id;
    expect(referencedIds(input())).toEqual([hintId, errorId]);
  });

  it('removes aria-invalid and the reference when the error goes away', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.hint.set('Help');
    fixture.componentInstance.error.set(ERROR);
    fixture.detectChanges();
    const hintId = root.querySelector('#first .speed-field-hint')!.id;
    fixture.componentInstance.error.set(null);
    fixture.detectChanges();
    expect(input().hasAttribute('aria-invalid')).toBe(false);
    expect(referencedIds(input())).toEqual([hintId]);
    expect(root.querySelector('#first .speed-field-error')).toBeNull();
    for (const id of referencedIds(input())) {
      expect(root.querySelector(`[id="${id}"]`)).not.toBeNull();
    }
  });

  it('links the label to a select control', () => {
    const fixture = TestBed.createComponent(SelectHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const select = root.querySelector<HTMLSelectElement>('select')!;
    const label = root.querySelector<HTMLLabelElement>('label')!;
    expect(select.id).toBeTruthy();
    expect(label.htmlFor).toBe(select.id);
  });

  it('gives each field its own ids', () => {
    const { root } = setup();
    const ids = [...root.querySelectorAll('input')].map((i) => i.id);
    expect(ids[0]).not.toBe(ids[1]);
  });
});

describe('SpeedControl', () => {
  it('throws a clear error outside a speed-field', () => {
    expect(() => TestBed.createComponent(Orphan)).toThrowError(/speed-field/);
  });
});
