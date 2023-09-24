export enum Difficulty {
    LFR = '1',
    NORMAL = '3',
    HEROIC = '4',
    MYTHIC = '5',
}

export function getDifficultyShortName(difficulty: Difficulty): string {
    switch (difficulty) {
        case Difficulty.LFR: return 'LFR'
        case Difficulty.NORMAL: return 'N'
        case Difficulty.HEROIC: return 'H'
        case Difficulty.MYTHIC: return 'M'
    }
}

export function getDifficultyFullName(difficulty: Difficulty): string {
    switch (difficulty) {
        case Difficulty.LFR: return 'LFR'
        case Difficulty.NORMAL: return 'Normal'
        case Difficulty.HEROIC: return 'Heroic'
        case Difficulty.MYTHIC: return 'Mythic'
    }
}
