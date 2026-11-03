'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/class-names'
import { getErrorMessage } from '@/lib/get-error-message'
import { filterMetadataOptions } from '@/lib/releases/release-metadata-options'

interface ReleaseMetadataComboboxProps {
  id: string
  value: string
  options: string[]
  placeholder: string
  invalid?: boolean
  onSelect: (value: string) => void
  onAdd: (value: string) => Promise<string>
}

export default function ReleaseMetadataCombobox({
  id,
  value,
  options,
  placeholder,
  invalid = false,
  onSelect,
  onAdd,
}: ReleaseMetadataComboboxProps) {
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const { matches, addValue } = filterMetadataOptions(options, query)

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => searchRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  const closeMenu = () => {
    setOpen(false)
    setQuery('')
  }

  const selectValue = (nextValue: string) => {
    onSelect(nextValue)
    closeMenu()
  }

  const addValueToCatalog = async (nextValue: string) => {
    setIsAdding(true)
    try {
      const stored = await onAdd(nextValue)
      onSelect(stored)
      closeMenu()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add this value'))
    } finally {
      setIsAdding(false)
    }
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation()
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (isAdding) return
    if (addValue) {
      void addValueToCatalog(addValue)
      return
    }
    const exact = matches.find(
      (option) => option.toLowerCase() === query.trim().toLowerCase(),
    )
    if (exact) selectValue(exact)
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (isAdding) return
        setOpen(nextOpen)
        if (!nextOpen) setQuery('')
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            invalid && 'border-red-500',
          )}
          disabled={isAdding}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] p-1"
      >
        <Input
          ref={searchRef}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          className="mb-1 h-9"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          onClick={(event) => event.stopPropagation()}
        />
        <div className="max-h-60 overflow-auto">
          {matches.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={option === value}
              onSelect={(event) => {
                event.preventDefault()
                selectValue(option)
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}

          {matches.length === 0 && !addValue && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">
              No saved values yet.
            </p>
          )}

          {addValue && (
            <DropdownMenuItem
              disabled={isAdding}
              onSelect={(event) => {
                event.preventDefault()
                void addValueToCatalog(addValue)
              }}
            >
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              + Add {addValue}
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
