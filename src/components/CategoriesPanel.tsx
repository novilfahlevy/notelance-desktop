import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { Category } from '@/types/data-models'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import { 
  setSelectedCategory,
  fetchCategories,
  addCategory as addCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
  reorderCategories as reorderCategoriesAction,
  selectCategories,
  updateCategoriesOrder
} from '@/slices/categoriesSlice'
import { showConfirmDialog } from '@/utils/confirmDialog'
import { toast } from 'react-toastify'

import {
  Tag,
  Notebook,
  PanelRightOpen,
  PanelLeftOpen,
  Tags,
  Trash,
  Pencil,
  GripVertical,
  Plus,
  CheckSquare,
  X,
  Check,
} from 'lucide-react'

export default function CategoriesPanel(): ReactElement {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const [generalNotesCount, setGeneralNotesCount] = useState<number>(0)

  const [isCategoriesPanelOpen, openCategoriesPanel] = useState<boolean>(true)
  const toggleCategoriesPanel = () => openCategoriesPanel(!isCategoriesPanelOpen)

  const [isManaging, setIsManaging] = useState<boolean>(false)
  const handleToggleManageCategories = () => {
    setIsManaging(!isManaging)
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isWindowSmallerThanLg, setIfWindowSmallerThanLg] = useState<boolean>(false)

  // Edit state
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState<string>('')

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= 1024

      setIfWindowSmallerThanLg((prevIsSmall) => {
        if (isSmall && !prevIsSmall) {
          openCategoriesPanel(false)
          return true
        } else if (!isSmall && prevIsSmall) {
          openCategoriesPanel(true)
          return false
        }
        return prevIsSmall
      })
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const getGeneralNotesCount = async () => {
      const counts = await window.localDatabase.fetchGeneralNotesCount()
      console.log(counts)
      setGeneralNotesCount(counts)
    }

    getGeneralNotesCount()
  }, [])

  const handleSelectCategory = (category: Category | null) => {
    dispatch(setSelectedCategory(category))
  }

  // Create new category
  const [newCategoryName, setNewCategoryName] = useState<string>('')
  const handleChangeCategoryName = (event: SyntheticEvent) => {
    setNewCategoryName((event.target as HTMLInputElement).value)
  }
  const handleSubmitNewCategory = async (event: SyntheticEvent) => {
    event.preventDefault()
    if (!newCategoryName.trim()) return
    
    try {
      await dispatch(addCategoryAction(newCategoryName.trim())).unwrap()
      setNewCategoryName('')
      toast.success('Kategori berhasil ditambahkan')
    } catch (error) {
      console.error('Failed to add category:', error)
      toast.error('Gagal menambahkan kategori')
    }
  }

  // Edit category
  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const handleSaveEdit = async (categoryId: number) => {
    if (!editingCategoryName.trim()) return
    
    try {
      await dispatch(updateCategoryAction({ 
        categoryId, 
        categoryName: editingCategoryName.trim() 
      })).unwrap()
      setEditingCategoryId(null)
      setEditingCategoryName('')
      toast.success('Kategori berhasil diperbarui')
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error('Gagal memperbarui kategori')
    }
  }

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    showConfirmDialog({
      title: 'Hapus Kategori',
      message: 'Apakah Anda yakin ingin menghapus kategori ini? Catatan di dalamnya tidak akan terhapus.',
      confirmLabel: 'Hapus',
      cancelLabel: 'Batal',
      onConfirm: async () => {
        try {
          await dispatch(deleteCategoryAction(categoryId)).unwrap()
          toast.success('Kategori berhasil dihapus')
        } catch (error) {
          console.error('Failed to delete category:', error)
          toast.error('Gagal menghapus kategori')
        }
      }
    })
  }

  // Drag and drop handlers
  const handleDragStart = (category: Category) => {
    setDraggedCategory(category)
  }

  const handleDragOver = (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault()
    
    if (!draggedCategory || draggedCategory.id === targetCategory.id) return

    const draggedIndex = categories.findIndex(cat => cat.id === draggedCategory.id)
    const targetIndex = categories.findIndex(cat => cat.id === targetCategory.id)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newCategories = [...categories]
    newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, draggedCategory)

    dispatch(updateCategoriesOrder(newCategories))
  }

  const handleDragEnd = async () => {
    if (draggedCategory) {
      try {
        await dispatch(reorderCategoriesAction(categories)).unwrap()
        setDraggedCategory(null)
      } catch (error) {
        console.error('Failed to reorder categories:', error)
        toast.error('Gagal menyimpan urutan kategori')
      }
    }
  }

  return (
    <aside
      className={`border-r border-border-default bg-surface transition-all duration-300 flex flex-col justify-between
        ${isCategoriesPanelOpen ? 'w-[260px] px-5' : 'w-[80px] px-3'} py-5`}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center ${isCategoriesPanelOpen ? 'justify-between' : 'justify-center'} mb-10`}
        >
          {isCategoriesPanelOpen && (
            <h1 className="font-bold text-xl text-primary-500 tracking-tight select-none">
              Notelance
            </h1>
          )}
          <button
            onClick={toggleCategoriesPanel}
            className="text-text-muted hover:text-accent-500 transition-colors cursor-pointer outline-0"
          >
            {isCategoriesPanelOpen ? (
              <PanelRightOpen size={22} />
            ) : (
              <PanelLeftOpen size={22} />
            )}
          </button>
        </div>

        {/* Categories List */}
        <ul className="flex flex-col gap-y-2">
          {/* "Semua" category (static) */}
          <li
            onClick={() => handleSelectCategory(null)}
            className={`flex items-center ${
              isCategoriesPanelOpen ? 'justify-between' : 'justify-center'
            } rounded-lg cursor-pointer p-3 hover:bg-accent-800/20 transition-all duration-150 select-none`}
          >
            <div className="flex items-center gap-x-3">
              <Notebook className="text-accent-500" size={20} />
              {isCategoriesPanelOpen && <p className="text-base">Umum</p>}
            </div>
            {isCategoriesPanelOpen && (
              <span className="text-accent-300 text-sm">{generalNotesCount}</span>
            )}
          </li>

          {/* Dynamic categories */}
          {categories.length > 0 &&
            categories.map((category: Category) => (
              <li
                key={category.id}
                draggable={isManaging && editingCategoryId !== category.id}
                onDragStart={() => handleDragStart(category)}
                onDragOver={(e) => handleDragOver(e, category)}
                onDragEnd={handleDragEnd}
                onClick={() => !isManaging && handleSelectCategory(category)}
                className={`flex items-center ${
                  isCategoriesPanelOpen ? 'justify-between' : 'justify-center'
                } rounded-lg cursor-pointer p-3 hover:bg-accent-800/20 transition-all duration-150 select-none group
                ${draggedCategory?.id === category.id ? 'opacity-50' : ''}`}
              >
                {editingCategoryId === category.id ? (
                  // Edit mode
                  <div className="flex items-center gap-x-2 flex-1">
                    <Tag className="text-accent-400" size={18} />
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(category.id)
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      className="w-full bg-transparent border-b border-accent-500 outline-none text-base px-1"
                      autoFocus
                    />
                    <div className="flex items-center gap-x-1">
                      <button
                        onClick={() => handleSaveEdit(category.id)}
                        className="text-green-500 hover:text-green-400 p-1"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-500 hover:text-red-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-x-3">
                      <Tag className="text-accent-400" size={18} />
                      {isCategoriesPanelOpen && (
                        <p className="text-base">{category.name}</p>
                      )}
                    </div>

                    {/* Management buttons */}
                    {isCategoriesPanelOpen && isManaging ? (
                      <div className="flex items-center gap-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(category)
                          }}
                        >
                          <Pencil
                            size={16}
                            className="text-text-muted cursor-pointer hover:text-accent-400"
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCategory(category.id)
                          }}
                        >
                          <Trash
                            size={16}
                            className="text-text-muted cursor-pointer hover:text-red-500"
                          />
                        </button>
                        <div className="cursor-grab hover:cursor-grabbing">
                          <GripVertical
                            size={16}
                            className="text-text-muted hover:text-accent-400"
                          />
                        </div>
                      </div>
                    ) : (
                      isCategoriesPanelOpen && (
                        <span className="text-accent-300 text-sm">{category.notes_count}</span>
                      )
                    )}
                  </>
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="flex flex-col gap-y-3">
        {isCategoriesPanelOpen && isManaging && (
          <form onSubmit={handleSubmitNewCategory} className="flex items-center w-full border border-border-default rounded-md overflow-hidden focus-within:border-accent-500 transition-all">
            <input
              type="text"
              placeholder="Tambah Kategori"
              value={newCategoryName}
              onChange={handleChangeCategoryName}
              className="w-[80%] bg-transparent px-3 py-2 text-sm outline-none text-white placeholder-text-muted"
            />
            <button type="submit" className="flex-1 flex justify-end transition-colors cursor-pointer pr-2">
              <div className="hover:bg-accent-400 rounded-full p-1 transition-all duration-300">
                <Plus size={18} />
              </div>
            </button>
          </form>
        )}

        {/* Manage Categories Button */}
        {isCategoriesPanelOpen && (
          <button
            onClick={handleToggleManageCategories}
            className={`flex items-center justify-center gap-x-2 mt-auto py-2 px-3 rounded-md border border-border-default transition-all select-none outline-0 cursor-pointer w-full
                ${isManaging ? 'bg-accent-500' : 'hover:border-accent-500 hover:text-accent-500'}`}
          >
            {isManaging ? <CheckSquare size={18} /> : <Tags size={18} />}
            {isManaging ? 'Selesai' : 'Atur Kategori'}
          </button>
        )}
      </div>
    </aside>
  )
}