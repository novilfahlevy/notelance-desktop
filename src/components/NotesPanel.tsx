import { ReactElement, useEffect, useState } from 'react'
import { Clock, Search, FileText, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { Note } from '@/types/data-models'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { 
  setSelectedNote, 
  fetchNotes, 
  searchNotes as searchNotesAction,
  createNote as createNoteAction,
  setSearchQuery,
  selectNotes,
  selectSearchQuery,
  selectIsSearching,
  selectIsLoading,
  clearSearch
} from '@/slices/notesSlice'
import { SyncResult } from '@/synchronization'
import { increaseGeneralNoteCount, increaseCategoryNoteCount } from '@/slices/categoriesSlice'

export function NotesPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const notes = useAppSelector(selectNotes)
  const searchQuery = useAppSelector(selectSearchQuery)
  const isSearching = useAppSelector(selectIsSearching)
  const isLoading = useAppSelector(selectIsLoading)
  const selectedCategory = useAppSelector((state) => state.categories.selectedCategory)

  const [isSyncing, setIsSyncing] = useState(false)

  const handleSelectNote = (note: Note) => {
    dispatch(setSelectedNote(note))
  }

  const handleCreateNote = async () => {
    dispatch(createNoteAction({
      title: 'Untitled Note',
      content: '',
      categoryId: selectedCategory?.id ?? null,
    }))
    if (selectedCategory) {
      dispatch(increaseCategoryNoteCount(selectedCategory.id))
    } else {
      dispatch(increaseGeneralNoteCount())
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)

    try {
      const result: SyncResult = await window.localDatabase.syncWithRemote()

      if (result.status === 'success') {
        toast.success('Sinkronisasi berhasil!', {
          position: 'top-left',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
          closeButton: true,
          icon: <CheckCircle size={20} />,
        })
        
        // Refresh data after successful sync
        dispatch(fetchNotes(selectedCategory?.id))
      } else {
        toast.success(result.error || 'Sinkronisasi gagal', {
          position: 'top-left',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
          icon: <XCircle size={20} />,
        })
      }
    } catch (error) {
      toast.success(error instanceof Error ? error.message : 'Terjadi kesalahan', {
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
        icon: <XCircle size={20} />,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    dispatch(fetchNotes(selectedCategory?.id))
  }, [dispatch, selectedCategory])

  const handleSearch = async (query: string) => {
    dispatch(setSearchQuery(query))
    
    if (query.trim() === '') {
      dispatch(clearSearch())
      dispatch(fetchNotes(selectedCategory?.id))
      return
    }

    dispatch(searchNotesAction(query.trim()))
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

  return (
    <div className="w-full pb-40">
      {/* Header with Search and Buttons */}
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

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing || isLoading}
          className="flex items-center gap-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Sinkronkan dengan server"
        >
          <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          Sinkron
        </button>

        {/* Create Note Button */}
        <button
          onClick={handleCreateNote}
          disabled={isLoading}
          className="flex items-center gap-x-2 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        )}

        {/* Notes List */}
        {!isLoading && notes.length === 0 ? (
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
        ) : !isLoading ? (
          <ul className="flex flex-col gap-y-5">
            {notes.map((note: Note) => (
              <li
                key={note.id}
                className="bg-main rounded-lg p-4 border border-border-default hover:border-accent-500 transition-all cursor-pointer"
                onClick={() => handleSelectNote(note)}
              >
                <h4 className="text-white text-lg font-semibold mb-2">
                  {note.title || 'Untitled'}
                </h4>
                <div 
                  className="text-text-secondary text-sm line-clamp-3 mb-3 prose-preview"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                <span className="text-text-muted text-xs flex items-center gap-x-1">
                  <Clock size={12} /> {formatTimeAgo(note.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <style>{`
        .prose-preview {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .prose-preview h1,
        .prose-preview h2,
        .prose-preview h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .prose-preview p {
          margin: 0;
          line-height: 1.5;
        }

        .prose-preview ul,
        .prose-preview ol {
          margin: 0;
          padding-left: 1.25rem;
          line-height: 1.5;
        }

        .prose-preview li {
          margin: 0;
        }

        .prose-preview strong {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
        }

        .prose-preview em {
          font-style: italic;
        }

        .prose-preview a {
          color: #ffca28;
          text-decoration: none;
        }

        .prose-preview * {
          display: inline;
        }

        .prose-preview br {
          display: none;
        }

        .prose-preview h1::after,
        .prose-preview h2::after,
        .prose-preview h3::after,
        .prose-preview p::after,
        .prose-preview li::after {
          content: ' ';
        }
      `}</style>
    </div>
  )
}