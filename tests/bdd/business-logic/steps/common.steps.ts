import { Given } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../technical/infrastructure/world';
import { InternalSystemPersona } from '../../business-flow/personas/internal-system';

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

Given('the application is running with a test database', async function (this: CustomWorld) {
  const system = getSystemPersona(this);
  const dbstatus = await system.getDatabaseStatus();
  expect(dbstatus.dbInitialized).toBe(true);
});
