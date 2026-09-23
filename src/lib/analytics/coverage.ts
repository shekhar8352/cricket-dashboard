import type { Coverage } from "./types";
import { round } from "./math";

export function coverage(total: number, withDetail: number): Coverage {
    return {
        total,
        withDetail,
        pct: total > 0 ? round((withDetail / total) * 100, 1) : 0,
    };
}
