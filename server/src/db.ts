import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '../../spotitube.sqlite');

export const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDB();
    }
});

function initializeDB() {
    db.serialize(() => {
        // Table for storing overall stats
        db.run(`CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY,
            page_visits INTEGER DEFAULT 0,
            convert_again_count INTEGER DEFAULT 0,
            convert_playlist_count INTEGER DEFAULT 0
        )`, () => {
             db.run(`ALTER TABLE stats ADD COLUMN convert_playlist_count INTEGER DEFAULT 0`, () => {});
        });

        // Initialize stats row if empty
        db.get('SELECT id FROM stats WHERE id = 1', (err, row) => {
            if (!row) {
                db.run('INSERT INTO stats (id, page_visits, convert_again_count, convert_playlist_count) VALUES (1, 0, 0, 0)');
            }
        });

        // Table for storing conversions
        db.run(`CREATE TABLE IF NOT EXISTS conversions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            spotify_url TEXT NOT NULL,
            youtube_url TEXT,
            status TEXT DEFAULT 'LOADING',
            songs_converted TEXT,
            bonus_tracks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
             // Add columns safely if migrating from old schema
             db.run(`ALTER TABLE conversions ADD COLUMN songs_converted TEXT`, () => {});
             db.run(`ALTER TABLE conversions ADD COLUMN bonus_tracks TEXT`, () => {});
             db.run(`ALTER TABLE conversions ADD COLUMN user_id TEXT`, () => {});
        });
    });
}
