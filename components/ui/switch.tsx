"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(checked || false)

        React.useEffect(() => {
            if (checked !== undefined) {
                setIsChecked(checked)
            }
        }, [checked])

        const handleToggle = () => {
            const newChecked = !isChecked
            setIsChecked(newChecked)
            if (onCheckedChange) {
                onCheckedChange(newChecked)
            }
        }

        return (
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                data-state={isChecked ? "checked" : "unchecked"}
                className={cn(
                    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    isChecked ? "bg-primary" : "bg-card/50",
                    className
                )}
                onClick={handleToggle}
                ref={ref}
                {...props}
            >
                <span
                    data-state={isChecked ? "checked" : "unchecked"}
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        isChecked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
