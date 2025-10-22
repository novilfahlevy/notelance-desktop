// eslint-disable-next-line import/no-named-as-default
import sqlite3 from 'sqlite3'

import LocalDatabase from '../localDatabase'
import type { Note } from '../types/data-models'

export class NoteLocalRepository {
  private db: sqlite3.Database

  constructor() {
    this.db = LocalDatabase.load()
  }

  private _run(sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => (err ? reject(err) : resolve()))
    })
  }

  private _get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T)))
    })
  }

  private _all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows as T[])))
    })
  }

  // -----------------------
  // CRUD OPERATIONS
  // -----------------------

  async get(): Promise<Note[]> {
    return await this._all<Note>(
      'SELECT * FROM notes WHERE is_deleted != 1 ORDER BY updated_at DESC'
    )
  }

  async getById(id: number): Promise<Note | undefined> {
    return await this._get<Note>(
      'SELECT * FROM notes WHERE id = ? AND is_deleted != 1 LIMIT 1',
      [id]
    )
  }

  async getByRemoteId(remoteId: number): Promise<Note | undefined> {
    return await this._get<Note>(
      'SELECT * FROM notes WHERE remote_id = ? AND is_deleted != 1 LIMIT 1',
      [remoteId]
    )
  }

  async getByCategory(categoryId: number | null): Promise<Note[]> {
    if (categoryId === null) {
      return await this.get()
    }
    return await this._all<Note>(
      'SELECT * FROM notes WHERE category_id = ? AND is_deleted != 1 ORDER BY updated_at DESC',
      [categoryId]
    )
  }

  async getWithoutCategory(): Promise<Note[]> {
    return await this._all<Note>(
      'SELECT * FROM notes WHERE category_id IS NULL AND is_deleted != 1 ORDER BY updated_at DESC'
    )
  }

  async search(query: string): Promise<Note[]> {
    const searchTerm = `%${query}%`
    return await this._all<Note>(
      `SELECT * FROM notes 
       WHERE (title LIKE ? OR content LIKE ?) 
       AND is_deleted != 1 
       ORDER BY updated_at DESC`,
      [searchTerm, searchTerm]
    )
  }

  async create({
    title,
    content,
    categoryId,
    remoteId,
  }: {
    title: string
    content: string
    categoryId?: number | null
    remoteId?: number
  }): Promise<Note> {
    const now = new Date().toISOString()

    const sql = `
      INSERT INTO notes (title, content, category_id, remote_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    return new Promise((resolve, reject) => {
      this.db.run(
        sql,
        [title, content, categoryId ?? null, remoteId ?? null, now, now],
        function (err) {
          if (err) return reject(err)
          resolve({
            id: this.lastID,
            title,
            content,
            category_id: categoryId ?? null,
            remote_id: remoteId ?? null,
            created_at: now,
            updated_at: now,
            is_deleted: 0,
          } as Note)
        }
      )
    })
  }

  async update(
    id: number,
    {
      title,
      content,
      categoryId,
      remoteId,
      isDeleted,
      createdAt,
      updatedAt,
    }: {
      title?: string
      content?: string
      categoryId?: number | null
      remoteId?: number
      isDeleted?: number
      createdAt?: string
      updatedAt?: string
    }
  ): Promise<Note> {
    const updates: string[] = []
    const params: unknown[] = []

    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (content !== undefined) {
      updates.push('content = ?')
      params.push(content)
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?')
      params.push(categoryId)
    }
    if (remoteId !== undefined) {
      updates.push('remote_id = ?')
      params.push(remoteId)
    }
    if (isDeleted !== undefined) {
      updates.push('is_deleted = ?')
      params.push(isDeleted)
    }
    if (createdAt !== undefined) {
      updates.push('created_at = ?')
      params.push(createdAt)
    }
    if (updatedAt !== undefined) {
      updates.push('updated_at = ?')
      params.push(updatedAt)
    }

    // Always update the updated_at field
    if (updatedAt === undefined) {
      updates.push('updated_at = ?')
      params.push(new Date().toISOString())
    }

    if (updates.length === 0) throw new Error('No fields to update.')

    const sql = `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`
    params.push(id)

    await this._run(sql, params)
    const updated = await this.getById(id)
    if (!updated) throw new Error('Note not found after update.')
    return updated
  }

  async delete(noteId: number): Promise<void> {
    const now = new Date().toISOString()

    // Soft delete note
    await this._run(
      'UPDATE notes SET is_deleted = 1, updated_at = ? WHERE id = ?',
      [now, noteId]
    )
  }

  async hardDelete(id: number): Promise<void> {
    await this._run('DELETE FROM notes WHERE id = ?', [id])
  }

  async getWithTrashed(): Promise<Note[]> {
    return await this._all<Note>('SELECT * FROM notes WHERE is_deleted IN (0, 1)')
  }

  async countByCategory(categoryId: number | null): Promise<number> {
    if (categoryId === null) {
      const result = await this._get<{ count: number }>(
        'SELECT COUNT(*) as count FROM notes WHERE is_deleted != 1'
      )
      return result?.count ?? 0
    }

    const result = await this._get<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes WHERE category_id = ? AND is_deleted != 1',
      [categoryId]
    )
    return result?.count ?? 0
  }
}