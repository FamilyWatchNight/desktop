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
