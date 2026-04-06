import { Given, When, Then } from '@cucumber/cucumber';
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

function getRbacState(world: CustomWorld) {
  const state = world.getStateStore('rbac') as {
    roles?: Map<string, unknown>;
    users?: Map<string, unknown>;
    lastRole?: unknown;
    lastUser?: unknown;
    deleteResult?: { success: boolean; error?: unknown };
  };
  if (!state.roles) {
    state.roles = new Map<string, unknown>();
  }
  if (!state.users) {
    state.users = new Map<string, unknown>();
  }
  return state;
}

function parsePermissionList(list: string): string[] {
  return list.split(',').map((permission) => permission.trim()).filter(Boolean);
}

function formatDisplayNameFromKey(key: string): string {
  return key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStoreRole(world: CustomWorld, roleKey?: string) {
  const state = getRbacState(world);
  if (!roleKey) {
    if (!state.lastRole) {
      throw new Error('No role has been created for the current scenario');
    }
    return (state.lastRole as { role: { id: number }; permissions: string[] }).role;
  }
  const stored = state.roles?.get(roleKey);
  if (!stored) {
    throw new Error(`No role stored for key: ${roleKey}`);
  }
  return (stored as { role: { id: number }; permissions: string[] }).role;
}

function getStoreRolePermissions(world: CustomWorld, roleKey?: string): string[] {
  const state = getRbacState(world);
  if (!roleKey) {
    if (!state.lastRole) {
      throw new Error('No role has been created for the current scenario');
    }
    return (state.lastRole as { role: { id: number }; permissions: string[] }).permissions;
  }
  const stored = state.roles?.get(roleKey);
  if (!stored) {
    throw new Error(`No role stored for key: ${roleKey}`);
  }
  return (stored as { role: { id: number }; permissions: string[] }).permissions;
}

function getStoreUser(world: CustomWorld, userKey?: string) {
  const state = getRbacState(world);
  if (!userKey) {
    if (!state.lastUser) {
      throw new Error('No user has been created for the current scenario');
    }
    return state.lastUser as { id: number };
  }
  const user = state.users?.get(userKey);
  if (!user) {
    throw new Error(`No user stored for key: ${userKey}`);
  }
  return user as { id: number };
}

async function createRole(world: CustomWorld, roleKey?: string, permissions?: string[]) {
  const system = getSystemPersona(world);
  const roleName = roleKey ? formatDisplayNameFromKey(roleKey) : 'Test Role';
  
  // Use default permissions if none specified
  const defaultPermissions = ['can-vote', 'can-rate', 'can-update-profile'];
  const rolePermissions = permissions ?? defaultPermissions;
  
  const created = await system.createRole(roleName, rolePermissions);

  const state = getRbacState(world);
  state.lastRole = { role: created, permissions: rolePermissions };
  if (roleKey) {
    // Store both the role and its permissions for future reference
    state.roles?.set(roleKey, { role: created, permissions: rolePermissions });
  }
  return created;
}

async function createUser(world: CustomWorld, userKey?: string) {
  const system = getSystemPersona(world);
  const username = userKey ?? `testuser-${Math.floor(Math.random() * 100000)}`;
  const user = await system.createUser({ username });

  const state = getRbacState(world);
  state.lastUser = user;
  if (userKey) {
    state.users?.set(userKey, user);
  }
  return user;
}

Given('a role {string} exists', async function (this: CustomWorld, roleKey: string) {
  await createRole(this, roleKey);
});

Given('a role exists', async function (this: CustomWorld) {
  await createRole(this);
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
  const state = getRbacState(this);
  state.lastRole = { role: role };
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

  const state = getRbacState(this);
  state.lastRole = { role: role };
});

Given('a user exists with the role assigned', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const user = await createUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

Given('a user exists with the role {string} assigned', async function (this: CustomWorld, roleIdentifier: string) {
  const system = getSystemPersona(this);
  
  // Try to get as system role first
  let role = await system.getRoleByStub(roleIdentifier);
  
  // If not found as system role, try as stored role key
  if (!role) {
    role = getStoreRole(this, roleIdentifier);
  }
  
  if (!role) {
    throw new Error(`Role not found: ${roleIdentifier} (neither system role nor stored role key)`);
  }
  
  const user = await createUser(this);
  await system.assignRoleToUser(user.id, role.id);
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
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  await system.setRolePermissions(role.id, parsePermissionList(permissions));
});

When('I hide the role', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  await system.updateRoleHiddenStatus(role.id, true);
});

When('I hide the role {string}', async function (this: CustomWorld, roleKey: string) {
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  await system.updateRoleHiddenStatus(role.id, true);
});

When('I rename the role to have display name {string}', async function (this: CustomWorld, displayName: string) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  await system.updateRoleDisplayName(role.id, displayName);
});

When('I rename the role to have display name {string} and hidden status {string}', async function (
  this: CustomWorld,
  displayName: string,
  hiddenStatus: string
) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  await system.updateRole(role.id, {
    displayName,
    isHidden: hiddenStatus.toLowerCase() === 'true'
  });
});

When('I duplicate the role {string} to create a new role {string}', async function (
  this: CustomWorld,
  sourceRoleKey: string,
  targetRoleKey: string
) {
  const sourceRole = getStoreRole(this, sourceRoleKey);
  const system = getSystemPersona(this);
  const duplicatedRoleId = await system.duplicateRole(sourceRole.id);
  const duplicated = await system.getRoleById(duplicatedRoleId);
  if (!duplicated) {
    throw new Error('Failed to retrieve duplicated role');
  }
  // Get the permissions of the duplicated role
  const duplicatedPermissions = await system.getRolePermissions(duplicated.id);
  const state = getRbacState(this);
  state.lastRole = { role: duplicated, permissions: duplicatedPermissions };
  state.roles?.set(targetRoleKey, { role: duplicated, permissions: duplicatedPermissions });
});

When('I attempt to delete the system role {string}', async function (this: CustomWorld, roleStub: string) {
  const system = getSystemPersona(this);
  const role = await system.getRoleByStub(roleStub);
  if (!role) {
    throw new Error(`Expected system role with stub ${roleStub} to exist`);
  }
  try {
    await system.deleteRole(role.id);
    getRbacState(this).deleteResult = { success: true };
  } catch (error) {
    getRbacState(this).deleteResult = { success: false, error };
  }
});

When('I delete the role', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  try {
    await system.deleteRole(role.id);
    getRbacState(this).deleteResult = { success: true };
  } catch (error) {
    getRbacState(this).deleteResult = { success: false, error };
  }
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

When('I create a role with the permissions {string}', async function (this: CustomWorld, permissions: string) {
  await createRole(this, undefined, parsePermissionList(permissions));
});

When('I update the role\'s permissions to be empty', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  await system.setRolePermissions(role.id, []);
});

When('I update the role\'s permissions to be {string}', async function (this: CustomWorld, permissions: string) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  await system.setRolePermissions(role.id, parsePermissionList(permissions));
});

When('I assign the role to the user', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  await system.assignRoleToUser(user.id, role.id);
});

When('I assign the role {string} to the user', async function (this: CustomWorld, roleKey: string) {
  const role = getStoreRole(this, roleKey);
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
    // Try to get as stored role key first
    let role = getStoreRole(this, roleKey);
    if (!role) {
      // Try to get as system role stub
      role = await system.getRoleByStub(roleKey);
    }
    if (role) {
      expectedRoleIds.push(role.id);
    } else {
      throw new Error(`Role not found: ${roleKey} (neither stored role key nor system role stub)`);
    }
  }
  
  expect(actualRoleIds.sort()).toEqual(expectedRoleIds.sort());
});

Then('the permissions for the user should be exactly {string}', async function (this: CustomWorld, expectedPermissions: string) {
  const user = getStoreUser(this);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getUserPermissions(user.id);
  expect(actualPermissions.sort()).toEqual(parsePermissionList(expectedPermissions).sort());
});

When('I attempt to delete the role', async function (this: CustomWorld) {
  const role = getStoreRole(this);
  const system = getSystemPersona(this);
  try {
    await system.deleteRole(role.id);
    getRbacState(this).deleteResult = { success: true };
  } catch (error) {
    getRbacState(this).deleteResult = { success: false, error };
  }
});

Then('deleting the role should fail', function (this: CustomWorld) {
  const state = getRbacState(this) as { deleteResult?: { success: boolean; error?: unknown } };
  expect(state.deleteResult).toBeDefined();
  expect(state.deleteResult?.success).toBe(false);
});

Then('deleting the role should succeed', function (this: CustomWorld) {
  const state = getRbacState(this) as { deleteResult?: { success: boolean; error?: unknown } };
  expect(state.deleteResult).toBeDefined();
  expect(state.deleteResult?.success).toBe(true);
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
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  const actualPermissions = await system.getRolePermissions(role.id);
  expect(actualPermissions.sort()).toEqual(parsePermissionList(permissions).sort());
});

Then('the role {string} should not be marked as a system role', async function (this: CustomWorld, roleKey: string) {
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.systemStub).toBeNull();
});

Then('the role {string} should not be marked as hidden', async function (this: CustomWorld, roleKey: string) {
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(false);
});

Then('the role {string} should have display name {string}', async function (this: CustomWorld, roleKey: string, displayName: string) {
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.displayName).toBe(displayName);
});

Then('the role {string} should be marked as hidden', async function (this: CustomWorld, roleKey: string) {
  const role = getStoreRole(this, roleKey);
  const system = getSystemPersona(this);
  const roleDetails = await system.getRoleById(role.id);
  expect(roleDetails).toBeTruthy();
  expect(roleDetails!.isHidden).toBe(true);
});
