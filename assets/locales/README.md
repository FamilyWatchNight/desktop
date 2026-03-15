Use the `dev` locale to confirm visually that all strings have indeed been replaced with i18n lookups.

- Use at least three underscores (_) before and after the English text. The absence of this visual cue will make untranslatable strings more evident.
- Use enough underscores to make the text as long as one might reasonably expect text from another language to be. (A good guess is OK.) This will help with layout choices to minimize unexpected wrapping after translation to other languages.

Use the `test` locale (which is to remain undefined) for automated testing that involves the UI. Automation selectors can look for the key names in square brackets (e.g. `[key.name]`) and not be dependent on any given language's strings.