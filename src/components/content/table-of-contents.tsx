"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  items: TocItem[]
  title?: string
  sticky?: boolean
  offset?: number
}

const TableOfContents = React.forwardRef<HTMLElement, TableOfContentsProps>(
  ({ className, items, title = "Table of Contents", sticky = true, offset = 100, ...props }, ref) => {
    const [activeId, setActiveId] = React.useState<string>("")

    React.useEffect(() => {
      if (items.length === 0) return

      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null)

      if (headingElements.length === 0) return

      const handleScroll = () => {
        const scrollPosition = window.scrollY + offset

        let currentId = ""
        for (const heading of headingElements) {
          if (heading.offsetTop <= scrollPosition) {
            currentId = heading.id
          }
        }

        if (window.scrollY < offset && items.length > 0) {
          currentId = items[0].id
        }

        setActiveId(currentId)
      }

      handleScroll()

      window.addEventListener("scroll", handleScroll, { passive: true })
      return () => window.removeEventListener("scroll", handleScroll)
    }, [items, offset])

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const element = document.getElementById(id)
      if (element) {
        const top = element.offsetTop - offset + 20
        window.scrollTo({
          top,
          behavior: "smooth",
        })
        window.history.pushState(null, "", `#${id}`)
      }
    }

    if (items.length === 0) return null

    const minLevel = Math.min(...items.map((item) => item.level))

    return (
      <nav
        ref={ref}
        aria-label="Table of contents"
        className={cn(
          "rounded-lg border border-border bg-card p-4",
          sticky && "lg:sticky lg:top-24",
          className
        )}
        {...props}
      >
        <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
        <ul className="space-y-1">
          {items.map((item) => {
            const indentLevel = item.level - minLevel
            const isActive = activeId === item.id

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={cn(
                    "block py-1.5 text-sm transition-colors",
                    "hover:text-primary",
                    isActive
                      ? "font-medium text-primary border-l-2 border-primary"
                      : "text-muted-foreground border-l-2 border-transparent",
                    indentLevel === 0 && "pl-3",
                    indentLevel === 1 && "pl-6",
                    indentLevel === 2 && "pl-9",
                    indentLevel >= 3 && "pl-12"
                  )}
                  aria-current={isActive ? "location" : undefined}
                >
                  {item.text}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
)
TableOfContents.displayName = "TableOfContents"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function extractHeadings(content: string): TocItem[] {
  const headingRegex = /<h([2-4])[^>]*id=["']([^"']+)["'][^>]*>([^<]+)<\/h[2-4]>/gi
  const items: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    items.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].trim(),
    })
  }

  return items
}

export { TableOfContents, slugify, extractHeadings }
