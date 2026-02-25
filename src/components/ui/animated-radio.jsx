import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "../../lib/utils"

const AnimatedRadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root 
      className={cn("grid gap-3", className)} 
      {...props} 
      ref={ref} 
    />
  );
})
AnimatedRadioGroup.displayName = "AnimatedRadioGroup"

const AnimatedRadioItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group flex items-center gap-3 cursor-pointer focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <motion.div 
        className={cn(
          "relative flex h-5 w-5 items-center justify-center rounded-full",
          "border-2 border-[#C8C8C8] bg-white transition-colors",
          "group-hover:border-[#4242EA]",
          "group-data-[state=checked]:border-[#4242EA] group-data-[state=checked]:bg-[#4242EA]",
          "group-focus-visible:ring-2 group-focus-visible:ring-[#4242EA] group-focus-visible:ring-offset-2"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <RadioGroupPrimitive.Indicator asChild>
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="h-2 w-2 rounded-full bg-white"
            />
          </AnimatePresence>
        </RadioGroupPrimitive.Indicator>
      </motion.div>
      {children && (
        <span className="text-[#1E1E1E] group-hover:text-[#4242EA] transition-colors text-base">
          {children}
        </span>
      )}
    </RadioGroupPrimitive.Item>
  );
})
AnimatedRadioItem.displayName = "AnimatedRadioItem"

export { AnimatedRadioGroup, AnimatedRadioItem }

