"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-[#111827] focus-visible:ring-2 focus-visible:ring-[#111827]/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[#FF6B00] aria-invalid:ring-2 aria-invalid:ring-[#FF6B00]/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#111827] text-[#F9FAFB] hover:bg-[#111827]/90",
        outline:
          "border-[#111827] bg-[#F9FAFB] hover:bg-[#F3F4F6] hover:text-[#111827] aria-expanded:bg-[#F3F4F6] aria-expanded:text-[#111827]",
        secondary:
          "bg-[#F3F4F6] text-[#111827] hover:bg-[#E5E7EB] aria-expanded:bg-[#F3F4F6] aria-expanded:text-[#111827]",
        ghost:
          "hover:bg-[#F3F4F6] hover:text-[#111827] aria-expanded:bg-[#F3F4F6] aria-expanded:text-[#111827]",
        destructive:
          "bg-[rgba(255,107,0,0.1)] text-[#FF6B00] hover:bg-[rgba(255,107,0,0.2)] focus-visible:border-[#FF6B00]/40 focus-visible:ring-[#FF6B00]/20",
        link: "text-[#00D1FF] underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
