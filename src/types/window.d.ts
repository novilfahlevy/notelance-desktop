import { Note, Category } from './data-models'

export interface LocalDatabase {
  fetchNotes: () => Promise<Note[]>
  fetchCategories: () => Promise<Category[]>
}

declare global {
  interface Window {
    localDatabase: LocalDatabase
  }
}