import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  showHome?: boolean
  separator?: React.ReactNode
}

function BreadcrumbJsonLd({ items, showHome }: { items: BreadcrumbItem[]; showHome: boolean }) {
  const allItems = showHome
    ? [{ label: "Home", href: "/" }, ...items]
    : items

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: item.href }),
    })),
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning>
      {JSON.stringify(schemaData)}
    </script>
  )
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, items, showHome = true, separator, ...props }, ref) => {
    const allItems = showHome
      ? [{ label: "Home", href: "/" }, ...items]
      : items

    return (
      <>
        <BreadcrumbJsonLd items={items} showHome={showHome} />
        <nav
          ref={ref}
          aria-label="Breadcrumb"
          className={cn("flex items-center text-sm", className)}
          {...props}
        >
          <ol className="flex items-center gap-1.5">
            {allItems.map((item, index) => {
              const isLast = index === allItems.length - 1
              const isHome = index === 0 && showHome

              return (
                <li key={index} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-muted-foreground" aria-hidden="true">
                      {separator || <ChevronRight className="h-4 w-4" />}
                    </span>
                  )}
                  {isLast ? (
                    <span
                      className="font-medium text-foreground"
                      aria-current="page"
                    >
                      {isHome ? <Home className="h-4 w-4" /> : item.label}
                    </span>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isHome ? <Home className="h-4 w-4" /> : item.label}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">
                      {isHome ? <Home className="h-4 w-4" /> : item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </>
    )
  }
)
Breadcrumbs.displayName = "Breadcrumbs"

export { Breadcrumbs }
