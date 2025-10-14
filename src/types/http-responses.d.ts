import { Note } from './data-models'

export interface FetchNotesResponse {
    message: string
    total_notes: number
    notes: Note[]
}