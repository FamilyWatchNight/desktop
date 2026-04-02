/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

/**
 * Permission stubs and display names. Permissions are defined only in code;
 * the database stores permission stubs on role_permissions.
 */
export const PERMISSIONS = [
  { stub: 'can-host', displayNameKey: 'permissions.canHost' },
  { stub: 'can-vote', displayNameKey: 'permissions.canVote' },
  { stub: 'can-rate', displayNameKey: 'permissions.canRate' },
  { stub: 'can-manage-users', displayNameKey: 'permissions.canManageUsers' },
  { stub: 'can-update-profile', displayNameKey: 'permissions.canUpdateProfile' },
  { stub: 'can-hide-show', displayNameKey: 'permissions.canHideShow' },
  { stub: 'can-unhide-show', displayNameKey: 'permissions.canUnhideShow' },
  { stub: 'can-update-show', displayNameKey: 'permissions.canUpdateShow' },
  { stub: 'can-admin', displayNameKey: 'permissions.canAdmin' }
] as const;

export type PermissionStub = (typeof PERMISSIONS)[number]['stub'];

export const PERMISSION_STUBS: readonly PermissionStub[] = PERMISSIONS.map((p) => p.stub);

/**
 * Default roles and their permission stubs. Inserted at startup when no roles exist.
 */
export const DEFAULT_ROLES: ReadonlyArray<{
  stub: string;
  displayNameKey: string;
  permissionStubs: readonly PermissionStub[];
}> = [
  { stub: 'admin', displayNameKey: 'roles.administrator', permissionStubs: ['can-admin'] },
  {
    stub: 'influencer',
    displayNameKey: 'roles.influencer',
    permissionStubs: [
      'can-host',
      'can-vote',
      'can-rate',
      'can-update-profile',
      'can-hide-show',
      'can-update-show'
    ]
  },
  { stub: 'host', displayNameKey: 'roles.host', permissionStubs: ['can-host'] }
];
