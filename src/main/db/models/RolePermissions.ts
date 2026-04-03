/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type Database from 'better-sqlite3';
import type { PermissionStub } from '../../auth/permissions';

export interface RolePermissionRow {
  id: number;
  role_id: number;
  permission_stub: PermissionStub;
  created_at: string;
}

export interface Permission {
  id: number;
  stub: PermissionStub;
}

export default class RolePermissionsModel {
  private db: Database.Database;
  private insertStmt!: Database.Statement;
  private deleteStmt!: Database.Statement;
  private getByRoleStmt!: Database.Statement;
  private getByPermissionStmt!: Database.Statement;
  private deleteByRoleStmt!: Database.Statement;

  constructor(db: Database.Database) {
    this.db = db;
    this.initStatements();
  }

  private initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO role_permissions (role_id, permission_stub, created_at)
      VALUES (?, ?, ?)
    `);

    this.deleteStmt = this.db.prepare(`
      DELETE FROM role_permissions WHERE role_id = ? AND permission_stub = ?
    `);

    this.getByRoleStmt = this.db.prepare(`
      SELECT permission_stub FROM role_permissions WHERE role_id = ? ORDER BY permission_stub
    `);

    this.getByPermissionStmt = this.db.prepare(`
      SELECT role_id FROM role_permissions WHERE permission_stub = ? ORDER BY role_id
    `);

    this.deleteByRoleStmt = this.db.prepare(`
      DELETE FROM role_permissions WHERE role_id = ?
    `);
  }

  addPermission(roleId: number, permissionStub: PermissionStub): void {
    const now = new Date().toISOString();
    try {
      this.insertStmt.run(roleId, permissionStub, now);
    } catch (error) {
      // Ignore duplicate key errors (role already has this permission)
      if (!(error instanceof Error) || !error.message.includes('UNIQUE constraint failed')) {
        throw error;
      }
    }
  }

  removePermission(roleId: number, permissionStub: PermissionStub): void {
    this.deleteStmt.run(roleId, permissionStub);
  }

  getPermissionsForRole(roleId: number): Permission[] {
    const rows = this.getByRoleStmt.all(roleId) as RolePermissionRow[];
    return rows.map(row => ({
      id: row.id,
      stub: row.permission_stub
    }));
  }

  getRolesForPermission(permissionStub: PermissionStub): number[] {
    const rows = this.getByPermissionStmt.all(permissionStub) as Array<{ role_id: number }>;
    return rows.map(row => row.role_id);
  }

  setPermissionsForRole(roleId: number, permissionStubs: PermissionStub[]): void {
    const transaction = this.db.transaction(() => {
      // Remove all existing permissions for this role
      this.deleteByRoleStmt.run(roleId);

      // Add the new permissions
      const now = new Date().toISOString();
      for (const permissionStub of permissionStubs) {
        this.insertStmt.run(roleId, permissionStub, now);
      }
    });

    transaction();
  }
}