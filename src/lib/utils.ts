import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Calculate strike rate from runs and balls
 */
export function calculateStrikeRate(runs: number, balls: number): number {
    if (balls === 0) return 0;
    return parseFloat(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate economy rate from runs and overs
 */
export function calculateEconomy(runs: number, overs: number): number {
    if (overs === 0) return 0;
    return parseFloat((runs / overs).toFixed(2));
}

/**
 * Calculate bowling average from runs and wickets
 */
export function calculateBowlingAverage(
    runs: number,
    wickets: number
): number | null {
    if (wickets === 0) return null;
    return parseFloat((runs / wickets).toFixed(2));
}

/**
 * Calculate batting average from runs and dismissals
 */
export function calculateBattingAverage(
    runs: number,
    innings: number,
    notOuts: number
): number | null {
    const dismissals = innings - notOuts;
    if (dismissals === 0) return null;
    return parseFloat((runs / dismissals).toFixed(2));
}

/**
 * Calculate bowling strike rate from balls and wickets
 */
export function calculateBowlingStrikeRate(
    balls: number,
    wickets: number
): number | null {
    if (wickets === 0) return null;
    return parseFloat((balls / wickets).toFixed(2));
}

/**
 * Convert overs decimal to balls (e.g., 3.4 -> 22 balls)
 */
export function oversToBalls(overs: number): number {
    const fullOvers = Math.floor(overs);
    const partialBalls = Math.round((overs - fullOvers) * 10);
    return fullOvers * 6 + partialBalls;
}

/**
 * Convert balls to overs decimal (e.g., 22 -> 3.4)
 */
export function ballsToOvers(balls: number): number {
    const fullOvers = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return parseFloat(`${fullOvers}.${remainingBalls}`);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
}

/**
 * Format bowling figures (e.g., "3/24")
 */
export function formatBowlingFigures(wickets: number, runs: number): string {
    return `${wickets}/${runs}`;
}

/**
 * Format batting score (e.g., "45" or "45*" for not out)
 */
export function formatBattingScore(runs: number, isNotOut: boolean): string {
    return isNotOut ? `${runs}*` : `${runs}`;
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Safely parse JSON with fallback
 */
export function safeParseJSON<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

/**
 * Build query string from object
 */
export function buildQueryString(
    params: Record<string, string | number | boolean | undefined>
): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}

/**
 * Delay execution (for testing/animations)
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a color for a given string (for consistent chart colors)
 */
export function stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + "...";
}
