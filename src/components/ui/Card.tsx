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
                "rounded-xl border bg-gray-900/50 p-6",
                variant === "stat" && "border-gray-800 hover:border-gray-700 transition-colors",
                variant === "highlight" && "border-blue-800 bg-blue-950/30",
                variant === "default" && "border-gray-800",
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
            className={cn("text-lg font-semibold text-white", className)}
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
        <p className={cn("text-sm text-gray-400", className)} {...props}>
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
        <Card variant="stat" className={cn("relative overflow-hidden", className)}>
            {icon && (
                <span className="absolute top-4 right-4 text-3xl opacity-20">{icon}</span>
            )}
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            {trend && (
                <div
                    className={cn(
                        "mt-2 inline-flex items-center text-sm",
                        trend.isPositive ? "text-emerald-400" : "text-red-400"
                    )}
                >
                    <span>{trend.isPositive ? "↑" : "↓"}</span>
                    <span className="ml-1">{Math.abs(trend.value)}%</span>
                </div>
            )}
        </Card>
    );
}
