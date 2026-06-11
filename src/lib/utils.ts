import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True when a value is a renderable image src: absolute http(s) URL or a
 * root-relative path (e.g. /cdn/...). Guards against empty strings and
 * junk values sneaking into next/image (which silently drops src="").
 */
export function isRenderableImageSrc(src: string | null | undefined): src is string {
  if (!src) return false
  const s = src.trim()
  return /^https?:\/\//i.test(s) || s.startsWith("/")
}
