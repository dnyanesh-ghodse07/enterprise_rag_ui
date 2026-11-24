import { cn } from "cn"

function Skeleton({ as: Element = "div", className, ...props }: React.ComponentPropsWithoutRef<"div"> & { as?: "div" | "span" }) {
  return (
    <Element
      data-slot="skeleton"
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
