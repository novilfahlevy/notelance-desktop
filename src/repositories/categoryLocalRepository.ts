// eslint-disable-next-line import/no-named-as-default
import sqlite3 from 'sqlite3'

import LocalDatabase from '../localDatabase'
import type { Category } from '../types/data-models'

export class CategoryLocalRepository {
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

  async get(): Promise<Category[]> {
    return await this._all<Category>(
      'SELECT * FROM categories WHERE is_deleted != 1 ORDER BY order_index ASC'
    )
  }

  async getByName(name: string): Promise<Category | undefined> {
    return await this._get<Category>(
      'SELECT * FROM categories WHERE LOWER(name) = LOWER(?) AND is_deleted != 1 LIMIT 1',
      [name.trim()]
    )
  }

  async getById(id: number): Promise<Category | undefined> {
    return await this._get<Category>(
      'SELECT * FROM categories WHERE id = ? AND is_deleted != 1 LIMIT 1',
      [id]
    )
  }

  async getByRemoteId(remoteId: number): Promise<Category | undefined> {
    return await this._get<Category>(
      'SELECT * FROM categories WHERE remote_id = ? AND is_deleted != 1 LIMIT 1',
      [remoteId]
    )
  }

  async create({
    name,
    orderIndex,
    remoteId,
  }: {
    name: string
    orderIndex?: number
    remoteId?: number
  }): Promise<Category> {
    const now = new Date().toUTCString()
    const order = orderIndex ?? (await this._getNextOrder())

    const sql = `
      INSERT INTO categories (name, order_index, remote_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `

    return new Promise((resolve, reject) => {
      this.db.run(sql, [name, order, remoteId, now, now], function (err) {
        if (err) return reject(err)
        resolve({
          id: this.lastID,
          name,
          order_index: order,
          remote_id: remoteId ?? null,
          created_at: now,
          updated_at: now,
          is_deleted: 0,
        } as Category)
      })
    })
  }

  private async _getNextOrder(): Promise<number> {
    const result = await this._get<{ next_order: number }>(
      'SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM categories'
    )
    return result?.next_order ?? 0
  }

  async update(
    id: number,
    {
      name,
      orderIndex,
      remoteId,
      isDeleted,
      createdAt,
      updatedAt,
    }: {
      name?: string
      orderIndex?: number
      remoteId?: number
      isDeleted?: number
      createdAt?: string
      updatedAt?: string
    }
  ): Promise<Category> {
    const updates: string[] = []
    const params: unknown[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (orderIndex !== undefined) {
      updates.push('order_index = ?')
      params.push(orderIndex)
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

    if (updates.length === 0) throw new Error('No fields to update.')

    const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`
    params.push(id)

    await this._run(sql, params)
    const updated = await this.getById(id)
    if (!updated) throw new Error('Category not found after update.')
    return updated
  }

  async renewOrders(categories: Category[]): Promise<void> {
    const now = new Date().toUTCString()

    await new Promise<void>((resolve, reject) => {
      this.db.serialize(() => {
        const stmt = this.db.prepare(
          'UPDATE categories SET order_index = ?, updated_at = ? WHERE id = ?'
        )

        try {
          categories.forEach((cat, i) => {
            stmt.run([i, now, cat.id])
          })
          stmt.finalize()
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  async delete(categoryId: number): Promise<void> {
    const now = new Date().toUTCString()

    // Detach notes
    await this._run(
      'UPDATE notes SET category_id = NULL, updated_at = ? WHERE category_id = ?',
      [now, categoryId]
    )

    // Soft delete category
    await this._run(
      'UPDATE categories SET is_deleted = 1, updated_at = ? WHERE id = ?',
      [now, categoryId]
    )
  }

  async hardDelete(id: number): Promise<void> {
    const now = new Date().toUTCString()

    await this._run(
      'UPDATE notes SET category_id = NULL, updated_at = ? WHERE category_id = ?',
      [now, id]
    )
    await this._run('DELETE FROM categories WHERE id = ?', [id])
  }

  async getWithTrashed(): Promise<Category[]> {
    return await this._all<Category>('SELECT * FROM categories WHERE is_deleted IN (0, 1)')
  }

  async getNotesCount(categoryId: number): Promise<number> {
    const result = await this._get<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes WHERE category_id = ? AND is_deleted != 1',
      [categoryId]
    )
    return result?.count ?? 0
  }
}
