import { RootState } from '@/app/store'
import { Note } from '@/types/data-models'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NotesState {
  selectedNote: Note | null
}

const initialState: NotesState = {
  selectedNote: null,
}

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote: (state: NotesState, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload
    }
  },
})

export const selectSelectedNote = (state: RootState) => state.notes.selectedNote

export const { setSelectedNote } = notesSlice.actions

export default notesSlice.reducer