import {
  LucideArchive,
  LucideCheck,
  LucideClock,
  LucideX,
  type LucideIconData,
} from '@lucide/angular';
import type { SnBadgeTone } from './badge';

export type SnStatus = 'confirmed' | 'pending' | 'cancelled' | 'archived';

const APPEARANCES: Record<SnStatus, { tone: SnBadgeTone; icon: LucideIconData }> = {
  confirmed: { tone: 'primary', icon: LucideCheck.icon },
  pending: { tone: 'accent', icon: LucideClock.icon },
  cancelled: { tone: 'brand', icon: LucideX.icon },
  archived: { tone: 'neutral', icon: LucideArchive.icon },
};

/** Tone and icon of a status: the status is always carried by an icon and a word, never colour alone. */
export function statusAppearance(status: SnStatus): { tone: SnBadgeTone; icon: LucideIconData } {
  return APPEARANCES[status];
}
