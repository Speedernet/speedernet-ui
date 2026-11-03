import {
  LucideArchive,
  LucideCheck,
  LucideClock,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';
import type { SpeedBadgeTone } from './badge';

export type SpeedStatus = 'confirmed' | 'pending' | 'cancelled' | 'archived';

const APPEARANCES: Record<SpeedStatus, { tone: SpeedBadgeTone; icon: LucideIconData }> = {
  confirmed: { tone: 'primary', icon: LucideCheck.icon },
  pending: { tone: 'accent', icon: LucideClock.icon },
  cancelled: { tone: 'brand', icon: LucideX.icon },
  archived: { tone: 'neutral', icon: LucideArchive.icon },
};

/** Tone and icon of a status: the status is always carried by an icon and a word, never colour alone. */
export function statusAppearance(status: SpeedStatus): {
  tone: SpeedBadgeTone;
  icon: LucideIconData;
} {
  return APPEARANCES[status];
}
