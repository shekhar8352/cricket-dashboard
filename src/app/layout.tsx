import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Cricket Career Analytics - Sudhanshu Shekhar",
    description: "Career analytics dashboard for Sudhanshu Shekhar",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${plusJakarta.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
                >
                    Skip to content
                </a>
                <Navbar />
                <main id="main-content" className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
                    {children}
                </main>
            </body>
        </html>
    );
}
