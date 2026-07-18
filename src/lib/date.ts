export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysBetween(dateA: string, dateB: string): number {
    return (new Date(dateA).getTime() - new Date(dateB).getTime()) / MS_PER_DAY;
}
