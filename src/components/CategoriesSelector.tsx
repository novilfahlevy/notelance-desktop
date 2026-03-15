import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, FolderOpen } from 'lucide-react'

interface Option {
  label: string
  value: string | null
}

interface CategoriesSelectorProps {
  options: Option[]
  onChange?: (value: string | null) => void
  defaultValue?: string
}

const CategoriesSelector: React.FC<CategoriesSelectorProps> = ({
  options,
  onChange,
  defaultValue,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Option | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ Set default selected value on mount
  useEffect(() => {
    if (defaultValue) {
      const defaultOption = options.find((opt) => opt.value === defaultValue)
      if (defaultOption) {
        setSelected(defaultOption)
      }
      return
    }

    const fallbackOption = options.find((opt) => opt.value === null) ?? null
    setSelected(fallbackOption)
  }, [defaultValue, options])

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const handleSelect = (option: Option) => {
    setSelected(option)
    setIsOpen(false)
    onChange?.(option.value)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative w-[11.5rem] sm:w-64 shrink-0" ref={dropdownRef}>
      {/* Selected Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all duration-200 cursor-pointer outline-none ${
          isOpen
            ? 'border-accent-500 bg-main text-text-primary shadow-card'
            : 'border-border-default bg-main text-text-secondary hover:border-accent-400 hover:text-text-primary'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <FolderOpen size={16} className="text-accent-400 shrink-0" />
          <span className="truncate font-medium text-inherit">
            {selected ? selected.label : 'Umum'}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-accent-400' : 'rotate-0'
          }`}
        />
      </button>

      {/* Dropdown with animation */}
      <div
        className={`absolute left-0 z-20 mt-2 w-full origin-top overflow-hidden rounded-xl border border-border-default bg-surface shadow-card transition-all duration-200 ease-out ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <ul className="py-2">
          {options.map((option) => (
            <li key={option.value ?? 'general'}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors duration-150 cursor-pointer ${
                  selected?.value === option.value || (selected === null && option.value === null)
                    ? 'bg-accent-500/12 text-accent-300'
                    : 'text-text-secondary hover:bg-main hover:text-text-primary'
                }`}
              >
                <span className="truncate font-medium">{option.label}</span>
                {(selected?.value === option.value || (selected === null && option.value === null)) && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent-400" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CategoriesSelector
