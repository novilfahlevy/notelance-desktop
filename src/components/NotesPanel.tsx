import { ReactElement, useEffect, useState } from 'react'
import { Clock, Search, FileText, Plus } from 'lucide-react'
import { Note } from '@/types/data-models'
import { useAppSelector } from '@/app/hooks'

export function NotesPanel(): ReactElement {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  
  const selectedCategory = useAppSelector((state) => state.categories.selectedCategory)

  const handleCreateNote = async () => {
    const newNote = await window.localDatabase.createNote({
      title: 'Untitled Note',
      content: '',
      categoryId: selectedCategory?.id ?? null,
    })
    setNotes([newNote, ...notes])
  }

  useEffect(() => {
    fetchNotes()
  }, [selectedCategory])

  const fetchNotes = async () => {
    if (selectedCategory) {
      const fetchedNotes = await window.localDatabase.fetchNotesByCategory(selectedCategory.id)
      setNotes(fetchedNotes)
    } else {
      const fetchedNotes = await window.localDatabase.fetchNotes()
      setNotes(fetchedNotes)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.trim() === '') {
      setIsSearching(false)
      fetchNotes()
      return
    }

    setIsSearching(true)
    const searchResults = await window.localDatabase.searchNotes(query.trim())
    setNotes(searchResults)
  }

  const formatTimeAgo = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'Unknown'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  const truncateContent = (content: string, maxLength = 150): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="w-full pb-40">
      {/* Header with Search and Create Button */}
      <div className="flex items-center gap-x-3 sticky top-0 bg-surface p-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            placeholder="Cari catatan..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-main border border-border-default rounded-md w-full text-white placeholder-text-muted outline-none pl-10 pr-4 py-2 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Create Note Button */}
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-x-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap font-medium cursor-pointer"
        >
          <Plus size={18} />
          Buat Catatan
        </button>
      </div>

      <div className="px-6">
        {/* Category/Search Info */}
        {(selectedCategory || isSearching) && (
          <div className="mb-4 text-sm text-text-muted">
            {isSearching ? (
              <span>
                Hasil pencarian untuk "{searchQuery}" ({notes.length} catatan)
              </span>
            ) : (
              <span>
                <span className="text-accent-400">{selectedCategory?.name}</span> ({notes.length} catatan)
              </span>
            )}
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText size={48} className="text-text-muted mb-4" />
            <p className="text-text-muted text-lg mb-2">
              {isSearching ? 'Tidak ada catatan ditemukan' : 'Belum ada catatan'}
            </p>
            <p className="text-text-muted text-sm">
              {isSearching 
                ? 'Coba gunakan kata kunci yang berbeda' 
                : 'Mulai buat catatan pertamamu'}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-y-5">
            {notes.map((note) => (
              <li
                key={note.id}
                className="bg-main rounded-lg p-4 border border-border-default hover:border-accent-500 transition-all cursor-pointer"
              >
                <h4 className="text-white text-lg font-semibold mb-2">
                  {note.title || 'Untitled'}
                </h4>
                <p className="text-text-secondary text-sm line-clamp-3 mb-3">
                  {truncateContent(note.content)}
                </p>
                <span className="text-text-muted text-xs flex items-center gap-x-1">
                  <Clock size={12} /> {formatTimeAgo(note.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}