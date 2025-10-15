import { Note, Category } from './data-models'

export interface LocalDatabase {
  // Categories
  fetchCategories: () => Promise<Category[]>
  addCategory: (categoryName: string) => Promise<Category>
  updateCategory: (categoryId: number, categoryName: string) => Promise<Category>
  deleteCategory: (categoryId: number) => Promise<void>
  reorderCategories: (categories: Category[]) => Promise<void>

  // Notes
  fetchNotes: () => Promise<Note[]>
  fetchNotesByCategory: (categoryId: number | null) => Promise<Note[]>
  searchNotes: (query: string) => Promise<Note[]>
  getNote: (noteId: number) => Promise<Note | undefined>
  createNote: (noteData: { title: string; content: string; categoryId?: number | null }) => Promise<Note>
  updateNote: (noteId: number, updates: { title?: string; content?: string; categoryId?: number | null }) => Promise<Note>
  deleteNote: (noteId: number) => Promise<void>
  countNotesByCategory: (categoryId: number | null) => Promise<number>
}

declare global {
  interface Window {
    localDatabase: LocalDatabase
  }
}