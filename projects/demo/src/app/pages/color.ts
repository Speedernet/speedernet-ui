// Color helpers for the foundations page: turn a token value such as "oklch(76.1% 0.129 205.7)"
// into its sRGB hex value and pick the readable text color on it (WCAG 2 contrast).

export interface SwatchInfo {
  hex: string;
  /** Text color with the best contrast on the swatch: the text gray or white. */
  text: 'dark' | 'light';
  /** Contrast ratio of that text color on the swatch. */
  ratio: number;
  /** WCAG level reached by that ratio. */
  level: string;
}

const TEXT_DARK = [0x31, 0x31, 0x31]; // --color-text #313131
const TEXT_LIGHT = [0xff, 0xff, 0xff];

/** Parses "oklch(L% C H)" and returns its 8-bit sRGB channels, or null if it is not one. */
export function oklchToRgb(value: string): number[] | null {
  const match = value.trim().match(/^oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!match) return null;
  const l = Number(match[1]) / 100;
  const c = Number(match[2]);
  const h = (Number(match[3]) * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3);
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
  return linear.map((v) => {
    const x = Math.min(1, Math.max(0, v));
    const encoded = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(encoded * 255);
  });
}

function luminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function swatchInfo(value: string): SwatchInfo | null {
  const rgb = oklchToRgb(value);
  if (!rgb) return null;
  const dark = contrast(rgb, TEXT_DARK);
  const light = contrast(rgb, TEXT_LIGHT);
  const ratio = Math.max(dark, light);
  return {
    hex:
      '#' +
      rgb
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase(),
    text: dark >= light ? 'dark' : 'light',
    ratio,
    level: ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA gros texte' : 'insuffisant',
  };
}
