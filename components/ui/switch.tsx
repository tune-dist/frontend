"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(checked || false)

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked)
            }
        }, [checked])

        const handleToggle = () => {
            if (disabled) return
            const newChecked = !isChecked
            setIsChecked(newChecked)
            onCheckedChange?.(newChecked)
        }

        return (
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                data-state={isChecked ? "checked" : "unchecked"}
                disabled={disabled}
                className={cn(
                    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked
                        ? "border-primary bg-primary"
                        : "border-border bg-muted/80",
                    className
                )}
                onClick={handleToggle}
                ref={ref}
                {...props}
            >
                <span
                    data-state={isChecked ? "checked" : "unchecked"}
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full shadow-md ring-0 transition-transform",
                        isChecked
                            ? "translate-x-5 bg-white"
                            : "translate-x-0.5 bg-background border border-border"
                    )}
                />
            </button>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
