/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type Database from 'better-sqlite3';

export interface UserRoleRow {
  id: number;
  user_id: number;
  role_id: number;
  created_at: string;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  createdAt: string;
}

export default class UserRolesModel {
  private db: Database.Database;
  private insertStmt!: Database.Statement;
  private getByUserIdStmt!: Database.Statement;
  private getByRoleIdStmt!: Database.Statement;
  private getByUserAndRoleStmt!: Database.Statement;
  private deleteByUserAndRoleStmt!: Database.Statement;

  constructor(db: Database.Database) {
    this.db = db;
    this.initStatements();
  }

  private initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO user_roles (user_id, role_id, created_at)
      VALUES (?, ?, ?)
    `);

    this.getByUserIdStmt = this.db.prepare('SELECT * FROM user_roles WHERE user_id = ?');
    this.getByRoleIdStmt = this.db.prepare('SELECT * FROM user_roles WHERE role_id = ?');
    this.getByUserAndRoleStmt = this.db.prepare('SELECT * FROM user_roles WHERE user_id = ? AND role_id = ?');
    this.deleteByUserAndRoleStmt = this.db.prepare('DELETE FROM user_roles WHERE user_id = ? AND role_id = ?');
  }

  assignRoleToUser(userId: number, roleId: number): void {
    // Check if assignment already exists
    const existing = this.getByUserAndRoleStmt.get(userId, roleId) as UserRoleRow | undefined;
    if (existing) {
      return; // Already assigned
    }

    const now = new Date().toISOString();
    this.insertStmt.run(userId, roleId, now);
  }

  removeRoleFromUser(userId: number, roleId: number): void {
    this.deleteByUserAndRoleStmt.run(userId, roleId);
  }

  getRolesForUser(userId: number): UserRole[] {
    const rows = this.getByUserIdStmt.all(userId) as UserRoleRow[];
    return rows.map(row => this.formatUserRole(row));
  }

  getUsersByRoleId(roleId: number): number[] {
    const rows = this.getByRoleIdStmt.all(roleId) as UserRoleRow[];
    return rows.map(row => row.user_id);
  }

  hasRole(userId: number, roleId: number): boolean {
    const row = this.getByUserAndRoleStmt.get(userId, roleId) as UserRoleRow | undefined;
    return !!row;
  }

  private formatUserRole(row: UserRoleRow): UserRole {
    return {
      id: row.id,
      userId: row.user_id,
      roleId: row.role_id,
      createdAt: row.created_at
    };
  }
}