import { Note, Category } from './data-models'

export interface LocalDatabase {
  fetchNotes: () => Promise<Note[]>
  fetchCategories: () => Promise<Category[]>
  addCategory: (categoryName: string) => Promise<Category>
  updateCategory: (categoryId: number, categoryName: string) => Promise<Category>
  deleteCategory: (categoryId: number) => Promise<void>
  reorderCategories: (categories: Category[]) => Promise<void>
}

declare global {
  interface Window {
    localDatabase: LocalDatabase
  }
}