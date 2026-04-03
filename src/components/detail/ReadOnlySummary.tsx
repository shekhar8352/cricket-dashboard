import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft, type LucideIcon } from "lucide-react";

export function humanizeKey(s: string): string {
    return s
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}

export function DetailBackLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card/50 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden className="transition-transform group-hover:-translate-x-0.5" />
            </span>
            {children}
        </Link>
    );
}

export function DetailHero({
    eyebrow,
    title,
    titleAccent,
    subtitle,
    meta,
    action,
    resultBand,
    children,
}: {
    eyebrow: string;
    title: string;
    titleAccent?: string;
    subtitle: string;
    meta?: ReactNode;
    action?: ReactNode;
    resultBand?: { label: string; className: string };
    children?: ReactNode;
}) {
    return (
        <header
            className={cn(
                "detail-hero-mesh detail-hero-edge relative overflow-hidden rounded-2xl border border-border/70 p-6 sm:p-8",
                "animate-detail-in"
            )}
        >
            <div
                className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/60 to-primary/20 sm:w-1.5"
                aria-hidden
            />
            <div className="relative flex flex-col gap-6 pl-3 sm:pl-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/90">{eyebrow}</p>
                    <h1 className="font-sans text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                        {title}
                        {titleAccent ? (
                            <>
                                {" "}
                                <span className="text-gradient">{titleAccent}</span>
                            </>
                        ) : null}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
                    {meta ? <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div> : null}
                    {children}
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-start lg:flex-col">
                    {resultBand ? (
                        <div
                            className={cn(
                                "rounded-xl border px-4 py-3 text-center sm:min-w-[8.5rem]",
                                resultBand.className
                            )}
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] opacity-80">Result</p>
                            <p className="mt-1 font-mono text-lg font-semibold tabular-nums tracking-tight">
                                {resultBand.label}
                            </p>
                        </div>
                    ) : null}
                    {action}
                </div>
            </div>
        </header>
    );
}

export function DetailPill({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-lg border border-border/80 bg-background/40 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm",
                className
            )}
        >
            {children}
        </span>
    );
}

export function StatTile({
    label,
    value,
    hint,
    className,
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    className?: string;
}) {
    return (
        <div className={cn("detail-stat-tile", className)}>
            <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                    {value}
                </p>
                {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
            </div>
        </div>
    );
}

export function SectionPanel({
    icon: Icon,
    title,
    description,
    children,
    animationDelayMs,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
    children: ReactNode;
    animationDelayMs?: number;
}) {
    return (
        <section
            className="animate-detail-in overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-sm shadow-black/15 backdrop-blur-sm"
            style={animationDelayMs ? { animationDelay: `${animationDelayMs}ms` } : undefined}
        >
            <div className="flex items-start gap-3 border-b border-border/60 bg-gradient-to-r from-primary/[0.06] to-transparent px-5 py-4 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 pt-0.5">
                    <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
                    {description ? (
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    ) : null}
                </div>
            </div>
            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

export function DefinitionGrid({
    items,
    columns = 2,
}: {
    items: { label: string; value: ReactNode; fullWidth?: boolean }[];
    columns?: 1 | 2 | 3;
}) {
    const col =
        columns === 3
            ? "sm:grid-cols-2 lg:grid-cols-3"
            : columns === 2
              ? "sm:grid-cols-2"
              : "grid-cols-1";

    return (
        <dl className={cn("grid gap-4", col)}>
            {items.map((item) => (
                <div
                    key={item.label}
                    className={cn(
                        "rounded-xl border border-border/50 bg-background/25 px-4 py-3",
                        item.fullWidth && columns !== 1 && "sm:col-span-2 lg:col-span-3"
                    )}
                >
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm font-medium leading-snug text-foreground">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            {message}
        </p>
    );
}

export function PerformanceInningsCard({
    title,
    variant,
    children,
}: {
    title: string;
    variant: "bat" | "bowl";
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border p-4",
                variant === "bat"
                    ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                    : "border-sky-500/20 bg-sky-500/[0.04]"
            )}
        >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

export function DetailFooterNote({ children }: { children: ReactNode }) {
    return (
        <footer className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-xs text-muted-foreground">
            {children}
        </footer>
    );
}
