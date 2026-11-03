import {
  LucideCheck,
  LucideCircleAlert,
  LucideTriangleAlert,
  type LucideIconData,
} from '@lucide/angular';
import type { SpeedBadgeTone } from '../badge/badge';

export type SpeedMessageType = 'success' | 'info' | 'warning' | 'error';

const APPEARANCES: Record<
  SpeedMessageType,
  { label: string; tone: SpeedBadgeTone; icon: LucideIconData | null }
> = {
  success: { label: "C'est fait", tone: 'solid', icon: LucideCheck.icon },
  info: { label: 'Info', tone: 'primary', icon: null },
  warning: { label: 'Attention', tone: 'accent', icon: LucideTriangleAlert.icon },
  error: { label: 'Erreur', tone: 'brand', icon: LucideCircleAlert.icon },
};

/** Word, tone and icon of a message type: the type is always carried by a word, never colour alone. */
export function messageAppearance(type: SpeedMessageType): {
  label: string;
  tone: SpeedBadgeTone;
  icon: LucideIconData | null;
} {
  return APPEARANCES[type];
}
