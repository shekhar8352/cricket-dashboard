import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "stat" | "highlight" | "chart" | "panel";
}

export function Card({
    className,
    variant = "default",
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border/80 bg-card/80 p-6 shadow-sm shadow-black/10",
                variant === "highlight" && "border-primary/25 bg-primary/5",
                variant === "stat" && "p-5",
                variant === "chart" &&
                    "surface-chart p-4 sm:p-5 shadow-none border-border/50 bg-card/30",
                variant === "panel" && "surface-panel",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col space-y-1", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "text-sm font-semibold tracking-tight text-foreground",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function CardDescription({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("mt-4", className)} {...props}>
            {children}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    trend?: { value: number; isPositive: boolean };
    className?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card variant="stat" className={cn("relative overflow-hidden group", className)}>
            <div className="absolute -right-3 -top-3 text-5xl opacity-[0.04] pointer-events-none select-none">
                {icon}
            </div>

            <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                    {icon ? <span className="text-lg leading-none" aria-hidden>{icon}</span> : null}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {title}
                    </p>
                </div>

                <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.65rem]">
                    {value}
                </p>

                {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}

                {trend && (
                    <div
                        className={cn(
                            "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            trend.isPositive
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                : "border-red-500/25 bg-red-500/10 text-red-400"
                        )}
                    >
                        <span>{trend.isPositive ? "↑" : "↓"}</span>
                        <span className="ml-1 tabular-nums">{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 h-px w-0 bg-primary/60 group-hover:w-full transition-all duration-500" />
        </Card>
    );
}
