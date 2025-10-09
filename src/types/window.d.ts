import { Note } from "./data-models"

export interface LocalDatabase {
  fetchNotes: () => Promise<Note[]>
}

declare global {
  interface Window {
    localDatabase: LocalDatabase
  }
}