import type { InningsBattingFormData, InningsBowlingFormData } from "@/types";

function n(value: unknown): number {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function battingConsistencyWarnings(batting?: InningsBattingFormData): string[] {
    if (!batting || batting.didNotBat || !batting.detail) return [];
    const detail = batting.detail;
    const warnings: string[] = [];
    const balls = n(batting.ballsFaced);
    const runs = n(batting.runs);
    const shotBalls = [detail.dots, detail.singles, detail.twos, detail.threes, batting.fours, batting.sixes];
    if (shotBalls.some((value) => n(value) > 0)) {
        const sum = shotBalls.reduce<number>((total, value) => total + n(value), 0);
        if (sum !== balls) {
            warnings.push(`Dots, 1s, 2s, 3s, 4s and 6s add up to ${sum} balls, while balls faced is ${balls}.`);
        }
    }
    const phases = detail.phases || [];
    if (phases.some((phase) => n(phase.runs) > 0 || n(phase.balls) > 0)) {
        const phaseRuns = phases.reduce((total, phase) => total + n(phase.runs), 0);
        if (phaseRuns !== runs) {
            warnings.push(`Phase runs add up to ${phaseRuns}, while the innings total is ${runs}.`);
        }
    }
    const pace = n(detail.vsPace?.runs);
    const spin = n(detail.vsSpin?.runs);
    if (n(detail.vsPace?.balls) + n(detail.vsSpin?.balls) > 0 && pace + spin !== runs) {
        warnings.push(`Pace runs (${pace}) plus spin runs (${spin}) do not equal ${runs}.`);
    }
    return warnings;
}

export function bowlingConsistencyWarnings(bowling?: InningsBowlingFormData): string[] {
    if (!bowling || bowling.didNotBowl || !bowling.detail) return [];
    const warnings: string[] = [];
    const phases = bowling.detail.phases || [];
    if (phases.some((phase) => n(phase.runs) > 0 || n(phase.balls) > 0 || n(phase.wickets) > 0)) {
        const phaseRuns = phases.reduce((total, phase) => total + n(phase.runs), 0);
        const phaseWickets = phases.reduce((total, phase) => total + n(phase.wickets), 0);
        if (phaseRuns !== n(bowling.runsConceded)) {
            warnings.push(`Phase runs add up to ${phaseRuns}, while runs conceded are ${n(bowling.runsConceded)}.`);
        }
        if (phaseWickets !== n(bowling.wickets)) {
            warnings.push(`Phase wickets add up to ${phaseWickets}, while wickets taken are ${n(bowling.wickets)}.`);
        }
    }
    return warnings;
}
