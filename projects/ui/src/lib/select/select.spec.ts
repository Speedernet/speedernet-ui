import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpeedControl } from '../field/control';
import { SpeedField } from '../field/field';
import { SpeedSelect } from './select';

@Component({
  imports: [SpeedField, SpeedControl, SpeedSelect, ReactiveFormsModule],
  template: `
    <speed-field label="Room" hint="Rooms on the 3rd floor." [error]="error()">
      <speed-select>
        <select speedControl [formControl]="room">
          <option value="" disabled>Choose a room</option>
          <option value="croix-rousse">Croix-Rousse</option>
          <option value="fourviere">Fourvière</option>
        </select>
      </speed-select>
    </speed-field>
  `,
})
class Host {
  readonly error = signal<string | null>(null);
  readonly room = new FormControl('');
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const select = root.querySelector('select')!;
  return { fixture, root, select };
}

describe('SpeedSelect', () => {
  it('keeps the native select, labelled and described by its field', () => {
    const { root, select } = setup();
    const label = root.querySelector<HTMLLabelElement>('label')!;
    expect(label.htmlFor).toBe(select.id);
    expect(label.textContent!.trim()).toBe('Room');
    const hint = root.querySelector('.speed-field-hint')!;
    expect(select.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('adds a decorative chevron after the select', () => {
    const { select } = setup();
    const chevron = select.nextElementSibling!;
    expect(chevron.classList).toContain('speed-select-chevron');
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
  });

  it('flags the select when the field shows an error', () => {
    const { fixture, root, select } = setup();
    fixture.componentInstance.error.set('Please choose a room.');
    fixture.detectChanges();
    expect(select.getAttribute('aria-invalid')).toBe('true');
    const error = root.querySelector('.speed-field-error')!;
    expect(select.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('works with Angular forms both ways', () => {
    const { fixture, select } = setup();
    fixture.componentInstance.room.setValue('fourviere');
    fixture.detectChanges();
    expect(select.value).toBe('fourviere');
    select.value = 'croix-rousse';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.room.value).toBe('croix-rousse');
  });

  it('follows the disabled state of the form control', () => {
    const { fixture, select } = setup();
    fixture.componentInstance.room.disable();
    fixture.detectChanges();
    expect(select.disabled).toBe(true);
  });
});
