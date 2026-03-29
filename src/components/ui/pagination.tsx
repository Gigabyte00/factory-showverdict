import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number
  totalPages: number
  basePath: string
  maxVisible?: number
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | "ellipsis")[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = []
  const sidePages = Math.floor((maxVisible - 3) / 2)

  // Always show first page
  pages.push(1)

  // Calculate start and end of visible range
  let start = Math.max(2, currentPage - sidePages)
  let end = Math.min(totalPages - 1, currentPage + sidePages)

  // Adjust if at the beginning
  if (currentPage <= sidePages + 2) {
    end = Math.min(totalPages - 1, maxVisible - 2)
  }

  // Adjust if at the end
  if (currentPage >= totalPages - sidePages - 1) {
    start = Math.max(2, totalPages - maxVisible + 3)
  }

  // Add ellipsis before if needed
  if (start > 2) {
    pages.push("ellipsis")
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Add ellipsis after if needed
  if (end < totalPages - 1) {
    pages.push("ellipsis")
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, currentPage, totalPages, basePath, maxVisible = 7, ...props }, ref) => {
    if (totalPages <= 1) return null

    const pages = generatePageNumbers(currentPage, totalPages, maxVisible)
    const hasPrev = currentPage > 1
    const hasNext = currentPage < totalPages

    const getPageUrl = (page: number) => {
      if (page === 1) return basePath
      return `${basePath}?page=${page}`
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn("flex justify-center", className)}
        {...props}
      >
        <ul className="flex items-center gap-1">
          {/* Previous Button */}
          <li>
            {hasPrev ? (
              <Link
                href={getPageUrl(currentPage - 1)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-9 w-9"
                )}
                aria-label="Go to previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-9 w-9 opacity-50 cursor-not-allowed"
                )}
                aria-disabled="true"
              >
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
          </li>

          {/* Page Numbers */}
          {pages.map((page, index) => (
            <li key={index}>
              {page === "ellipsis" ? (
                <span className="flex h-9 w-9 items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </span>
              ) : page === currentPage ? (
                <span
                  className={cn(
                    buttonVariants({ variant: "default", size: "icon" }),
                    "h-9 w-9"
                  )}
                  aria-current="page"
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={getPageUrl(page)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "h-9 w-9"
                  )}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </Link>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li>
            {hasNext ? (
              <Link
                href={getPageUrl(currentPage + 1)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-9 w-9"
                )}
                aria-label="Go to next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                  "h-9 w-9 opacity-50 cursor-not-allowed"
                )}
                aria-disabled="true"
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </li>
        </ul>
      </nav>
    )
  }
)
Pagination.displayName = "Pagination"

export { Pagination }
