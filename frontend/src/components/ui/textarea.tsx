import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-[24px] border border-border bg-carbon px-4 py-3 text-sm text-foreground transition-colors outline-none placeholder:text-ash focus-visible:border-bone focus-visible:ring-1 focus-visible:ring-bone/30 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-mist aria-invalid:ring-2 aria-invalid:ring-mist/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
