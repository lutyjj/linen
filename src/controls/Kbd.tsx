import type { ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }) {
    return (
        <kbd className="rounded-input border border-b-2 border-border-strong bg-surface px-1.25 py-px font-mono text-2xs text-text-secondary">
            {children}
        </kbd>
    );
}
