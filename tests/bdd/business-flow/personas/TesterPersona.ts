/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import { FormControlsTestPage } from '../../technical/page-objects/FormControlsTestPage';
import { PageFrameworkTestPage } from '../../technical/page-objects/PageFrameworkTestPage';

import { UserPersona } from './UserPersona';

export class TesterPersona extends UserPersona {
  async navigateToPageFrameworkTestPage(): Promise<void> {
    const frameworkPage = new PageFrameworkTestPage(this.world);
    await frameworkPage.navigateToPage();
  }

  async navigateToFormControlsTestPage(): Promise<void> {
    const formControlsPage = new FormControlsTestPage(this.world);
    await formControlsPage.navigateToPage();
  }
}
