import * as React from "react"
import { Plus, Trash2, Tag, BookOpen, Clock, Notebook } from "lucide-react"

// --- Dummy Data ---
const categories = [
  { id: 2, name: "Work Projects", noteCount: 5 },
  { id: 3, name: "Personal Ideas", noteCount: 8 },
]

const notes = [
  {
    id: 101,
    title: "Project Alpha Kickoff",
    content: "Meeting notes from the planning session. Need to follow up on...",
    updatedAt: "3m ago",
    category_id: 2,
  },
  {
    id: 102,
    title: "Grocery List",
    content: "Milk, bread, eggs, and the special coffee beans...",
    updatedAt: "1h ago",
    category_id: 1,
  },
  {
    id: 103,
    title: "React Component Patterns",
    content: "Exploring custom hooks and the use of Context API for state management...",
    updatedAt: "5h ago",
    category_id: 2,
  },
  {
    id: 104,
    title: "Summer Vacation Plan",
    content: "Looking at flights to Bali. Check hotel availability near Seminyak...",
    updatedAt: "1d ago",
    category_id: 3,
  },
]

// Assuming the active note is the first one in the list for the editor pane
const activeNote = {
  id: 101,
  title: "Project Alpha Kickoff",
  content:
    "## Meeting Notes - 2024-10-07\n\n**Attendees:** Jane, Mark, David\n\n**Key Decisions:**\n- Finalized the API structure.\n- Assigned Mark to front-end setup.\n\n**Action Items:**\n- [ ] Jane: Prepare the deployment pipeline.\n- [ ] David: Review the database schema.",
  updatedAt: "2025-10-07, 17:27",
  category: "Work Projects",
}

// --- Main Component ---
export default function App(): React.JSX.Element {
  // Use col-span-2 for Categories, col-span-3 for Notes List, and col-span-7 for Editor
  // Total = 2 + 3 + 7 = 12
  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-50 text-gray-800">
      
      {/* 1. Categories Pane (col-span-2) */}
      <div className="col-span-2 bg-gray-900 text-white flex flex-col border-r border-gray-700">
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <h1 className="text-xl font-semibold">Notelance</h1>
          <button className="p-2 bg-primary-600 hover:bg-primary-700 rounded-full text-white shadow-lg transition duration-150 cursor-pointer">
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-grow p-4 space-y-2 overflow-y-auto">
          {/* Main Views */}
          <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded cursor-pointer">
            <Notebook size={18} className="text-primary-400" />
            <span className="font-medium">Umum</span>
            <span className="ml-auto text-sm text-gray-400">25</span>
          </div>

          <h2 className="pt-4 pb-2 text-sm uppercase text-gray-400 font-medium tracking-wider">
            Kategori
          </h2>
          {/* Categories List */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
            >
              <Tag size={18} className="text-green-400" />
              <span>{cat.name}</span>
              <span className="ml-auto text-sm text-gray-400">
                {cat.noteCount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Notes List Pane (col-span-3) */}
      <div className="col-span-3 bg-white flex flex-col border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Notes Cards List */}
        <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 cursor-pointer transition duration-100 ${
                note.id === activeNote.id
                  ? "bg-primary-50 border-l-4 border-primary-500"
                  : "hover:bg-gray-100 border-l-4 border-transparent"
              }`}
            >
              <h3 className="font-semibold text-gray-900 truncate">
                {note.title}
              </h3>
              <p className="text-sm text-gray-500 truncate my-1">
                {note.content}
              </p>
              <div className="flex items-center text-xs text-gray-400 space-x-1 mt-1">
                <Clock size={12} />
                <span>{note.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Note Editor Pane (col-span-7) */}
      <div className="col-span-7 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            value={activeNote.title}
            className="text-2xl font-bold w-full focus:outline-none focus:ring-0 text-gray-900"
            readOnly
          />
          <div className="flex space-x-3">
            <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              Umum
            </button>
            <button className="text-gray-500 hover:text-primary-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              Simpan
            </button>
            <button className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 overflow-y-auto">
          <textarea
            className="w-full min-h-full text-lg leading-relaxed focus:outline-none resize-none text-gray-800 font-mono bg-white"
            value={activeNote.content}
            rows={20}
            readOnly
          />
        </div>

        {/* Footer/Status Bar */}
        <div className="p-2 border-t border-gray-200 text-right text-xs text-gray-500">
          Last updated: {activeNote.updatedAt}
        </div>
      </div>
    </div>
  )
}