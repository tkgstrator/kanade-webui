import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useSidebar } from '@/components/ui/sidebar'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { client } from '@/lib/client'
import { cn } from '@/lib/utils'

const SUGGESTION_DEBOUNCE_MS = 200
const MIN_QUERY_LENGTH = 1

type Variant = 'sidebar' | 'hero'

type SearchInputProps = {
  variant?: Variant
  placeholder?: string
  className?: string
}

export function SearchInput({ variant = 'sidebar', placeholder = '検索', className }: SearchInputProps) {
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()

  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [isComposing, setIsComposing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const debouncedTerm = useDebouncedValue(value.trim(), SUGGESTION_DEBOUNCE_MS)
  const shouldQuery = debouncedTerm.length >= MIN_QUERY_LENGTH && isFocused && !isComposing

  const { data } = useQuery({
    enabled: shouldQuery,
    queryFn: async () => {
      console.log('[SearchHints] fetching', { term: debouncedTerm })
      const response = await client.get('/api/search/hints', {
        queries: { limit: 10, term: debouncedTerm },
      })
      return response.results.terms
    },
    queryKey: ['search-hints', debouncedTerm],
    staleTime: 60 * 1000,
  })

  const terms = shouldQuery ? (data ?? []) : []
  const open = isFocused && terms.length > 0

  useEffect(() => {
    setHighlight(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const submit = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setIsFocused(false)
    setValue(trimmed)
    inputRef.current?.blur()
    if (isMobile) {
      setOpenMobile(false)
    }
    navigate({ search: { term: trimmed }, to: '/search' })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing || e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = highlight >= 0 ? terms[highlight] : value
      if (chosen) submit(chosen)
      return
    }

    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((prev) => (prev + 1) % terms.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((prev) => (prev <= 0 ? terms.length - 1 : prev - 1))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsFocused(false)
    }
  }

  const commonInputProps = {
    'aria-activedescendant': highlight >= 0 ? `${listboxId}-option-${highlight}` : undefined,
    'aria-autocomplete': 'list' as const,
    'aria-controls': open ? listboxId : undefined,
    'aria-expanded': open,
    autoComplete: 'off',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      setHighlight(-1)
    },
    onCompositionEnd: () => setIsComposing(false),
    onCompositionStart: () => setIsComposing(true),
    onFocus: () => setIsFocused(true),
    onKeyDown: handleKeyDown,
    placeholder,
    role: 'combobox' as const,
    value,
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {variant === 'sidebar' ? (
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-5" />
          </InputGroupAddon>
          <InputGroupInput {...commonInputProps} ref={inputRef} />
        </InputGroup>
      ) : (
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border border-input bg-muted/50 pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 md:max-w-md"
            ref={inputRef}
            type="text"
            {...commonInputProps}
          />
        </div>
      )}
      {open && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 z-50 mt-1',
            'overflow-hidden rounded-md border border-border bg-popover shadow-lg',
            variant === 'hero' && 'md:max-w-md',
          )}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
        >
          {terms.map((term, index) => (
            <div
              aria-selected={index === highlight}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-popover-foreground',
                'hover:bg-accent hover:text-accent-foreground',
                index === highlight && 'bg-accent text-accent-foreground',
              )}
              id={`${listboxId}-option-${index}`}
              key={term}
              onMouseDown={(e) => {
                e.preventDefault()
                submit(term)
              }}
              onMouseEnter={() => setHighlight(index)}
              role="option"
              tabIndex={-1}
            >
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{term}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
