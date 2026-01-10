import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "stat" | "highlight";
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
                "glass-card rounded-2xl p-6",
                variant === "highlight" && "border-blue-500/30 bg-blue-600/5",
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
        <div className={cn("flex flex-col space-y-1.5", className)} {...props}>
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
            className={cn("text-lg font-bold text-white tracking-tight", className)}
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
        <p className={cn("text-sm text-gray-400 font-medium", className)} {...props}>
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

// Stat Card Component
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
        <Card variant="stat" className={cn("relative group overflow-hidden", className)}>
            <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none grayscale">
                {icon}
            </div>

            <div className="relative">
                <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-xl">{icon}</span>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
                </div>

                <p className="text-3xl font-black text-white tracking-tight leading-none mb-1">
                    {value}
                </p>

                {subtitle && (
                    <p className="text-xs font-medium text-blue-400">{subtitle}</p>
                )}

                {trend && (
                    <div
                        className={cn(
                            "mt-3 inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            trend.isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                        )}
                    >
                        <span>{trend.isPositive ? "↑" : "↓"}</span>
                        <span className="ml-1">{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 group-hover:w-full transition-all duration-500" />
        </Card>
    );
}
