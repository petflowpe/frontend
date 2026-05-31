"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

/** Portales de Radix (Select, Popover, menús) viven fuera del nodo del Dialog; hay que ignorarlos en dismiss/focus. */
function isRadixPortaledOverlayTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return !!target.closest(
    [
      '[data-slot="select-content"]',
      '[data-slot="popover-content"]',
      '[data-slot="dropdown-menu-content"]',
      '[data-slot="dropdown-menu-sub-content"]',
      "[data-radix-popper-content-wrapper]",
      "[data-radix-select-viewport]",
      '[data-radix-collection-item]',
      '[role="listbox"]',
      '[role="option"]',
      '[role="menu"]',
      '[role="menuitem"]',
    ].join(","),
  );
}

function Dialog({
  modal = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root modal={modal} data-slot="dialog" {...props} />;
}

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ ...props }, ref) => {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />;
});
DialogTrigger.displayName = "DialogTrigger";

function DialogPortal({
  container,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  const target = container ?? (typeof document !== "undefined" ? document.body : undefined);
  return <DialogPrimitive.Portal data-slot="dialog-portal" container={target} {...props} />;
}

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ ...props }, ref) => {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />;
});
DialogClose.displayName = "DialogClose";

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      style={{
        position: "fixed",
        inset: 0,
        // Nota: no usar z-index "máximo" aquí porque bloquea overlays portaled (Select/Popover).
        zIndex: 2000,
        ...style,
      }}
      className={cn(
        "fixed inset-0 z-[2000] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-black/62 backdrop-blur-[2px]",
        className,
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, style, onPointerDownOutside, onInteractOutside, onFocusOutside, ...props }, ref) => {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        {...props}
        style={{
          // Dejar espacio para overlays portaled (Select/Popover) dentro del diálogo.
          zIndex: 2001,
          ...style,
        }}
        className={cn(
          "bg-background fixed top-[50%] left-[50%] z-[2001] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-2xl duration-200 sm:max-w-lg",
          className,
        )}
        onPointerDownOutside={(event) => {
          if (isRadixPortaledOverlayTarget(event.target)) event.preventDefault();
          onPointerDownOutside?.(event);
        }}
        onInteractOutside={(event) => {
          if (isRadixPortaledOverlayTarget(event.target)) event.preventDefault();
          onInteractOutside?.(event);
        }}
        onFocusOutside={(event) => {
          const detail = event.detail as { originalEvent?: FocusEvent } | undefined;
          const rel = detail?.originalEvent?.relatedTarget;
          const focusWentToPortal =
            (rel instanceof Element && isRadixPortaledOverlayTarget(rel)) ||
            (typeof document !== "undefined" &&
              document.activeElement instanceof Element &&
              isRadixPortaledOverlayTarget(document.activeElement));
          if (focusWentToPortal) event.preventDefault();
          onFocusOutside?.(event);
        }}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
