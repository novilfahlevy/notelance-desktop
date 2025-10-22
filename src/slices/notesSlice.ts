import { RootState } from '@/app/store'
import { Note } from '@/types/data-models'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface NotesState {
  selectedNote: Note | null
  notes: Note[]
  searchQuery: string
  isSearching: boolean
  isLoading: boolean
  error: string | null
}

const initialState: NotesState = {
  selectedNote: null,
  notes: [],
  searchQuery: '',
  isSearching: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (categoryId: number | null | undefined) => {
    if (categoryId !== null && categoryId !== undefined) {
      return await window.localDatabase.fetchNotesByCategory(categoryId)
    }
    return await window.localDatabase.fetchNotesWithoutCategory()
  }
)

export const searchNotes = createAsyncThunk(
  'notes/searchNotes',
  async (query: string) => {
    return await window.localDatabase.searchNotes(query)
  }
)

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData: { title: string; content: string; categoryId?: number | null }) => {
    return await window.localDatabase.createNote(noteData)
  }
)

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ noteId, updates }: { noteId: number; updates: { title?: string; content?: string; categoryId?: number | null } }) => {
    return await window.localDatabase.updateNote(noteId, updates)
  }
)

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (noteId: number) => {
    await window.localDatabase.deleteNote(noteId)
    return noteId
  }
)

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote: (state: NotesState, action: PayloadAction<Note | null>) => {
      state.selectedNote = action.payload
    },
    setSearchQuery: (state: NotesState, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.isSearching = action.payload.trim() !== ''
    },
    clearSearch: (state: NotesState) => {
      state.searchQuery = ''
      state.isSearching = false
    },
    clearError: (state: NotesState) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch notes
    builder.addCase(fetchNotes.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchNotes.fulfilled, (state, action) => {
      state.isLoading = false
      state.notes = action.payload
    })
    builder.addCase(fetchNotes.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to fetch notes'
    })

    // Search notes
    builder.addCase(searchNotes.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(searchNotes.fulfilled, (state, action) => {
      state.isLoading = false
      state.notes = action.payload
    })
    builder.addCase(searchNotes.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to search notes'
    })

    // Create note
    builder.addCase(createNote.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(createNote.fulfilled, (state, action) => {
      state.isLoading = false
      state.notes = [action.payload, ...state.notes]
      state.selectedNote = action.payload
    })
    builder.addCase(createNote.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to create note'
    })

    // Update note
    builder.addCase(updateNote.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateNote.fulfilled, (state, action) => {
      state.isLoading = false
      const index = state.notes.findIndex(note => note.id === action.payload.id)
      if (index !== -1) {
        state.notes[index] = action.payload
      }
      if (state.selectedNote?.id === action.payload.id) {
        state.selectedNote = action.payload
      }
    })
    builder.addCase(updateNote.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to update note'
    })

    // Delete note
    builder.addCase(deleteNote.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      state.isLoading = false
      state.notes = state.notes.filter(note => note.id !== action.payload)
      if (state.selectedNote?.id === action.payload) {
        state.selectedNote = null
      }
    })
    builder.addCase(deleteNote.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message || 'Failed to delete note'
    })
  },
})

// Selectors
export const selectSelectedNote = (state: RootState) => state.notes.selectedNote
export const selectNotes = (state: RootState) => state.notes.notes
export const selectSearchQuery = (state: RootState) => state.notes.searchQuery
export const selectIsSearching = (state: RootState) => state.notes.isSearching
export const selectIsLoading = (state: RootState) => state.notes.isLoading
export const selectError = (state: RootState) => state.notes.error

export const { setSelectedNote, setSearchQuery, clearSearch, clearError } = notesSlice.actions

export default notesSlice.reducer