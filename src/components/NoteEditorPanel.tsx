import { useEditor, EditorContent, Editor } from '@tiptap/react'
// eslint-disable-next-line import/no-named-as-default
import StarterKit from '@tiptap/starter-kit'
import TiptapUnderline from '@tiptap/extension-underline'
import TiptapLink from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Trash2,
  Save,
  Underline,
  LoaderCircle
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectSelectedNote, updateNote as updateNoteAction, deleteNote as deleteNoteAction } from '@/slices/notesSlice'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { showConfirmDialog } from '@/utils/confirmDialog'
import { decreaseGeneralNoteCount, decreaseCategoryNoteCount, selectCategories } from '@/slices/categoriesSlice'
import CategoriesSelector from '@/components/CategoriesSelector'

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Masukkan URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="border-b border-border-default flex gap-2 bg-surface items-center pr-3">
      <div className="flex gap-1 w-[400px] py-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('bold') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('italic') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('underline') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Underline"
        >
          <Underline size={18} />
        </button>

        <div className="w-px bg-border-default mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 }) ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 }) ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="w-px bg-border-default mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px bg-border-default mx-1" />
        
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-main transition-colors cursor-pointer ${
            editor.isActive('link') ? 'bg-main text-accent-400' : 'text-text-secondary'
          }`}
          title="Add Link"
        >
          <Link2 size={18} />
        </button>
      </div>
    </div>
  )
}

export default function NotesEditor() {
  const dispatch = useAppDispatch()
  const selectedNote = useAppSelector(selectSelectedNote)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [title, setTitle] = useState('')

  const categories = useAppSelector(selectCategories)
  const categoriesOptions = categories.map((category) => ({
    label: category.name,
    value: category.id.toString()
  }))

  categoriesOptions.unshift({ label: 'Umum', value: null })
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const handleSelectedCategoryId = (value: string) => {
    setSelectedCategoryId(parseInt(value))
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent-400 underline cursor-pointer hover:text-accent-300',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-full p-6',
      },
    },
  })

  useEffect(() => {
    if (editor && selectedNote) {
      editor.commands.setContent(selectedNote.content || '')
      setTitle(selectedNote.title || '')
      setSelectedCategoryId(selectedNote.category_id || null)
    }
  }, [selectedNote, editor])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNote, editor, title])

  const handleDelete = async () => {
    if (!selectedNote) return

    showConfirmDialog({
      title: 'Hapus Catatan',
      message: 'Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        setIsDeleting(true)
        try {
          await dispatch(deleteNoteAction(selectedNote.id)).unwrap()
          if (selectedCategoryId) {
            dispatch(decreaseCategoryNoteCount(selectedCategoryId))
          } else {
            dispatch(decreaseGeneralNoteCount())
          }
          toast.success('Catatan berhasil dihapus')
        } catch (error) {
          console.error('Gagal menghapus catatan:', error)
          toast.error('Gagal menghapus catatan')
        } finally {
          setIsDeleting(false)
        }
      }
    })
  }

  const handleSave = async () => {
    if (!selectedNote || !editor) return

    setIsSaving(true)
    try {
      const content = editor.getHTML()
      await dispatch(updateNoteAction({ 
        noteId: selectedNote.id, 
        updates: {
          title: title,
          content: content,
          categoryId: selectedCategoryId || null
        }
      })).unwrap()
      toast.success('Catatan berhasil disimpan')
    } catch (error) {
      console.error('Gagal menyimpan catatan:', error)
      toast.error('Gagal menyimpan catatan')
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedNote) {
    return (
      <div className="flex flex-col h-screen bg-main text-text-primary items-center justify-center">
        <p className="text-text-secondary text-lg">Pilih catatan untuk mulai mengedit</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-main text-text-primary">
      <div className="border-b border-border-default flex gap-2 bg-surface items-center p-3">
        {/* Dropdown kategori */}
        <CategoriesSelector
          options={categoriesOptions}
          onChange={handleSelectedCategoryId}
          defaultValue={selectedCategoryId?.toString()}
        />

        <div className="flex gap-2 ml-auto">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-2 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Hapus Catatan"
          >
            {isDeleting ? <LoaderCircle className="animate-spin" size={18} /> : <Trash2 size={18} />}
            <span className="text-sm font-medium">Hapus</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-2 rounded bg-accent-600 hover:bg-accent-700 text-main transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Simpan Catatan"
          >
            {isSaving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
            <span className="text-sm font-medium">Simpan</span>
          </button>
        </div>
      </div>

      <div className="border-b border-border-default bg-main px-6 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul catatan..."
          className="w-full bg-main text-2xl font-bold text-text-primary placeholder-text-secondary focus:outline-none"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <MenuBar editor={editor} />
    </div>
  )
}
