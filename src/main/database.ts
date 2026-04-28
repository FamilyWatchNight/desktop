/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import MoviesModel from './db/models/Movies';
import UsersModel from './db/models/Users';
import UserProfilesModel from './db/models/UserProfiles';
import RolesModel from './db/models/Roles';
import RolePermissionsModel from './db/models/RolePermissions';
import UserRolesModel from './db/models/UserRoles';
import { getAppDataRoot } from './paths';
import i18n from './i18n';
import { DEFAULT_ROLES } from './auth/permissions';
import log from 'electron-log/main';

interface DbModels {
  movies: MoviesModel;
  users: UsersModel;
  userProfiles: UserProfilesModel;
  roles: RolesModel;
  rolePermissions: RolePermissionsModel;
  userRoles: UserRolesModel;
}

let db: Database.Database | null = null;
let models: DbModels | null = null;

function getSqliteDir(): string {
  return path.join(getAppDataRoot(), 'sqlite');
}

function runMigrations(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }

  const migrationsDir = path.join(__dirname, 'db', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    log.error('No migrations directory found');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    log.info(`Running migration: ${file}`);
    db.exec(sql);
  }
}

export function runSeed(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  const countResult = db.prepare('SELECT COUNT(*) as count FROM roles').get() as { count: number } | undefined;
  const currentCount = countResult?.count ?? 0;
  if (currentCount > 0) {
    return;
  }
  const now = new Date().toISOString();
  const insertRole = db.prepare(
    'INSERT INTO roles (system_stub, display_name, is_hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  );
  const insertRolePermission = db.prepare(
    'INSERT INTO role_permissions (role_id, permission_stub, created_at) VALUES (?, ?, ?)'
  );
  for (const role of DEFAULT_ROLES) {
    const translatedName = i18n.t(role.displayNameKey, { ns: 'auth' });
    insertRole.run(role.stub, translatedName, 0, now, now);
    const roleId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number } | undefined)?.id;
    if (typeof roleId !== 'number') {
      continue;
    }
    for (const stub of role.permissionStubs) {
      insertRolePermission.run(roleId, stub, now);
    }
  }
  log.info('Seeded default roles');
}

/**
 * Returns the current database instance. Used by test hooks so test-only logic
 * (e.g. roles-test-support) can run against the same db without living in this module.
 */
export function getDb(): Database.Database | null {
  return db;
}

export interface RoleDefinitionForTest {
  stub: string;
  displayName: string;
  permissionStubs: string[];
}

export interface RoleForTest {
  id: number;
  stub: string;
  displayName: string;
  permissionStubs: string[];
}

function initModels(): void {
  if (!db) {
    throw new Error('Database not initialized');
  }
  models = {
    movies: new MoviesModel(db as Database.Database),
    users: new UsersModel(db as Database.Database),
    userProfiles: new UserProfilesModel(db as Database.Database),
    roles: new RolesModel(db as Database.Database),
    rolePermissions: new RolePermissionsModel(db as Database.Database),
    userRoles: new UserRolesModel(db as Database.Database)
  };
}

export function initDatabase(): void {
  const sqliteDir = getSqliteDir();

  if (!fs.existsSync(sqliteDir)) {
    fs.mkdirSync(sqliteDir, { recursive: true });
  }

  const dbPath = path.join(sqliteDir, 'FamilyWatchNight.db');
  db = new Database(dbPath);
  runMigrations();
  runSeed();
  initModels();
}

export function initMockDatabase(testDb?: Database.Database | null): void {
  if (!testDb) {
    db = new Database(':memory:');
  } else {
    db = testDb;
  }
  runMigrations();
  runSeed();
  initModels();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    models = null;
  }
}

export function getModels(): DbModels {
  if (!models) {
    throw new Error('Database not initialized');
  }
  return models;
}

export function getStatus(): { dbInitialized: boolean; dbConnected: boolean } {
  return {
    dbInitialized: !!db,
    dbConnected: !!db
  };
}
