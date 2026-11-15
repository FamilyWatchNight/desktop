# Agent UI BDD Testing

Use this guidance when writing BDD tests that exercise the UI.

## UI test levels

- Component tests validate controls using test-only pages excluded from production builds. Build these as real app pages with production layout components and live controls; source them from `src/renderer/testing-active/components/pages/` and register them in `src/renderer/testing-active/index.tsx`. Renderer test pages are copied into `src/renderer/testing/` for integration builds.
- User-experience tests validate complete user journeys and page transitions using domain-level language.
- Reserve element-specific feature steps for component tests that explicitly validate individual controls.

## Selector contract

- Give interactive controls and page roots stable, semantic `data-testid` values, independent of visible text and translations.
- Declare selectors in each PageObject's `selectors` map, then use `this.getSelector('name')` when creating a locator. Keep raw selectors out of steps and assertion methods.
- Treat test IDs as a UI contract, not just a testing convenience.

## PageObject assertions

- Keep locator lookup and browser-state assertions in technical PageObjects.
- Expose outcome-oriented assertion methods such as `assertThingVisible(shouldBeVisible: boolean)`, rather than returning a snapshot boolean for the step to assert.
- Use and await Playwright web-first assertions on locators. For visibility, use `toBeVisible()` or `not.toBeVisible()` so Playwright retries up to its default timeout. Use the corresponding web-first matcher for other UI state.
- Keep step definitions focused on scenario intent; delegate the expected UI state for the PageObject to assert instead of asserting a returned snapshot.

Within a PageObject (with `expect` imported from `@playwright/test`):

```ts
readonly selectors = {
  thing: '[data-testid="thing"]',
};

async assertThingVisible(shouldBeVisible: boolean): Promise<void> {
  const page = await this.getPage();
  const thing = page.locator(this.getSelector('thing'));

  if (shouldBeVisible) {
    await expect(thing).toBeVisible();
  } else {
    await expect(thing).not.toBeVisible();
  }
}
```
