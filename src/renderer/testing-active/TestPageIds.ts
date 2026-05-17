export const TEST_PAGE_IDS = {
  PAGE_FRAMEWORK_TEST: 'page-framework',
} as const;

export type TestPageId = (typeof TEST_PAGE_IDS)[keyof typeof TEST_PAGE_IDS];
