"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PLAYER } from "@/lib/constants";
import {
    LayoutDashboard,
    FileEdit,
    BarChart3,
    Trophy,
    ListOrdered,
    Menu,
    X,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/matches", label: "Matches", icon: Trophy },
    { href: "/series", label: "Series", icon: ListOrdered },
    { href: "/data-entry", label: "Data entry", icon: FileEdit },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 surface-nav">
            <nav className="mx-auto flex h-[3.75rem] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6" aria-label="Main">
                <Link
                    href="/"
                    className="flex min-w-0 items-center gap-3 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-lg"
                        aria-hidden
                    >
                        🏏
                    </div>
                    <div className="hidden min-w-0 sm:block">
                        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                            {PLAYER.name}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Career analytics
                        </p>
                    </div>
                </Link>

                <div className="hidden md:flex md:flex-1 md:justify-center">
                    <div
                        className="inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-card/40 p-1"
                        role="tablist"
                        aria-label="Primary pages"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/25"
                                            : "text-muted-foreground hover:bg-card hover:text-foreground"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon size={17} strokeWidth={1.75} aria-hidden />
                                    <span className="hidden lg:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden items-center gap-2 lg:flex">
                    <span className="rounded-md border border-border/80 bg-card/50 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {PLAYER.battingStyle}
                    </span>
                    <span className="rounded-md border border-border/80 bg-card/50 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {PLAYER.bowlingStyle}
                    </span>
                </div>

                <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-card hover:text-foreground md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls="mobile-nav-menu"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </nav>

            {isOpen ? (
                <div
                    id="mobile-nav-menu"
                    className="border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden"
                >
                    <div className="mx-auto max-w-[1400px] space-y-1 px-4 py-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-base font-medium",
                                        isActive
                                            ? "bg-primary/15 text-foreground"
                                            : "text-muted-foreground hover:bg-card"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon size={20} strokeWidth={1.75} aria-hidden />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
                            <span className="rounded-md border border-border/80 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {PLAYER.battingStyle}
                            </span>
                            <span className="rounded-md border border-border/80 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                {PLAYER.bowlingStyle}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}
