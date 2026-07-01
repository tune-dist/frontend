"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple Dialog context
const DialogContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => { } });

// Dialog Root
interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog = ({ open: controlledOpen, onOpenChange, children }: DialogProps) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const setOpen = React.useCallback(
        (newOpen: boolean) => {
            if (onOpenChange) {
                onOpenChange(newOpen);
            } else {
                setInternalOpen(newOpen);
            }
        },
        [onOpenChange]
    );

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};

// Dialog Trigger
const DialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, asChild, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleClick,
        });
    }

    return (
        <button ref={ref} onClick={handleClick} {...props}>
            {children}
        </button>
    );
});
DialogTrigger.displayName = "DialogTrigger";

// Dialog Portal (just renders children)
const DialogPortal = ({ children }: { children: React.ReactNode }) => {
    const { open } = React.useContext(DialogContext);
    if (!open) return null;
    return <>{children}</>;
};

// Dialog Close
const DialogClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        setOpen(false);
    };

    return <button ref={ref} onClick={handleClick} {...props} />;
});
DialogClose.displayName = "DialogClose";

// Dialog Overlay
const DialogOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);

    return (
        <div
            ref={ref}
            className={cn(
                "fixed inset-0 z-50 bg-black/80 animate-in fade-in-0",
                className
            )}
            onClick={() => setOpen(false)}
            {...props}
        />
    );
});
DialogOverlay.displayName = "DialogOverlay";

// Dialog Content
const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DialogContext);

    // Handle Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        if (open) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [open, setOpen]);

    if (!open) return null;

    // Separate children into Header, Footer, and scrollable Body
    const childrenArray = React.Children.toArray(children);
    let headerElement: React.ReactNode = null;
    let footerElement: React.ReactNode = null;
    const bodyElements: React.ReactNode[] = [];

    childrenArray.forEach((child) => {
        if (React.isValidElement(child)) {
            const displayName = (child.type as any)?.displayName || "";
            const childClassName = (child.props as any)?.className || "";
            
            if (child.type === DialogHeader || displayName === "DialogHeader") {
                headerElement = child;
            } else if (
                child.type === DialogFooter || 
                displayName === "DialogFooter" ||
                childClassName.includes("justify-end")
            ) {
                footerElement = child;
            } else {
                bodyElements.push(child);
            }
        } else {
            bodyElements.push(child);
        }
    });

    const hasHeaderOrFooter = !!headerElement || !!footerElement;
    const isP0 = className?.includes("p-0") || false;
    const scrollContainerClass = isP0 
        ? "flex-1 overflow-y-auto min-h-0" 
        : "flex-1 overflow-y-auto min-h-0 px-6 -mx-6 py-1";

    return createPortal(
        <>
            <DialogOverlay />
            {/* Outer shell centers the panel; inner panel may use relative/absolute without breaking layout. */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                <div
                    ref={ref}
                    className={cn(
                        "pointer-events-auto relative flex flex-col w-full max-w-lg max-h-[min(92vh,calc(100dvh-2rem))] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 sm:rounded-lg overflow-hidden",
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                    {...props}
                >
                    {hasHeaderOrFooter ? (
                        <>
                            {headerElement}
                            <div className={scrollContainerClass} data-lenis-prevent>
                                {bodyElements}
                            </div>
                            {footerElement}
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto min-h-0" data-lenis-prevent>
                            {children}
                        </div>
                    )}
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>
            </div>
        </>,
        document.body
    );
});
DialogContent.displayName = "DialogContent";

// Dialog Header
const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

// Dialog Title
const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

// Dialog Description
const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
DialogDescription.displayName = "DialogDescription";

// Dialog Footer
const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
};
