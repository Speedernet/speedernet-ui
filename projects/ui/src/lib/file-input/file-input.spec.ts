import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpeedControl } from '../field/control';
import { SpeedFileInput, acceptsFile, formatFileSize } from './file-input';

@Component({
  imports: [SpeedControl, SpeedFileInput],
  template: `
    <speed-file-input
      label="Receipts"
      hint="PDF, 5 MB maximum."
      [error]="error()"
      (rejected)="rejected = $event"
    >
      <input
        type="file"
        speedControl
        accept=".pdf"
        multiple
        (change)="changes = changes + 1; received = names($event)"
      />
    </speed-file-input>
  `,
})
class Host {
  readonly error = signal<string | null>(null);
  changes = 0;
  received: string[] = [];
  rejected: File[] = [];

  names(event: Event): string[] {
    return [...(event.target as HTMLInputElement).files!].map((file) => file.name);
  }
}

@Component({
  imports: [SpeedControl, SpeedFileInput],
  template: `
    <speed-file-input label="Photo" dropLabel="Déposez une photo" buttonLabel="Parcourir">
      <input type="file" speedControl />
    </speed-file-input>
  `,
})
class CustomTextsHost {}

// jsdom has neither DataTransfer nor a way to build a FileList: arrays of files stand in for both.
class FakeDataTransfer {
  readonly files: File[] = [];
  readonly items = { add: (file: File) => this.files.push(file) };
}

function setup() {
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  const input = root.querySelector<HTMLInputElement>('input')!;
  const zone = root.querySelector('.speed-file-input-zone')!;
  const rows = () => [...root.querySelectorAll('.speed-file-input-file')];
  return { fixture, root, input, zone, rows };
}

function choose(input: HTMLInputElement, ...files: File[]) {
  Object.defineProperty(input, 'files', { configurable: true, writable: true, value: files });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

const file = (name: string, bytes = 1) => new File(['x'.repeat(bytes)], name);

describe('SpeedFileInput', () => {
  beforeEach(() => vi.stubGlobal('DataTransfer', FakeDataTransfer));
  afterEach(() => vi.unstubAllGlobals());

  it('is a field on its own: label, native input in the zone and hint, linked by ids', () => {
    const { root, input, zone } = setup();
    const host = root.querySelector('speed-file-input')!;
    expect(host.classList).toContain('speed-field');
    const label = host.querySelector<HTMLLabelElement>(':scope > .speed-field-label')!;
    expect(label.textContent!.trim()).toBe('Receipts');
    expect(input.parentElement).toBe(zone);
    expect(label.htmlFor).toBe(input.id);
    const hint = root.querySelector('.speed-field-hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
  });

  it('shows French texts, hidden from screen readers that hear the native input', () => {
    const { zone } = setup();
    expect(zone.querySelector('strong')!.textContent!.trim()).toBe(
      'Glissez-déposez un fichier ici',
    );
    const button = zone.querySelector('.speed-file-input-button')!;
    expect(button.textContent!.trim()).toBe('Choisir un fichier');
    for (const element of zone.querySelectorAll(':scope > span')) {
      expect(element.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('lists nothing until files are chosen', () => {
    const { root } = setup();
    expect(root.querySelector('.speed-file-input-files')).toBeNull();
  });

  it('lists each chosen file with its size', () => {
    const { fixture, root, input, rows } = setup();
    choose(input, file('facture-mars.pdf', 2048), file('facture-avril.pdf'));
    fixture.detectChanges();
    expect(root.querySelector('.speed-file-input-files')!.getAttribute('aria-label')).toBe(
      'Fichiers sélectionnés',
    );
    expect(rows().map((row) => row.querySelector('.speed-file-input-name')!.textContent)).toEqual([
      'facture-mars.pdf',
      'facture-avril.pdf',
    ]);
    expect(rows()[0].querySelector('.speed-file-input-size')!.textContent).toBe('2 Ko');
    expect(rows()[0].querySelector('button')!.getAttribute('aria-label')).toBe(
      'Retirer facture-mars.pdf',
    );
  });

  it('removes one file, notifies the application and focuses the input', () => {
    const { fixture, input, rows } = setup();
    choose(input, file('a.pdf'), file('b.pdf'));
    fixture.detectChanges();
    const changesBefore = fixture.componentInstance.changes;
    rows()[0].querySelector('button')!.click();
    fixture.detectChanges();
    expect([...input.files!].map((f) => f.name)).toEqual(['b.pdf']);
    expect(fixture.componentInstance.changes).toBe(changesBefore + 1);
    expect(rows().length).toBe(1);
    expect(document.activeElement).toBe(input);
  });

  it('removes the files whose type is not accepted before the application sees them', () => {
    const { fixture, root, input, rows } = setup();
    const photo = file('photo.png');
    choose(input, file('a.pdf'), photo, file('notes.txt'), file('B.PDF'));
    fixture.detectChanges();
    expect([...input.files!].map((f) => f.name)).toEqual(['a.pdf', 'B.PDF']);
    expect(fixture.componentInstance.received).toEqual(['a.pdf', 'B.PDF']);
    expect(fixture.componentInstance.rejected.map((f) => f.name)).toEqual([
      'photo.png',
      'notes.txt',
    ]);
    expect(fixture.componentInstance.rejected[0]).toBe(photo);
    expect(rows().length).toBe(2);
    const message = root.querySelector('.speed-file-input-rejected')!;
    expect(message.getAttribute('role')).toBe('alert');
    expect(message.textContent!.trim()).toBe(
      'Type de fichier non accepté\u00a0: photo.png, notes.txt',
    );
  });

  it('clears the message once an accepted choice follows', () => {
    const { fixture, root, input } = setup();
    choose(input, file('photo.png'));
    fixture.detectChanges();
    expect(root.querySelector('.speed-file-input-rejected')).not.toBeNull();
    choose(input, file('a.pdf'));
    fixture.detectChanges();
    expect(root.querySelector('.speed-file-input-rejected')).toBeNull();
  });

  it('keeps the message when the browser sends change after input for the same choice', () => {
    const { fixture, root, input } = setup();
    Object.defineProperty(input, 'files', {
      configurable: true,
      writable: true,
      value: [file('photo.png')],
    });
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('.speed-file-input-rejected')).not.toBeNull();
  });

  it('highlights the zone while files are dragged over it', () => {
    const { fixture, input, zone } = setup();
    input.dispatchEvent(new Event('dragenter', { bubbles: true }));
    fixture.detectChanges();
    expect(zone.classList).toContain('speed-file-input-dragging');
    input.dispatchEvent(new Event('dragleave', { bubbles: true }));
    fixture.detectChanges();
    expect(zone.classList).not.toContain('speed-file-input-dragging');
    input.dispatchEvent(new Event('dragenter', { bubbles: true }));
    input.dispatchEvent(new Event('drop', { bubbles: true }));
    fixture.detectChanges();
    expect(zone.classList).not.toContain('speed-file-input-dragging');
  });

  it('does not highlight a disabled zone', () => {
    const { fixture, input, zone } = setup();
    input.disabled = true;
    input.dispatchEvent(new Event('dragenter', { bubbles: true }));
    fixture.detectChanges();
    expect(zone.classList).not.toContain('speed-file-input-dragging');
  });

  it('flags the input when the field shows an error', () => {
    const { fixture, root, input } = setup();
    fixture.componentInstance.error.set('The file is larger than 5 MB.');
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const error = root.querySelector('.speed-field-error')!;
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
  });

  it('accepts other texts', () => {
    const fixture = TestBed.createComponent(CustomTextsHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('.speed-file-input-zone strong')!.textContent!.trim()).toBe(
      'Déposez une photo',
    );
    expect(root.querySelector('.speed-file-input-button')!.textContent!.trim()).toBe('Parcourir');
  });
});

describe('acceptsFile', () => {
  const pdf = { name: 'Facture.PDF', type: 'application/pdf' };
  const png = { name: 'photo.png', type: 'image/png' };
  const unknown = { name: 'notes', type: '' };

  it('accepts every file without accept', () => {
    expect(acceptsFile('', unknown)).toBe(true);
    expect(acceptsFile(' , ', png)).toBe(true);
  });

  it('matches extensions without case', () => {
    expect(acceptsFile('.pdf', pdf)).toBe(true);
    expect(acceptsFile('.PDF', { name: 'a.pdf', type: '' })).toBe(true);
    expect(acceptsFile('.pdf', png)).toBe(false);
  });

  it('matches MIME types and families', () => {
    expect(acceptsFile('application/pdf', pdf)).toBe(true);
    expect(acceptsFile('image/*', png)).toBe(true);
    expect(acceptsFile('image/*', pdf)).toBe(false);
    expect(acceptsFile('image/*', unknown)).toBe(false);
  });

  it('accepts a file matching any of the listed tokens', () => {
    expect(acceptsFile('.pdf, image/*', png)).toBe(true);
    expect(acceptsFile('.pdf, image/*', unknown)).toBe(false);
  });
});

describe('formatFileSize', () => {
  it('writes sizes in French units', () => {
    expect(formatFileSize(850)).toBe('850 o');
    expect(formatFileSize(12 * 1024)).toBe('12 Ko');
    expect(formatFileSize(1.4 * 1024 * 1024)).toBe('1,4 Mo');
    expect(formatFileSize(3 * 1024 ** 3)).toBe('3 Go');
  });
});
