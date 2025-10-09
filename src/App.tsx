import { type ReactElement, useEffect, useState } from "react"
import {
  Tag,
  Notebook,
  PanelRightOpen,
  PanelLeftOpen,
  Tags,
} from "lucide-react"
import type { Category, Note } from "./types/data-models"
import { NotesPanel } from "./components/NotesPanel"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/manrope/600.css"
import "@fontsource/manrope/700.css"

import './index.css'

export default function App(): ReactElement {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [notes, setNotes] = useState<Note[]>([])

  const [isCategoriesPanelOpen, openCategoriesPanel] = useState<boolean>(true)
  const [isWindowSmallerThanLg, setIfWindowSmallerThanLg] = useState<boolean>(false)

  const toggleCategoriesPanel = () => openCategoriesPanel(!isCategoriesPanelOpen)

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

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      const categories: Category[] = await window.localDatabase.fetchCategories()
      setCategories(categories)
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen flex bg-main text-white">
      {/* Categories Sidebar */}
      <aside
        className={`border-r border-border-default bg-surface transition-all duration-300 flex flex-col
        ${isCategoriesPanelOpen ? "w-[260px] px-5" : "w-[80px] px-3"} py-5`}
      >
        {/* Header */}
        <div className={`flex items-center ${isCategoriesPanelOpen ? 'justify-between' : 'justify-center'} mb-10`}>
          {isCategoriesPanelOpen && (
            <h1 className="font-bold text-xl text-primary-500 tracking-tight select-none">Notelance</h1>
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
          <li
            className={`flex items-center ${isCategoriesPanelOpen ? 'justify-between' : 'justify-center'} rounded-lg cursor-pointer p-3
              hover:bg-accent-800/20 transition-all duration-150 select-none`}
          >
            <div className="flex items-center gap-x-3">
              <Notebook className="text-accent-500" size={20} />
              {isCategoriesPanelOpen && <p className="text-base">Semua</p>}
            </div>
            {isCategoriesPanelOpen && <span className="text-accent-300 text-sm">25</span>}
          </li>

          {categories.length && categories.map((category: Category) => (
            <li className={`flex items-center ${isCategoriesPanelOpen ? 'justify-between' : 'justify-center'} rounded-lg cursor-pointer p-3 hover:bg-accent-800/20 transition-all duration-150 select-none`}>
              <div className="flex items-center gap-x-3">
                <Tag className="text-accent-400" size={18} />
                {isCategoriesPanelOpen && <p className="text-base">{category.name}</p>}
              </div>
              {isCategoriesPanelOpen && <span className="text-accent-300 text-sm">0</span>}
            </li>
          ))}
        </ul>

        {/* Add Category Button */}
        {isCategoriesPanelOpen && (
          <button className="flex items-center justify-center gap-x-2 mt-auto py-2 px-3 rounded-md border border-border-default hover:border-accent-500 hover:text-accent-500 transition-all select-none outline-0 cursor-pointer">
            <Tags size={18} /> Atur Kategori
          </button>
        )}
      </aside>

      {/* Notes List */}
      <main className="border-r border-border-default bg-surface flex-1 transition-all duration-300 px-6 py-6">
        <NotesPanel />
      </main>

      {/* Editor Area */}
      <section className="flex-1 bg-main hidden lg:block">
        {/* Placeholder for Note Editor */}
        <div className="flex items-center justify-center h-full text-text-muted">
          Pilih catatan untuk melihat detailnya
        </div>
      </section>
    </div>
  )
}