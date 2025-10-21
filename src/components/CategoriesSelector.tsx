import React, { useState, useRef, useEffect } from 'react'

interface Option {
  label: string
  value: string
}

interface CategoriesSelectorProps {
  options: Option[]
  onChange?: (value: string) => void
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
    }
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
    <div className="relative w-64" ref={dropdownRef}>
      {/* Selected Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full flex justify-between items-center px-4 py-2 bg-main border border-gray-300 rounded-lg shadow-sm hover:border-accent-400 cursor-pointer transition-all duration-200"
      >
        <span className="transition-colors duration-200">
          {selected ? selected.label : 'Umum'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown with animation */}
      <div
        className={`absolute z-10 w-full mt-2 bg-main border border-accent-200 rounded-lg shadow-lg origin-top transition-all duration-200 ease-out ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <ul>
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`px-4 py-2 cursor-pointer transition-all duration-150 hover:bg-accent-200 hover:text-main ${
                selected?.value === option.value
                  ? 'bg-accent-200 font-medium text-main'
                  : (selected === null && option.label == 'Umum' ? 'bg-accent-200 font-medium text-main' : '')
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CategoriesSelector
