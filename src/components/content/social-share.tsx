"use client"

import * as React from "react"
import { Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SocialShareProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string
  title: string
  description?: string
  variant?: "default" | "compact" | "floating"
}

const SocialShare = React.forwardRef<HTMLDivElement, SocialShareProps>(
  ({ className, url, title, description = "", variant = "default", ...props }, ref) => {
    const [copied, setCopied] = React.useState(false)

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDescription = encodeURIComponent(description)

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy link:", err)
      }
    }

    const buttonSize = variant === "compact" ? "icon" : "default"
    const buttonClassName = variant === "compact" ? "h-8 w-8" : "h-9"

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          variant === "floating" && "fixed bottom-4 right-4 flex-col bg-background/80 backdrop-blur-sm p-3 rounded-xl border border-border shadow-lg",
          variant === "default" && "flex-wrap",
          className
        )}
        {...props}
      >
        {variant !== "compact" && (
          <span className="text-sm font-medium text-muted-foreground mr-1">
            Share:
          </span>
        )}

        <Button
          variant="outline"
          size={buttonSize}
          className={cn(buttonClassName, "text-[#1DA1F2] hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10")}
          asChild
        >
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
            {variant === "default" && <span className="ml-2">Twitter</span>}
          </a>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          className={cn(buttonClassName, "text-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10")}
          asChild
        >
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
          >
            <Facebook className="h-4 w-4" />
            {variant === "default" && <span className="ml-2">Facebook</span>}
          </a>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          className={cn(buttonClassName, "text-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10")}
          asChild
        >
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
            {variant === "default" && <span className="ml-2">LinkedIn</span>}
          </a>
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          className={buttonClassName}
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied!" : "Copy link"}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              {variant === "default" && <span className="ml-2 text-green-500">Copied!</span>}
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              {variant === "default" && <span className="ml-2">Copy Link</span>}
            </>
          )}
        </Button>
      </div>
    )
  }
)
SocialShare.displayName = "SocialShare"

export { SocialShare }
