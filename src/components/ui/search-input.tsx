"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  defaultQuery?: string
  searchPath?: string
  size?: "sm" | "md" | "lg"
  showButton?: boolean
}

const sizeClasses = {
  sm: "h-9 text-sm pl-9 pr-16",
  md: "h-11 text-base pl-11 pr-20",
  lg: "h-14 text-lg pl-12 pr-24",
}

const iconSizeClasses = {
  sm: "h-4 w-4 left-2.5",
  md: "h-5 w-5 left-3",
  lg: "h-5 w-5 left-4",
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      defaultQuery = "",
      searchPath = "/search",
      size = "md",
      showButton = true,
      placeholder = "Search...",
      ...props
    },
    ref
  ) => {
    const router = useRouter()
    const [query, setQuery] = React.useState(defaultQuery)
    const [isPending, startTransition] = React.useTransition()

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        startTransition(() => {
          router.push(`${searchPath}?q=${encodeURIComponent(query.trim())}`)
        })
      }
    }

    const handleClear = () => {
      setQuery("")
      startTransition(() => {
        router.push(searchPath)
      })
    }

    return (
      <form onSubmit={handleSubmit} className={cn("relative", className)}>
        <Search
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            iconSizeClasses[size]
          )}
        />
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-border bg-background text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all",
            sizeClasses[size]
          )}
          {...props}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showButton && (
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !query.trim()}
              className="h-7"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          )}
        </div>
      </form>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
