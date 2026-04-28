import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../technical/infrastructure/world';
import { InternalSystemPersona } from '../../business-flow/personas/internal-system';
import { attemptAsync } from '../../technical/infrastructure/utils';

/**
 * Wraps a Playwright assertion to ensure custom messages show up in Cucumber.
 */
export async function assert(assertion: () => Promise<void> | void, message: string) {
  try {
    await assertion();
  } catch (err) {
    throw new Error(`${message}\n${(err as Error).message}`);
  }
}

function getSystemPersona(world: CustomWorld): InternalSystemPersona {
  const state = world.getStateStore('personas');
  if (!state.system) {
    state.system = new InternalSystemPersona(world);
  }
  return state.system as InternalSystemPersona;
}

function parsePermissionList(list: string): string[] {
  return list.split(',').map((permission) => permission.trim()).filter(Boolean);
}

function formatDisplayNameFromKey(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function setStoreRole(world: CustomWorld, role: { id: number }, permissions: string[], roleKey?: string) {
  world.setStateObject('roles', { ...role, permissions }, roleKey);
}

function getStoreRole(world: CustomWorld, roleKey?: string) {
  return world.getStateObject('roles', roleKey) as { id: number, permissions: string[] };
}

async function getRoleByKey(world: CustomWorld, roleKey: string) {
  const system = getSystemPersona(world);

  let role = await system.getRoleByStub(roleKey) as { id: number } | null;
  if (!role) {
    role = getStoreRole(world, roleKey);
  }
  return role;
}

function getStoreRolePermissions(world: CustomWorld, roleKey?: string): string[] {
  const stored = getStoreRole(world, roleKey);
  return (stored as { id: number, permissions: string[] }).permissions;
}

function setStoreUser(world: CustomWorld, user: { id: number }, userKey?: string) {
  world.setStateObject('users', user, userKey);
}

function getStoreUser(world: CustomWorld, userKey?: string) {
  return world.getStateObject('users', userKey) as { id: number };
}

async function createRole(world: CustomWorld, roleKey?: string, permissions?: string[]) {
  const system = getSystemPersona(world);
  const roleName = roleKey ? formatDisplayNameFromKey(roleKey) : 'Test Role';
  
  // Use default permissions if none specified
  const defaultPermissions = ['can-vote', 'can-rate', 'can-update-profile'];
  const rolePermissions = permissions ?? defaultPermissions;
  
  const created = await system.createRole(roleName, rolePermissions);

  setStoreRole(world, created, rolePermissions, roleKey);

  return created;
}

async function createUser(world: CustomWorld, userKey?: string) {
  const system = getSystemPersona(world);
  const username = userKey ?? `testuser-${Math.floor(Math.random() * 100000)}`;
  const user = await system.createUser({ username });

  setStoreUser(world, user, userKey);

  return user;
}

Given('a role {string} exists', async function (this: CustomWorld, roleKey: string) {
  await createRole(this, roleKey);
});

Given('a role {string} exists with the permissions {string}', async function (
  this: CustomWorld,
  roleKey: string,
  permissions: string
) {
  await createRole(this, roleKey, parsePermissionList(permissions));
});

Given('a role exists with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await createRole(this, undefined, parsePermissionList(permissions));
});

Given('a role exists with display name {string} and hidden status {string}', async function (
  this: CustomWorld,
  displayName: string,
  hiddenStatus: string
) {
  const created = await createRole(this, undefined, []);
  const system = getSystemPersona(this);
  await system.updateRoleDisplayName(created.id, displayName);
  await system.updateRoleHiddenStatus(created.id, hiddenStatus.toLowerCase() === 'true');

  // Validate that the role was created with the correct properties
  const updatedRole = await system.getRoleById(created.id);
  expect(updatedRole).toBeTruthy();
  expect(updatedRole!.displayName).toBe(displayName);
  expect(updatedRole!.isHidden).toBe(hiddenStatus.toLowerCase() === 'true');
});

Given('a role {string} exists with display name {string} and hidden status {string}', async function (
  this: CustomWorld,
  roleKey: string,
  displayName: string,
  hiddenStatus: string
) {
  const created = await createRole(this, roleKey, []);
  const system = getSystemPersona(this);
  await system.updateRoleDisplayName(created.id, displayName);
  await system.updateRoleHiddenStatus(created.id, hiddenStatus.toLowerCase() === 'true');

  // Validate that the role was created with the correct properties
  const updatedRole = await system.getRoleById(created.id);
  expect(updatedRole).toBeTruthy();
  expect(updatedRole!.displayName).toBe(displayName);
  expect(updatedRole!.isHidden).toBe(hiddenStatus.toLowerCase() === 'true');
});

Given('a custom role exists', async function (this: CustomWorld) {
  await createRole(this);
});

Given('the system role {string} exists', async function (this: CustomWorld, roleStub: string) {
  const system = getSystemPersona(this);
  const role = await system.getRoleByStub(roleStub);
  if (!role) {
    throw new Error(`Expected system role with stub ${roleStub} to exist`);
  }

  const permissions = await system.getRolePermissions(role.id);
  setStoreRole(this, role, permissions, roleStub);
});

Given('no users have the system role {string} assigned', async function (this: CustomWorld, roleStub: string) {
  const system = getSystemPersona(this);
  const role = await system.getRoleByStub(roleStub);
  if (!role) {
    throw new Error(`Expected system role with stub ${roleStub} to exist`);
  }

  // Verify no users have this role assigned
  const assignments = await system.getUsersWithRole(role.id);
  if (assignments.length > 0) {
    throw new Error(`Role ${roleStub} is already assigned to ${assignments.length} user(s), but the test expects no assignments`);
  }

  const permissions = await system.getRolePermissions(role.id);
  setStoreRole(this, role, permissions, roleStub);
});

Given('a user exists with the role assigned', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const user = await createUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

Given('a user exists with the role {string} assigned', async function (this: CustomWorld, roleKey: string) {
  const system = getSystemPersona(this);
  const role = await getRoleByKey(this, roleKey) as { id: number };
  
  const user = await createUser(this);
  await system.assignRoleToUser(user.id, role.id);
  
  setStoreUser(this, user);

  const permissions = await system.getRolePermissions(role.id);
  setStoreRole(this, {id: role.id}, permissions, roleKey);
});

Given('a user {string} exists with no roles assigned', async function (this: CustomWorld, userKey: string) {
  const user = await createUser(this);
  setStoreUser(this, user, userKey);
});

Given('a user {string} exists with the role {string} assigned', async function (this: CustomWorld, userKey: string, roleKey: string) {
  const system = getSystemPersona(this);
  const role = await getRoleByKey(this, roleKey) as { id: number };
  const user = await createUser(this);
  await system.assignRoleToUser(user.id, role.id);

  setStoreUser(this, user, userKey);
});

Given('no users have the role assigned', async function (this: CustomWorld) {
  // ensure a current role exists and remains unassigned
  const role = getStoreRole(this);

  // Verify no users have this role assigned
  const system = getSystemPersona(this);
  const assignments = await system.getUsersWithRole(role.id);
  if (assignments.length > 0) {
    throw new Error(`Role ${role.id} is already assigned to ${assignments.length} user(s), but the test expects no assignments`);
  }
});

Given('the role {string} has permissions {string}', async function (this: CustomWorld, roleKey: string, permissions: string) {
  const role = await getRoleByKey(this, roleKey) as { id: number };
  const system = getSystemPersona(this);
  const parsedPermissions = parsePermissionList(permissions);
  await system.setRolePermissions(role.id, parsedPermissions);

  setStoreRole(this, role, parsedPermissions, roleKey);
});

async function hideRole(world: CustomWorld) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  return system.updateRoleHiddenStatus(role.id, true);
}

async function hideRoleByKey(world: CustomWorld, roleKey: string) {
  const role = await getRoleByKey(world, roleKey) as { id: number };
  const system = getSystemPersona(world);
  return await system.updateRoleHiddenStatus(role.id, true);
}

When('I hide the role', async function (this: CustomWorld) {
  await hideRole(this);
});

When('I attempt to hide the role', async function (this: CustomWorld) {
   await attemptAsync(this, () => hideRole(this));
});

When('I hide the role {string}', async function (this: CustomWorld, roleKey: string) {
  await hideRoleByKey(this, roleKey);
});

When('I attempt to hide the role {string}', async function (this: CustomWorld, roleKey: string) {
   await attemptAsync(this, () => hideRoleByKey(this, roleKey));
});

async function renameRole(world: CustomWorld, displayName: string) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  return system.updateRoleDisplayName(role.id, displayName);
}

async function renameRoleWithStatus(world: CustomWorld, displayName: string, hiddenStatus: string) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  return system.updateRole(role.id, {
    displayName,
    isHidden: hiddenStatus.toLowerCase() === 'true'
  });
}

When('I rename the role to have display name {string}', async function (this: CustomWorld, displayName: string) {
  await renameRole(this, displayName);
});

When('I attempt to rename the role to have display name {string}', async function (this: CustomWorld, displayName: string) {
   await attemptAsync(this, () => renameRole(this, displayName));
});

When('I rename the role to have display name {string} and hidden status {string}', async function (
  this: CustomWorld,
  displayName: string,
  hiddenStatus: string
) {
  await renameRoleWithStatus(this, displayName, hiddenStatus);
});

When('I attempt to rename the role to have display name {string} and hidden status {string}', async function (
  this: CustomWorld,
  displayName: string,
  hiddenStatus: string
) {
   await attemptAsync(this, () => renameRoleWithStatus(this, displayName, hiddenStatus));

});

async function duplicateRole(world: CustomWorld, sourceRoleKey: string, targetRoleKey: string) {
  const sourceRole = await getRoleByKey(world, sourceRoleKey) as { id: number };
  const system = getSystemPersona(world);
  const duplicatedRoleId = await system.duplicateRole(sourceRole.id);
  const duplicated = await system.getRoleById(duplicatedRoleId);
  if (!duplicated) {
    throw new Error('Failed to retrieve duplicated role');
  }
  const duplicatedPermissions = await system.getRolePermissions(duplicated.id);
  setStoreRole(world, duplicated, duplicatedPermissions, targetRoleKey);
  return duplicated;
}

When('I duplicate the role {string} to create a new role {string}', async function (
  this: CustomWorld,
  sourceRoleKey: string,
  targetRoleKey: string
) {
  await duplicateRole(this, sourceRoleKey, targetRoleKey);
});

When('I attempt to duplicate the role {string} to create a new role {string}', async function (
  this: CustomWorld,
  sourceRoleKey: string,
  targetRoleKey: string
) {
  await attemptAsync(this, async () => { await duplicateRole(this, sourceRoleKey, targetRoleKey) } );
});

When('I attempt to delete the system role {string}', async function (this: CustomWorld, roleStub: string) {
  const system = getSystemPersona(this);
  const role = await system.getRoleByStub(roleStub);
  this.clearLastError();

  if (!role) {
    throw new Error(`Expected system role with stub ${roleStub} to exist`);
  }
  try {
    await system.deleteRole(role.id);
  } catch (error) {
    this.setLastError(error);
  }
});

async function deleteLastRole(world: CustomWorld) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  return system.deleteRole(role.id);
}

When('I delete the role', async function (this: CustomWorld) {
    await deleteLastRole(this);
});

When('I attempt to delete the role', async function (this: CustomWorld) {
   await attemptAsync(this, () => deleteLastRole(this));
});

Given('a user exists with no roles assigned', async function (this: CustomWorld) {
  await createUser(this);
});

Given('a user exists with only the role assigned', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const user = await createUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

When('I create a role', async function (this: CustomWorld) {
  await createRole(this);
});

When('I attempt to create a role', async function (this: CustomWorld) {
   await attemptAsync(this, async () => { await createRole(this) } );
});

When('I create a role with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await createRole(this, undefined, parsePermissionList(permissions));
});

When('I attempt to create a role with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await attemptAsync(this, async () => { await createRole(this, undefined, parsePermissionList(permissions)) } );
});

async function setRolePermissions(world: CustomWorld, permissions: string[]) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  return system.setRolePermissions(role.id, permissions);
}

When('I update the role\'s permissions to be empty', async function (this: CustomWorld) {
  await setRolePermissions(this, []);
});

When('I attempt to update the role\'s permissions to be empty', async function (this: CustomWorld) {
  await attemptAsync(this, () => setRolePermissions(this, []));
});

When('I update the role\'s permissions to be {string}', async function (this: CustomWorld, permissions: string) {
  await setRolePermissions(this, parsePermissionList(permissions));
});

When('I attempt to update the role\'s permissions to be {string}', async function (this: CustomWorld, permissions: string) {
  await attemptAsync(this, () => setRolePermissions(this, parsePermissionList(permissions)));
});

When('I assign the role to the user', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

When('I assign the role {string} to the user', async function (this: CustomWorld, roleKey: string) {
  const role = await getRoleByKey(this, roleKey) as { id: number };
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

Then('the role should have the permissions {string}', async function (this: CustomWorld, permissions: string) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getRolePermissions(role.id);
  expect(actualPermissions.sort()).toEqual(parsePermissionList(permissions).sort());
});

Then('the role should have no permissions', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getRolePermissions(role.id);
  expect(actualPermissions).toEqual([]);
});

Then('the user should have no permissions', async function (this: CustomWorld) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getUserPermissions(user.id);
  expect(actualPermissions).toEqual([]);
});

Then('the user should have all defined permissions', async function (this: CustomWorld) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getUserPermissions(user.id);
  const allPermissions = await system.getAllPermissions();
  expect(actualPermissions.sort()).toEqual(allPermissions.sort());
});

Then('the user should have exactly the permissions originally assigned to the role', async function (this: CustomWorld) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const rolePermissions = getStoreRolePermissions(this);
  const userPermissions = await system.getUserPermissions(user.id);
  expect(userPermissions.sort()).toEqual(rolePermissions.sort());
});

Then('the user\'s roles should be exactly {string}', async function (this: CustomWorld, expectedRoles: string) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const actualRoleIds = await system.getRolesForUser(user.id);
  
  // Resolve expected role keys to role IDs
  const expectedRoleIds = [];
  const expectedKeys = expectedRoles.split(',').map((roleKey) => roleKey.trim()).filter(Boolean);
  
  for (const roleKey of expectedKeys) {
    const role = await getRoleByKey(this, roleKey);
    expectedRoleIds.push(role.id);
  }
  
  expect(actualRoleIds.sort()).toEqual(expectedRoleIds.sort());
});

Then('the permissions for the user should be exactly {string}', async function (this: CustomWorld, expectedPermissions: string) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getUserPermissions(user.id);
  expect(actualPermissions.sort()).toEqual(parsePermissionList(expectedPermissions).sort());
});

Then('the role should no longer exist', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeFalsy();
});

Then('the role should not be marked as a system role', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.systemStub).toBeNull();
});

Then('the role should be marked as hidden', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(true);
});

Then('the role should have display name {string}', async function (this: CustomWorld, displayName: string) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.displayName).toBe(displayName);
});

Then('the role should not be marked as hidden', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(false);
});

Then('the role {string} should have the permissions {string}', async function (this: CustomWorld, roleKey: string, permissions: string) {
  const role = await getRoleByKey(this, roleKey);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getRolePermissions(role.id);
  expect(actualPermissions.sort()).toEqual(parsePermissionList(permissions).sort());
});

Then('the role {string} should not be marked as a system role', async function (this: CustomWorld, roleKey: string) {
  const role = await getRoleByKey(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.systemStub).toBeNull();
});

Then('the role {string} should not be marked as hidden', async function (this: CustomWorld, roleKey: string) {
  const role = await getRoleByKey(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(false);
});

Then('the role {string} should have display name {string}', async function (this: CustomWorld, roleKey: string, displayName: string) {
  const role = await getRoleByKey(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.displayName).toBe(displayName);
});

Then('the role {string} should be marked as hidden', async function (this: CustomWorld, roleKey: string) {
  const role = await getRoleByKey(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(true);
});

Then('an AuthenticationError should be thrown', async function (this: CustomWorld) {
  const { error } = this.getLastError() as { error: Error };
  expect(error).toBeDefined();
  await assert(() => {expect(error.name).toBe("AuthenticationError")}, `Expected an AuthenticationError, but got ${error.name} with message: ${error.message}`);
});

Then('an AuthorizationError should be thrown', async function (this: CustomWorld) {
  const { error } = this.getLastError() as { error: Error };
  expect(error).toBeDefined();
  await assert(() => {expect(error.name).toBe("AuthorizationError")}, `Expected an AuthorizationError, but got ${error.name} with message: ${error.message}`);
});

Then('an error should be thrown', function (this: CustomWorld) {
  const { error } = this.getLastError();
  expect(error).toBeTruthy();
});

Then('no error should be thrown', function (this: CustomWorld) {
  const { error } = this.getLastError();
  expect(error).toBeFalsy();
});

Given('I run unauthenticated', function (this: CustomWorld) {
  const persona = getSystemPersona(this);
  persona.runUnauthenticated();
});

Given('I run with the permissions {string}', function (this: CustomWorld, permissions: string) {
  const persona = getSystemPersona(this);
  const permissionStubs = parsePermissionList(permissions);
  persona.runWithPermissions(permissionStubs);
});

Given('I run without the permissions {string}', function (this: CustomWorld, permissions: string) {
  const persona = getSystemPersona(this);
  const excludedPermissionStubs = parsePermissionList(permissions);
  persona.runWithoutPermissions(excludedPermissionStubs);
});

Given('I run authenticated with no explicit permissions', function (this: CustomWorld) {
  const persona = getSystemPersona(this);
  persona.runWithPermissions([]);
});

Given('I run as user {string}', async function (this: CustomWorld, userKey: string) {
  const persona = getSystemPersona(this);
  const user = getStoreUser(this, userKey);
  await persona.runAsUser(user?.id);
});

async function getAllRoles(world: CustomWorld) {
  const system = getSystemPersona(world);
  const allRoles = await system.getAllRoles();
  world.setStateReturn(allRoles, 'getRoles');
  return allRoles;
}

When('I retrieve all roles', async function (this: CustomWorld) {
  await getAllRoles(this);
});

When('I attempt to retrieve all roles', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await getAllRoles(this); });
});

When('I find all users with the role {string}', async function (this: CustomWorld, roleKey: string) {
  const system = getSystemPersona(this);
  const role = await getRoleByKey(this, roleKey);
  const userIds = await system.getUsersWithRole(role.id);
  this.setStateReturn(userIds, 'getUsers');
});

async function getAllPermissions(world: CustomWorld) {
  const system = getSystemPersona(world);
  const permissions = await system.getAllPermissions();
  world.setStateReturn(permissions, 'getPermissions');
  return permissions;
}

When('I retrieve all defined permissions', async function (this: CustomWorld) {
  await getAllPermissions(this);
});

When('I attempt to retrieve all defined permissions', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await getAllPermissions(this); });
});

Then('the results should include the role {string}', async function (this: CustomWorld, roleKey: string) {
  const roles = this.getStateReturn("getRoles") as { id: number }[];
  expect(roles).toBeTruthy();
  
  const expectedRole = await getRoleByKey(this, roleKey);
  expect(expectedRole).toBeTruthy();

  const found = roles.some(role => role.id === expectedRole!.id);
  expect(found).toBe(true);
});

Then('the results should include the user {string}', async function (this: CustomWorld, userKey: string) {
  const expectedUser = getStoreUser(this, userKey);
  const userIds = this.getStateReturn("getUsers") as number[];
  expect(userIds).toBeTruthy();
  expect(userIds).toContain(expectedUser.id);
});

Then('the results should not include the user {string}', async function (this: CustomWorld, userKey: string) {
  const expectedUser = getStoreUser(this, userKey);
  const userIds = this.getStateReturn("getUsers") as number[];
  expect(userIds).toBeTruthy();
  expect(userIds).not.toContain(expectedUser.id);
});

Then('the results should include exactly these permissions:', async function (this: CustomWorld, dataTable) {
  const permissions = this.getStateReturn("getPermissions") as string[];
  expect(permissions).toBeDefined();
  
  const expectedPermissions = dataTable.raw().flat().filter(Boolean);
  expect(permissions.sort()).toEqual(expectedPermissions.sort());
});

async function getRole(world: CustomWorld) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  const foundRole = await system.getRoleById(role.id);
  return foundRole;
}

When('I get the role', async function (this: CustomWorld) {
  await getRole(this);
});

When('I attempt to get the role', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await getRole(this); });
});

async function getSystemRole(world: CustomWorld, roleStub: string) {
  const system = getSystemPersona(world);
  const foundRole = await system.getRoleByStub(roleStub);
  if (!foundRole) {
    throw new Error(`Expected system role with stub ${roleStub} to exist`);
  }
  setStoreRole(world, foundRole, await system.getRolePermissions(foundRole.id), roleStub);
  return foundRole;
}

When('I get the system role {string}', async function (this: CustomWorld, roleStub: string) {
  await getSystemRole(this, roleStub);
});

When('I attempt to get the system role {string}', async function (this: CustomWorld, roleStub: string) {
  await attemptAsync(this, async () => { await getSystemRole(this, roleStub); });
});

async function getRolePermissions(world: CustomWorld) {
  const role = getStoreRole(world);
  const system = getSystemPersona(world);
  const permissions = await system.getRolePermissions(role.id);
  world.setStateReturn(permissions, 'getPermissions');
  return permissions;
}

When('I get permissions for the role', async function (this: CustomWorld) {
  await getRolePermissions(this);
});

When('I attempt to get permissions for the role', async function (this: CustomWorld) {
  await attemptAsync(this, async () => { await getRolePermissions(this); });
});
