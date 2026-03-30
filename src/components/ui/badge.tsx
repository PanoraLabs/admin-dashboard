import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-[#111827] px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-[#111827] focus-visible:ring-[2px] focus-visible:ring-[#111827]/20 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-[#FF6B00] aria-invalid:ring-[#FF6B00]/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-[#111827] text-[#F9FAFB]",
        secondary:
          "bg-[#F3F4F6] text-[#111827]",
        destructive:
          "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] border-[#111827]",
        outline:
          "border-[#111827] text-[#111827] bg-transparent",
        ghost:
          "hover:bg-[#F3F4F6] hover:text-[#111827]",
        link: "text-[#00D1FF] underline-offset-4 hover:underline border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
