import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

import { cn } from "../../lib/utils"

const AnimatedCheckbox = React.forwardRef(({ className, checked, onCheckedChange, children, ...props }, ref) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "peer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4242EA] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <motion.div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md",
            "border-2 transition-colors",
            checked 
              ? "border-[#4242EA] bg-[#4242EA]" 
              : "border-[#C8C8C8] bg-white group-hover:border-[#4242EA]"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <CheckboxPrimitive.Indicator asChild forceMount>
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </CheckboxPrimitive.Indicator>
        </motion.div>
      </CheckboxPrimitive.Root>
      {children && (
        <span className="text-[#1E1E1E] group-hover:text-[#4242EA] transition-colors text-base select-none">
          {children}
        </span>
      )}
    </label>
  );
})
AnimatedCheckbox.displayName = "AnimatedCheckbox"

export { AnimatedCheckbox }

