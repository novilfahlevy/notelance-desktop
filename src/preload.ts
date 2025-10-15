// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Category, Note } from './types/data-models'

contextBridge.exposeInMainWorld('localDatabase', {
  // ===== CATEGORIES =====
  async fetchCategories(): Promise<Category[]> {
    return await ipcRenderer.invoke('fetch-categories')
  },
  async addCategory(categoryName: string): Promise<Category> {
    return await ipcRenderer.invoke('add-category', categoryName)
  },
  async updateCategory(categoryId: number, categoryName: string): Promise<Category> {
    return await ipcRenderer.invoke('update-category', categoryId, categoryName)
  },
  async deleteCategory(categoryId: number): Promise<void> {
    return await ipcRenderer.invoke('delete-category', categoryId)
  },
  async reorderCategories(categories: Category[]): Promise<void> {
    return await ipcRenderer.invoke('reorder-categories', categories)
  },

  // ===== NOTES =====
  async fetchNotes(): Promise<Note[]> {
    return await ipcRenderer.invoke('fetch-notes')
  },
  async fetchNotesByCategory(categoryId: number | null): Promise<Note[]> {
    return await ipcRenderer.invoke('fetch-notes-by-category', categoryId)
  },
  async searchNotes(query: string): Promise<Note[]> {
    return await ipcRenderer.invoke('search-notes', query)
  },
  async getNote(noteId: number): Promise<Note | undefined> {
    return await ipcRenderer.invoke('get-note', noteId)
  },
  async createNote(noteData: { title: string; content: string; categoryId?: number | null }): Promise<Note> {
    return await ipcRenderer.invoke('create-note', noteData)
  },
  async updateNote(noteId: number, updates: { title?: string; content?: string; categoryId?: number | null }): Promise<Note> {
    return await ipcRenderer.invoke('update-note', noteId, updates)
  },
  async deleteNote(noteId: number): Promise<void> {
    return await ipcRenderer.invoke('delete-note', noteId)
  },
  async countNotesByCategory(categoryId: number | null): Promise<number> {
    return await ipcRenderer.invoke('count-notes-by-category', categoryId)
  }
})