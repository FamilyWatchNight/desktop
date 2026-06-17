export const PAGE_IDS = {
  HOME: 'home',
  SETTINGS: 'settings',
  BACKGROUND_TASKS: 'background-tasks',
  STYLEBOARD: 'styleboard',
} as const;

export type PageId = (typeof PAGE_IDS)[keyof typeof PAGE_IDS];
