/** Shared numeric helpers for career stats. Overs are cricket notation (3.2 = 20 balls). */

export function round(n: number, digits = 2): number {
    if (!Number.isFinite(n)) return 0;
    const f = 10 ** digits;
    return Math.round(n * f) / f;
}

export function oversToBalls(overs: number): number {
    if (!Number.isFinite(overs) || overs <= 0) return 0;
    const full = Math.floor(overs);
    const partial = Math.round((overs - full) * 10);
    return full * 6 + Math.min(partial, 5);
}

export function ballsToOvers(balls: number): number {
    if (!Number.isFinite(balls) || balls <= 0) return 0;
    const full = Math.floor(balls / 6);
    const rem = balls % 6;
    return Number(`${full}.${rem}`);
}

export function finite(value: unknown): number | undefined {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

export function stddev(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    return round(Math.sqrt(variance), 2);
}

export function clamp(n: number, min = 0, max = 100): number {
    return Math.min(max, Math.max(min, n));
}

export function average(values: number[]): number | null {
    if (values.length === 0) return null;
    return round(values.reduce((a, b) => a + b, 0) / values.length, 2);
}
