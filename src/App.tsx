import { type ReactElement } from "react"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/manrope/600.css"
import "@fontsource/manrope/700.css"

import "./index.css"

import { NotesPanel } from "./components/NotesPanel"
import CategoriesPanel from "@/features/categories/CategoriesPanel"

export default function App(): ReactElement {
  return (
    <div className="min-h-screen flex bg-main text-white">
      {/* Categories Sidebar */}
      <CategoriesPanel />

      {/* Notes List */}
      <main className="border-r border-border-default bg-surface flex-1 transition-all duration-300 px-6 py-6">
        <NotesPanel />
      </main>

      {/* Editor Area */}
      <section className="flex-1 bg-main hidden lg:block">
        <div className="flex items-center justify-center h-full text-text-muted">
          Pilih catatan untuk melihat detailnya
        </div>
      </section>
    </div>
  )
}
