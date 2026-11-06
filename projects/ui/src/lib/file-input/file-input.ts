import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  LucideCircleAlert,
  LucideCloudUpload,
  LucideDynamicIcon,
  LucideFile,
  LucideX,
} from '@lucide/angular';

/** A chosen file as the component lists it. */
interface ChosenFile {
  readonly name: string;
  readonly size: string;
}

const sizeFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/** File size in French units: `850 o`, `12 Ko`, `1,4 Mo`. */
export function formatFileSize(bytes: number): string {
  const units = ['o', 'Ko', 'Mo', 'Go'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${sizeFormat.format(value)} ${units[unit]}`;
}

/**
 * Whether a file matches the `accept` attribute of a file input, with the rules of the HTML
 * standard: an extension (`.pdf`), a MIME type (`application/pdf`) or a family (`image/*`), case
 * insensitive. An empty `accept` accepts every file.
 */
export function acceptsFile(accept: string, file: Pick<File, 'name' | 'type'>): boolean {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith('.')) {
      return name.endsWith(token);
    }
    if (token.endsWith('/*')) {
      return type.startsWith(token.slice(0, -1));
    }
    return type === token;
  });
}

/**
 * File picker with a drop zone: wraps the native `<input type="file" speedControl>`, transparent
 * and stretched over the zone, then lists the chosen files with a button to remove each one. The
 * native control keeps its keyboard behaviour, its system dialog, drops and what screen readers
 * announce; label, hint and error come from the surrounding `speed-field`.
 *
 * Browsers do not apply `accept` to dropped files: the component removes the files that do not
 * match it before the application's own `input` and `change` listeners run, names them in a
 * message and emits them through `rejected`.
 */
@Component({
  selector: 'speed-file-input',
  imports: [LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="speed-file-input-zone" [class.speed-file-input-dragging]="dragging()">
      <ng-content select="input" />
      <span class="speed-file-input-icon" aria-hidden="true">
        <svg [lucideIcon]="uploadIcon" [size]="24"></svg>
      </span>
      <span class="speed-file-input-text" aria-hidden="true">
        <strong>{{ dropLabel() }}</strong>
        <span class="speed-file-input-or">ou</span>
      </span>
      <span class="speed-file-input-button" aria-hidden="true">{{ buttonLabel() }}</span>
    </div>
    @if (rejectedMessage(); as message) {
      <p class="speed-field-error speed-file-input-rejected" role="alert">
        <svg [lucideIcon]="alertIcon" [size]="18" aria-hidden="true"></svg>
        <span>{{ message }}</span>
      </p>
    }
    @if (files().length > 0) {
      <ul class="speed-file-input-files" [attr.aria-label]="listLabel()">
        @for (file of files(); track $index) {
          <li class="speed-file-input-file">
            <svg [lucideIcon]="fileIcon" [size]="20" aria-hidden="true"></svg>
            <span class="speed-file-input-name" [title]="file.name">{{ file.name }}</span>
            <span class="speed-file-input-size">{{ file.size }}</span>
            <button
              type="button"
              class="speed-file-input-remove"
              [attr.aria-label]="removeLabel() + ' ' + file.name"
              (click)="remove($index)"
            >
              <svg [lucideIcon]="removeIcon" [size]="18" aria-hidden="true"></svg>
            </button>
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './file-input.scss',
  host: {
    class: 'speed-file-input',
    '(dragenter)': 'drag(true)',
    '(dragleave)': 'drag(false)',
    '(drop)': 'drag(false)',
  },
})
export class SpeedFileInput {
  /** Main text of the drop zone. */
  readonly dropLabel = input('Glissez-déposez un fichier ici');
  /** Text of the drawn button. */
  readonly buttonLabel = input('Choisir un fichier');
  /** Accessible name of the list of chosen files. */
  readonly listLabel = input('Fichiers sélectionnés');
  /** Accessible name of the remove buttons, followed by the file name. */
  readonly removeLabel = input('Retirer');
  /** Start of the message naming the files whose type is not accepted. */
  readonly rejectedLabel = input('Type de fichier non accepté');

  /** Files removed from a choice or a drop because they do not match `accept`. */
  readonly rejected = output<File[]>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected readonly files = signal<readonly ChosenFile[]>([]);
  private readonly rejectedNames = signal<readonly string[]>([]);
  /** True while files are dragged over the zone. */
  protected readonly dragging = signal(false);

  protected readonly rejectedMessage = computed(() => {
    const names = this.rejectedNames();
    // Non-breaking space before the colon, as French typography wants.
    return names.length > 0 ? `${this.rejectedLabel()} : ${names.join(', ')}` : null;
  });

  protected readonly uploadIcon = LucideCloudUpload.icon;
  protected readonly fileIcon = LucideFile.icon;
  protected readonly removeIcon = LucideX.icon;
  protected readonly alertIcon = LucideCircleAlert.icon;

  /** Files of the input already checked, so `change` does not undo what `input` reported. */
  private checked: FileList | null = null;

  constructor() {
    // Capture phase: runs before the listeners the application puts on the input itself.
    for (const type of ['input', 'change']) {
      this.host.addEventListener(type, (event) => this.check(event.target), true);
    }
  }

  protected drag(over: boolean): void {
    this.dragging.set(over && !this.control()?.disabled);
  }

  /**
   * Removes one file from the native input and notifies the application with the `input` and
   * `change` events a new choice would send; focus goes back to the input.
   */
  protected remove(index: number): void {
    const control = this.control();
    if (!control?.files) {
      return;
    }
    control.files = toFileList([...control.files].filter((_, i) => i !== index));
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
    control.focus();
  }

  private check(target: EventTarget | null): void {
    const control = this.control();
    if (!control || target !== control || control.files === this.checked) {
      return;
    }
    const files = [...(control.files ?? [])];
    const accepted = files.filter((file) => acceptsFile(control.accept, file));
    const rejected = files.filter((file) => !accepted.includes(file));
    if (rejected.length > 0) {
      control.files = toFileList(accepted);
      this.rejected.emit(rejected);
    }
    this.checked = control.files;
    this.rejectedNames.set(rejected.map((file) => file.name));
    this.files.set(accepted.map((file) => ({ name: file.name, size: formatFileSize(file.size) })));
  }

  private control(): HTMLInputElement | null {
    return this.host.querySelector<HTMLInputElement>(
      ':scope > .speed-file-input-zone > input[type="file"]',
    );
  }
}

function toFileList(files: readonly File[]): FileList {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  return transfer.files;
}
