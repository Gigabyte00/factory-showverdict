import * as React from "react"
import { Star, StarHalf } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  showValue?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ className, rating, maxRating = 5, showValue = true, size = "md", ...props }, ref) => {
    // Clamp rating between 0 and maxRating
    const clampedRating = Math.max(0, Math.min(rating, maxRating))

    const fullStars = Math.floor(clampedRating)
    const hasHalfStar = clampedRating % 1 >= 0.25 && clampedRating % 1 < 0.75
    const nearlyFullStar = clampedRating % 1 >= 0.75
    const adjustedFullStars = nearlyFullStar ? fullStars + 1 : fullStars
    const emptyStars = maxRating - adjustedFullStars - (hasHalfStar ? 1 : 0)

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        role="img"
        aria-label={`Rating: ${clampedRating.toFixed(1)} out of ${maxRating} stars`}
        {...props}
      >
        <div className="flex items-center">
          {/* Full stars */}
          {Array.from({ length: adjustedFullStars }).map((_, i) => (
            <Star
              key={`full-${i}`}
              className={cn(sizeClasses[size], "fill-primary text-primary")}
            />
          ))}

          {/* Half star */}
          {hasHalfStar && (
            <div className="relative">
              <Star
                className={cn(sizeClasses[size], "text-muted-foreground/30")}
              />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star
                  className={cn(sizeClasses[size], "fill-primary text-primary")}
                />
              </div>
            </div>
          )}

          {/* Empty stars */}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star
              key={`empty-${i}`}
              className={cn(sizeClasses[size], "text-muted-foreground/30")}
            />
          ))}
        </div>

        {showValue && (
          <span className={cn("font-medium text-foreground", textSizeClasses[size])}>
            {clampedRating.toFixed(1)}
          </span>
        )}
      </div>
    )
  }
)
StarRating.displayName = "StarRating"

export { StarRating }
