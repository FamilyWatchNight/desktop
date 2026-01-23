const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');
const packageJson = require('../package.json');

// Get platform-specific app data directory
function getAppDataDir() {
  const appName = packageJson.name;
  
  if (process.platform === 'win32') {
    // Windows: %APPDATA%\FamFilmFav
    return path.join(process.env.APPDATA, appName, 'sqlite');
  } else if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/FamFilmFav
    return path.join(os.homedir(), 'Library', 'Application Support', appName, 'sqlite');
  } else {
    // Linux: ~/.config/FamFilmFav
    return path.join(os.homedir(), '.config', appName, 'sqlite');
  }
}

let db = null;

function initDatabase() {
  const appDataDir = getAppDataDir();
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }
  
  const dbPath = path.join(appDataDir, 'famfilmfav.db');
  
  // Open or create database
  db = new Database(dbPath);
  
  // Create settings table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function saveSettings(settings) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const insertStmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `);
  
  try {
    // Start a transaction for atomic writes
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        insertStmt.run(key, JSON.stringify(value));
      }
    });
    
    transaction();
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }
}

function loadSettings() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all();
    
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        // If JSON parsing fails, store as string
        settings[row.key] = row.value;
      }
    });
    
    return settings;
  } catch (error) {
    throw new Error(`Failed to load settings: ${error.message}`);
  }
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  saveSettings,
  loadSettings,
  closeDatabase
};
