import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { RootState } from "@/app/store"
import { Category } from "@/types/data-models"
import { ReactElement, useEffect, useState } from "react"
import { fetchLocalCategories } from "./categoriesSlice"

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
} from "lucide-react"

export default function CategoriesPanel(): ReactElement {
  const [isCategoriesPanelOpen, openCategoriesPanel] = useState<boolean>(true)
  const [isManaging, setIsManaging] = useState<boolean>(false)
  const toggleCategoriesPanel = () => openCategoriesPanel(!isCategoriesPanelOpen)
  const toggleManageMode = () => setIsManaging(!isManaging)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isWindowSmallerThanLg, setIfWindowSmallerThanLg] = useState<boolean>(false)

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

  const categories: Category[] = useAppSelector((state: RootState) => state.categories.categories)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchLocalCategories())
  }, [])
  
  return (
    <aside
      className={`border-r border-border-default bg-surface transition-all duration-300 flex flex-col justify-between
        ${isCategoriesPanelOpen ? "w-[260px] px-5" : "w-[80px] px-3"} py-5`}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center ${isCategoriesPanelOpen ? "justify-between" : "justify-center"} mb-10`}
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
          {/* “Semua” category (static) */}
          <li
            className={`flex items-center ${
              isCategoriesPanelOpen ? "justify-between" : "justify-center"
            } rounded-lg cursor-pointer p-3 hover:bg-accent-800/20 transition-all duration-150 select-none`}
          >
            <div className="flex items-center gap-x-3">
              <Notebook className="text-accent-500" size={20} />
              {isCategoriesPanelOpen && <p className="text-base">Semua</p>}
            </div>
            {isCategoriesPanelOpen && (
              <span className="text-accent-300 text-sm">25</span>
            )}
          </li>

          {/* Dynamic categories */}
          {categories.length > 0 &&
            categories.map((category: Category) => (
              <li
                key={category.id}
                className={`flex items-center ${
                  isCategoriesPanelOpen ? "justify-between" : "justify-center"
                } rounded-lg cursor-pointer p-3 hover:bg-accent-800/20 transition-all duration-150 select-none group`}
              >
                <div className="flex items-center gap-x-3">
                  <Tag className="text-accent-400" size={18} />
                  {isCategoriesPanelOpen && (
                    <p className="text-base">{category.name}</p>
                  )}
                </div>

                {/* Management buttons */}
                {isCategoriesPanelOpen && isManaging ? (
                  <div className="flex items-center gap-x-2">
                    <Pencil
                      size={16}
                      className="text-text-muted cursor-pointer hover:text-accent-400"
                    />
                    <Trash
                      size={16}
                      className="text-text-muted cursor-pointer hover:text-red-500"
                    />
                    <GripVertical
                      size={16}
                      className="text-text-muted cursor-grab hover:text-accent-400"
                    />
                  </div>
                ) : (
                  isCategoriesPanelOpen && (
                    <span className="text-accent-300 text-sm">0</span>
                  )
                )}
              </li>
            ))}
        </ul>
      </div>

      <div className="flex flex-col gap-y-3">
        {isCategoriesPanelOpen && isManaging && (
          <div className="flex items-center w-full border border-border-default rounded-md overflow-hidden focus-within:border-accent-500 transition-all">
            <input
              type="text"
              placeholder="Tambah Kategori"
              className="w-[80%] bg-transparent px-3 py-2 text-sm outline-none text-white placeholder-text-muted"
            />
            <button className="flex-1 flex justify-end transition-colors cursor-pointer pr-2">
              <div className="hover:bg-accent-400 rounded-full p-1 transition-all duration-300">
                <Plus size={18} />
              </div>
            </button>
          </div>
        )}

        {/* Manage Categories Button */}
        {isCategoriesPanelOpen && (
          <button
            onClick={toggleManageMode}
            className={`flex items-center justify-center gap-x-2 mt-auto py-2 px-3 rounded-md border border-border-default transition-all select-none outline-0 cursor-pointer w-full
                ${isManaging ? "bg-accent-500" : "hover:border-accent-500 hover:text-accent-500"}`}
          >
            {isManaging ? <CheckSquare size={18} /> : <Tags size={18} />}
            {isManaging ? "Selesai" : "Atur Kategori"}
          </button>
        )}
      </div>
    </aside>
  )
}
