
export const REMINDER_TYPES = [
  'initial',
  '24h',
  '48h',
  '1 week'
] as const;

export type ReminderType = typeof REMINDER_TYPES[number];
