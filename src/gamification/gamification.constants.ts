
export const POINTS_BY_DIFFICULTY: Record<string, number> = {
    EASY: 10,
    MEDIUM: 20,
    HARD: 40,
};

export const ON_TIME_BONUS = 5;
export const EARLY_BONUS = 10;

export interface BadgeDefinition {
    badgeNumber: number;
    milestone: number;
    title: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    { badgeNumber: 1, milestone: 5, title: 'First Steps' },
    { badgeNumber: 2, milestone: 10, title: 'Getting Started' },
    { badgeNumber: 3, milestone: 15, title: 'On a Roll' },
    { badgeNumber: 4, milestone: 20, title: 'Dedicated' },
    { badgeNumber: 5, milestone: 30, title: 'Committed' },
    { badgeNumber: 6, milestone: 40, title: 'Reliable' },
    { badgeNumber: 7, milestone: 50, title: 'Half Century' },
    { badgeNumber: 8, milestone: 75, title: 'Powerhouse' },
    { badgeNumber: 9, milestone: 100, title: 'Centurion' },
    { badgeNumber: 10, milestone: 125, title: 'Unstoppable' },
    { badgeNumber: 11, milestone: 150, title: 'Legend' },
    { badgeNumber: 12, milestone: 200, title: 'Elite' },
    { badgeNumber: 13, milestone: 250, title: 'Master' },
    { badgeNumber: 14, milestone: 300, title: 'Grandmaster' },
    { badgeNumber: 15, milestone: 400, title: 'Champion' },
    { badgeNumber: 16, milestone: 500, title: 'Ultimate' },
];
