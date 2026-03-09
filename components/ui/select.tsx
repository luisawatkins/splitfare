"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

const Select = ({ children, onValueChange, defaultValue }: any) => {
  const [value, setValue] = React.useState(defaultValue)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange: handleValueChange,
            isOpen,
            setIsOpen,
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string; isOpen?: boolean; setIsOpen?: (open: boolean) => void }
>(({ className, children, value, isOpen, setIsOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={() => setIsOpen?.(!isOpen)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value, children }: any) => {
  return <span>{value || placeholder}</span>
}

const SelectContent = ({ children, isOpen, value, onValueChange }: any) => {
  if (!isOpen) return null

  return (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95">
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isSelected: child.props.value === value,
              onClick: () => onValueChange?.(child.props.value),
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; isSelected?: boolean; onClick?: () => void }
>(({ className, children, isSelected, onClick, ...props }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      isSelected && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
