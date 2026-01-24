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
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  closeDatabase
};
