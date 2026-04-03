import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    description?: string;
    className?: string;
    /** Short label above title, e.g. "Overview" */
    eyebrow?: string;
    action?: ReactNode;
}

export function SectionHeader({
    title,
    description,
    eyebrow,
    action,
    className,
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
                className
            )}
        >
            <div className="space-y-1.5 min-w-0">
                {eyebrow && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    eyebrow?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    eyebrow,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
                className
            )}
        >
            <div className="space-y-2 min-w-0">
                {eyebrow && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-base leading-relaxed text-muted-foreground max-w-xl">
                        {description}
                    </p>
                )}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
