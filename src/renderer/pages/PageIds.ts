export const PAGE_IDS = {
  HOME: 'home',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  BACKGROUND_TASKS: 'background-tasks',
  STYLEBOARD: 'styleboard',
} as const;

export type PageId = (typeof PAGE_IDS)[keyof typeof PAGE_IDS];
