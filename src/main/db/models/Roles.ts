/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type Database from 'better-sqlite3';

export interface RoleRow {
  id: number;
  system_stub: string | null;
  display_name: string;
  is_hidden: number; // 0 = visible, 1 = hidden
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  systemStub: string | null;
  displayName: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleData {
  systemStub?: string | null;
  displayName: string;
  isHidden?: boolean;
}

export default class RolesModel {
  private db: Database.Database;
  private insertStmt!: Database.Statement;
  private getByIdStmt!: Database.Statement;
  private getBySystemStubStmt!: Database.Statement;
  private getAllStmt!: Database.Statement;
  private updateStmt!: Database.Statement;
  private deleteStmt!: Database.Statement;

  constructor(db: Database.Database) {
    this.db = db;
    this.initStatements();
  }

  private initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO roles (system_stub, display_name, is_hidden, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    this.getByIdStmt = this.db.prepare('SELECT * FROM roles WHERE id = ?');
    this.getBySystemStubStmt = this.db.prepare('SELECT * FROM roles WHERE system_stub = ?');
    this.getAllStmt = this.db.prepare('SELECT * FROM roles ORDER BY display_name');
    this.updateStmt = this.db.prepare(`
      UPDATE roles SET system_stub = ?, display_name = ?, is_hidden = ?, updated_at = ? WHERE id = ?
    `);
    this.deleteStmt = this.db.prepare('DELETE FROM roles WHERE id = ?');
  }

  create(data: RoleData): number {
    const now = new Date().toISOString();
    const result = this.insertStmt.run(
      data.systemStub || null,
      data.displayName,
      data.isHidden ? 1 : 0,
      now,
      now
    );

    return Number(result.lastInsertRowid);
  }

  getById(id: number): Role | null {
    const row = this.getByIdStmt.get(id) as RoleRow | undefined;
    return row ? this.formatRole(row) : null;
  }

  getBySystemStub(systemStub: string): Role | null {
    const row = this.getBySystemStubStmt.get(systemStub) as RoleRow | undefined;
    return row ? this.formatRole(row) : null;
  }

  getAll(): Role[] {
    const rows = this.getAllStmt.all() as RoleRow[];
    return rows.map(row => this.formatRole(row));
  }

  update(id: number, data: Partial<RoleData>): void {
    this.db.exec('BEGIN EXCLUSIVE');
    
    try {
      // Fetch current role
      const current = this.getById(id);
      if (!current) {
        throw new Error('Role not found');
      }
      
      // Merge changes with current data
      const merged = {
        systemStub: data.systemStub !== undefined ? data.systemStub : current.systemStub,
        displayName: data.displayName !== undefined ? data.displayName : current.displayName,
        isHidden: data.isHidden !== undefined ? data.isHidden : current.isHidden
      };
      
      // Update with merged data
      const now = new Date().toISOString();
      this.updateStmt.run(
        merged.systemStub,
        merged.displayName,
        merged.isHidden ? 1 : 0,
        now,
        id
      );
      
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  delete(id: number): void {
    this.deleteStmt.run(id);
  }

  private formatRole(row: RoleRow): Role {
    return {
      id: row.id,
      systemStub: row.system_stub,
      displayName: row.display_name,
      isHidden: row.is_hidden === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}