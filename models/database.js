const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '../data/travelers.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create travelers table
      db.run(`
        CREATE TABLE IF NOT EXISTS travelers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          status TEXT DEFAULT 'normal' CHECK(status IN ('normal', 'vip', 'complique')),
          internal_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Add first_name column if it doesn't exist (migration)
        db.run(`
          ALTER TABLE travelers ADD COLUMN first_name TEXT
        `, (err) => {
          // Ignore error if column already exists
          if (err && !err.message.includes('duplicate column name')) {
            console.warn('Migration warning:', err.message);
          }
        });

        // Create stays table for travel history
        db.run(`
          CREATE TABLE IF NOT EXISTS stays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            traveler_id INTEGER NOT NULL,
            check_in_date DATE NOT NULL,
            check_out_date DATE NOT NULL,
            booking_reference TEXT UNIQUE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (traveler_id) REFERENCES travelers (id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });

        // Create index for better performance
        db.run('CREATE INDEX IF NOT EXISTS idx_traveler_email ON travelers(email)');
        db.run('CREATE INDEX IF NOT EXISTS idx_stay_traveler ON stays(traveler_id)');
        db.run('CREATE INDEX IF NOT EXISTS idx_stay_booking_reference ON stays(booking_reference)');
      });
    });

    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='travelers'", (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initDatabase
}; 