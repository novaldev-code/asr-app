import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[24px] border border-border bg-carbon px-4 py-2 text-sm text-foreground transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-ash focus-visible:border-bone focus-visible:ring-1 focus-visible:ring-bone/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-mist aria-invalid:ring-2 aria-invalid:ring-mist/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
