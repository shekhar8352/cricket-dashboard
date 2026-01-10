"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PLAYER } from "@/lib/constants";

const navItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/data-entry", label: "Data Entry", icon: "✏️" },
    { href: "/analytics", label: "Analytics", icon: "📈" },
    { href: "/matches", label: "Matches", icon: "🏏" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-2xl">🏏</span>
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {PLAYER.name}
                            </h1>
                            <p className="text-xs text-gray-400">Career Analytics</p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                                )}
                            >
                                <span>{item.icon}</span>
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Player Style Badge */}
                    <div className="hidden md:flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-medium bg-emerald-900/50 text-emerald-400 rounded-full border border-emerald-800">
                            {PLAYER.battingStyle}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-amber-900/50 text-amber-400 rounded-full border border-amber-800">
                            {PLAYER.bowlingStyle}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
