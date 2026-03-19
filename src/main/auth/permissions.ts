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
  { stub: 'can-host', displayName: 'Can Host Watch Night' },
  { stub: 'can-vote', displayName: 'Can Vote on Upcoming' },
  { stub: 'can-rate', displayName: 'Can Rate Watched' },
  { stub: 'can-manage-users', displayName: 'Can Manage Members' },
  { stub: 'can-update-profile', displayName: 'Can Update Own Profile' },
  { stub: 'can-hide-show', displayName: 'Can Hide Show' },
  { stub: 'can-unhide-show', displayName: 'Can Unhide Show' },
  { stub: 'can-update-show', displayName: 'Can Update Show Information' },
  { stub: 'can-admin', displayName: 'Can Administrate Application' }
] as const;

export type PermissionStub = (typeof PERMISSIONS)[number]['stub'];

export const PERMISSION_STUBS: readonly PermissionStub[] = PERMISSIONS.map((p) => p.stub);

/**
 * Default roles and their permission stubs. Inserted at startup when no roles exist.
 */
export const DEFAULT_ROLES: ReadonlyArray<{
  stub: string;
  displayName: string;
  permissionStubs: readonly PermissionStub[];
}> = [
  { stub: 'admin', displayName: 'Administrator', permissionStubs: ['can-admin'] },
  {
    stub: 'influencer',
    displayName: 'Influencer',
    permissionStubs: [
      'can-host',
      'can-vote',
      'can-rate',
      'can-update-profile',
      'can-hide-show',
      'can-update-show'
    ]
  },
  { stub: 'host', displayName: 'Host', permissionStubs: ['can-host'] }
];
