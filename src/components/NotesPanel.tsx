import { ReactElement } from 'react'
import { Clock, Search } from 'lucide-react'

export function NotesPanel(): ReactElement {
  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          placeholder="Cari catatan..."
          className="bg-main border border-border-default rounded-md w-full text-white placeholder-text-muted outline-none pl-10 pr-4 py-2 focus:border-accent-500 transition-colors"
        />
      </div>

      {/* Notes List */}
      <ul className="flex flex-col gap-y-5">
        <li className="bg-main rounded-lg p-4 border border-border-default hover:border-accent-500 transition-all cursor-pointer">
          <h4 className="text-white text-lg font-semibold mb-2">
            Lorem Ipsum
          </h4>
          <p className="text-text-secondary text-sm line-clamp-3 mb-3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
            adipisci deleniti voluptatem repellat aut magni.
          </p>
          <span className="text-text-muted text-xs flex items-center gap-x-1">
            <Clock size={12} /> 1d ago
          </span>
        </li>

        <li className="bg-main rounded-lg p-4 border border-border-default hover:border-accent-500 transition-all cursor-pointer">
          <h4 className="text-white text-lg font-semibold mb-2">
            Meeting Notes
          </h4>
          <p className="text-text-secondary text-sm line-clamp-3 mb-3">
            Action items from our last meeting and the agenda for next week.
          </p>
          <span className="text-text-muted text-xs flex items-center gap-x-1">
            <Clock size={12} /> 3h ago
          </span>
        </li>
      </ul>
    </div>
  )
}