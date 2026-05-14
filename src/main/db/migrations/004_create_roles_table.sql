/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

-- Migration: Create roles table (system_stub for system roles, display name, hidden status)
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_stub TEXT UNIQUE,  -- null for user-created roles, set for system roles
  display_name TEXT NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0,  -- 0=visible, 1=hidden (whether role is available for assignment)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_roles_system_stub ON roles(system_stub);
