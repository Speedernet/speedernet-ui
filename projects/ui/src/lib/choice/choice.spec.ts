import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SnControl } from '../field/control';
import { SnCheckbox } from './checkbox';
import { SnRadio } from './radio';
import { SnRadioGroup } from './radio-group';
import { SnSwitch } from './switch';

const ERROR = 'Accept the rules to book.';

@Component({
  imports: [SnCheckbox, SnSwitch, SnRadio, SnRadioGroup, SnControl, ReactiveFormsModule],
  template: `
    <sn-checkbox id="rules" label="I accept the rules" [hint]="hint()" [error]="error()">
      <input type="checkbox" snControl [formControl]="rules" />
    </sn-checkbox>
    <sn-switch id="mail" label="Receive a confirmation by email">
      <input type="checkbox" role="switch" snControl [formControl]="mail" />
    </sn-switch>
    <sn-radio-group legend="Duration" hint="One hour at most." [error]="groupError()">
      <sn-radio id="half" label="30 minutes">
        <input type="radio" name="duration" value="30" snControl [formControl]="duration" />
      </sn-radio>
      <sn-radio id="hour" label="1 hour" hint="For team meetings.">
        <input type="radio" name="duration" value="60" snControl [formControl]="duration" />
      </sn-radio>
    </sn-radio-group>
  `,
})
class Host {
  readonly hint = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly groupError = signal<string | null>(null);
  readonly rules = new FormControl(false);
  readonly mail = new FormControl(true);
  readonly duration = new FormControl('30');
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const input = (host: string) => root.querySelector<HTMLInputElement>(`${host} input`)!;
  const ids = (element: Element) =>
    (element.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
  return { fixture, root, input, ids, host: fixture.componentInstance };
}

describe('SnCheckbox', () => {
  it('puts the label after the box and links it, so clicking it toggles the box', () => {
    const { fixture, root, input, host } = setup();
    const label = root.querySelector<HTMLLabelElement>('#rules label')!;
    expect(label.textContent!.trim()).toBe('I accept the rules');
    expect(label.htmlFor).toBe(input('#rules').id);
    expect(input('#rules').compareDocumentPosition(label)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    label.click();
    fixture.detectChanges();
    expect(host.rules.value).toBe(true);
  });

  it('describes the box by its hint, then flags it with the error', () => {
    const { fixture, root, input, ids, host } = setup();
    expect(input('#rules').hasAttribute('aria-describedby')).toBe(false);
    host.hint.set('Available at the front desk.');
    host.error.set(ERROR);
    fixture.detectChanges();
    const hint = root.querySelector('#rules .sn-field-hint')!;
    const error = root.querySelector('#rules .sn-field-error')!;
    expect(ids(input('#rules'))).toEqual([hint.id, error.id]);
    expect(input('#rules').getAttribute('aria-invalid')).toBe('true');
    expect(error.textContent!.trim()).toBe(ERROR);
    expect(error.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('follows the disabled state of its form control', () => {
    const { fixture, input, host } = setup();
    host.rules.disable();
    fixture.detectChanges();
    expect(input('#rules').disabled).toBe(true);
  });
});

describe('SnSwitch', () => {
  it('keeps a native checkbox with the switch role, labelled and focusable', () => {
    const { root, input } = setup();
    const control = input('#mail');
    expect(control.type).toBe('checkbox');
    expect(control.getAttribute('role')).toBe('switch');
    expect(root.querySelector<HTMLLabelElement>('#mail label')!.htmlFor).toBe(control.id);
    document.body.appendChild(root);
    control.focus();
    expect(document.activeElement).toBe(control);
    root.remove();
  });

  it('hides the drawn track from assistive technologies', () => {
    const { root } = setup();
    expect(root.querySelector('#mail .sn-switch-track')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('toggles from its label and reports its state through the form control', () => {
    const { fixture, root, input, host } = setup();
    expect(input('#mail').checked).toBe(true);
    root.querySelector<HTMLLabelElement>('#mail label')!.click();
    fixture.detectChanges();
    expect(host.mail.value).toBe(false);
  });
});

describe('SnRadioGroup and SnRadio', () => {
  it('names the group with a fieldset legend and describes it with its hint', () => {
    const { root } = setup();
    const fieldset = root.querySelector('fieldset')!;
    expect(fieldset.querySelector('legend')!.textContent!.trim()).toBe('Duration');
    const hint = fieldset.querySelector(':scope > .sn-field-hint')!;
    expect(fieldset.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('labels each radio button and describes it by its own hint', () => {
    const { root, input, ids } = setup();
    expect(root.querySelector<HTMLLabelElement>('#hour label')!.htmlFor).toBe(input('#hour').id);
    expect(ids(input('#hour'))).toEqual([root.querySelector('#hour .sn-field-hint')!.id]);
    expect(input('#half').hasAttribute('aria-describedby')).toBe(false);
  });

  it('flags every radio button with the group error', () => {
    const { fixture, root, input, ids, host } = setup();
    host.groupError.set('Choose a duration.');
    fixture.detectChanges();
    const error = root.querySelector('fieldset > .sn-field-error')!;
    for (const id of ['#half', '#hour']) {
      expect(input(id).getAttribute('aria-invalid')).toBe('true');
      expect(ids(input(id))).toContain(error.id);
    }
    expect(ids(root.querySelector('fieldset')!)).toContain(error.id);
  });

  it('selects a button from its label', () => {
    const { fixture, root, host } = setup();
    root.querySelector<HTMLLabelElement>('#hour label')!.click();
    fixture.detectChanges();
    expect(host.duration.value).toBe('60');
  });

  it('gives each control its own id', () => {
    const { root } = setup();
    const ids = [...root.querySelectorAll('input')].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
