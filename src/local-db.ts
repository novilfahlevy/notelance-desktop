import path from 'path'
import { app } from 'electron'
import sqlite3 from 'sqlite3'

export class LocalDB {
  private static instance: sqlite3.Database | null = null

  /**
   * Initialize and load the SQLite database.
   * Creates tables and enables foreign keys.
   */
  static load(): sqlite3.Database {
    if (this.instance) return this.instance

    const dbPath = path.join(app.getPath('userData'), 'notelance.db')
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error connecting to database:', err.message)
      } else {
        console.log('✅ Connected to the SQLite database at', dbPath)
      }
    })

    db.serialize(() => {
      // Enforce foreign key constraints
      db.run('PRAGMA foreign_keys = ON', (error) => {
        if (error) console.error('PRAGMA foreign_keys error:', error.message)
      })

      // Create categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          remote_id INTEGER NULL,
          name TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_deleted INTEGER DEFAULT 0
        )
      `, (error) => {
        if (error) console.error('Error creating categories table:', error.message)
      })

      // Create notes table
      db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          remote_id INTEGER NULL,
          title TEXT NOT NULL,
          content TEXT,
          category_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_deleted INTEGER DEFAULT 0,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `, (error) => {
        if (error) console.error('Error creating notes table:', error.message)
      })
    })

    this.instance = db
    return db
  }
}
