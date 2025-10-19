import { type ReactElement } from 'react'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'

import './index.css'

import { NotesPanel } from './components/NotesPanel'
import CategoriesPanel from '@/components/CategoriesPanel'
import NotesEditorPanel from './components/NoteEditorPanel'
import { useAppSelector } from './app/hooks'
import { selectSelectedNote } from './slices/notesSlice'
import { Note } from './types/data-models'
import { ToastContainer } from 'react-toastify'

export default function App(): ReactElement {
  const selectedNote: Note = useAppSelector(selectSelectedNote)
  return (
    <div className="min-h-screen max-h-screen h-screen flex bg-main text-white">
      <ToastContainer position="bottom-right" />

      {/* Categories Sidebar */}
      <CategoriesPanel />

      {/* Notes List */}
      <main className="border-r border-border-default bg-surface flex-1 transition-all duration-300 overflow-y-scroll">
        <NotesPanel />
      </main>

      {/* Editor Area */}
      <section className="flex-1 bg-main hidden lg:block">
        {selectedNote ? (
          <NotesEditorPanel />
        ) : (
          <div className="flex items-center justify-center h-full text-muted">
            Pilih catatan untuk melihat detailnya
          </div>
        )}
      </section>
    </div>
  )
}
