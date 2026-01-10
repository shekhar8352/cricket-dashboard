"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PLAYER } from "@/lib/constants";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import FileEdit from "lucide-react/dist/esm/icons/file-edit";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/data-entry", label: "Data Entry", icon: FileEdit },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/matches", label: "Matches", icon: Trophy },
];

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform">
                            🏏
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                                {PLAYER.name}
                            </h1>
                            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mt-1">
                                Career Analytics
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Player Style Badge */}
                    <div className="hidden lg:flex items-center gap-2">
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                            {PLAYER.battingStyle}
                        </span>
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                            {PLAYER.bowlingStyle}
                        </span>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden glass border-t border-white/5 animate-in slide-in-from-top duration-300">
                    <div className="container mx-auto px-4 py-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                                        isActive
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        <div className="pt-4 flex items-center gap-2">
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                {PLAYER.battingStyle}
                            </span>
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                                {PLAYER.bowlingStyle}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
