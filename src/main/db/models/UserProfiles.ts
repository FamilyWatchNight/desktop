/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import type Database from 'better-sqlite3';

export interface UserProfileRow {
  id: number;
  user_id: number;
  display_name: string | null;
  profile_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  displayName: string | null;
  profileImagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileData {
  displayName?: string | null;
  profileImagePath?: string | null;
}

export default class UserProfilesModel {
  private db: Database.Database;
  private insertStmt!: Database.Statement;
  private getByUserIdStmt!: Database.Statement;
  private updateStmt!: Database.Statement;

  constructor(db: Database.Database) {
    this.db = db;
    this.initStatements();
  }

  private initStatements(): void {
    this.insertStmt = this.db.prepare(`
      INSERT INTO user_profiles (user_id, display_name, profile_image_path, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    this.getByUserIdStmt = this.db.prepare('SELECT * FROM user_profiles WHERE user_id = ?');

    this.updateStmt = this.db.prepare(`
      UPDATE user_profiles SET display_name = ?, profile_image_path = ?, updated_at = ? WHERE user_id = ?
    `);
  }

  create(userId: number, data: UserProfileData = {}): number {
    const now = new Date().toISOString();

    const result = this.insertStmt.run(
      userId,
      data.displayName || null,
      data.profileImagePath || null,
      now,
      now
    );

    return Number(result.lastInsertRowid);
  }

  getByUserId(userId: number): UserProfile | null {
    const row = this.getByUserIdStmt.get(userId) as UserProfileRow | undefined;
    return row ? this.formatUserProfile(row) : null;
  }

  update(userId: number, data: UserProfileData): void {
    this.db.exec('BEGIN EXCLUSIVE');
    
    try {
      // Fetch current profile
      const current = this.getByUserId(userId);
      if (!current) {
        throw new Error('User profile not found');
      }
      
      // Merge changes with current data
      const merged = {
        displayName: data.displayName !== undefined ? data.displayName : current.displayName,
        profileImagePath: data.profileImagePath !== undefined ? data.profileImagePath : current.profileImagePath
      };
      
      // Update with merged data
      const now = new Date().toISOString();
      this.updateStmt.run(
        merged.displayName,
        merged.profileImagePath,
        now,
        userId
      );
      
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  private formatUserProfile(row: UserProfileRow): UserProfile {
    return {
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      profileImagePath: row.profile_image_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}