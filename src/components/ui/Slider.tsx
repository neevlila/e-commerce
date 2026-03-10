import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "../../lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <SliderPrimitive.Range className="absolute h-full bg-blue-600" />
    </SliderPrimitive.Track>
    {/* Support for dual handles */}
    {(props.value?.length || 0) > 1 ? (
      <>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-blue-600 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer" />
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-blue-600 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer" />
      </>
    ) : (
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-blue-600 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer" />
    )}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }