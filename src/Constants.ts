// ----------------------------------------------------------------------------
// WarcraftLogs
// ----------------------------------------------------------------------------

export enum Tier {
    // BfA
    T20 = '20',
    T21 = '21',
    T22 = '22',
    T23 = '23',
    T24 = '24',

    // SL
    T26 = '26',
    T28 = '28',
    T29 = '29',
}

export function getTierName(tier: Tier): string {
    switch (tier) {
        // BfA
        case Tier.T20: return 'Uldir'
        case Tier.T21: return 'Dazalor'
        case Tier.T22: return 'Cruicible of Storms'
        case Tier.T23: return 'Eternal Palance'
        case Tier.T24: return 'Nyalotha'

        // BfA
        case Tier.T26: return 'Castle Nathria'
        case Tier.T28: return 'Sanctum of Domination'
        case Tier.T29: return 'Sepulcher of the First Ones '

        default: {
            return 'Unknown Tier Name'
        }
    }
}

export const CURRENT_TIERS = [
    Tier.T29,
    Tier.T28,
    Tier.T26,
]

export type Region = 'us' | 'eu'

export enum Difficulty {
    LFR = 'LFR',
    NORMAL = 'Normal',
    HEROIC = 'Heroic',
    MYTHIC = 'Mythic',
}

export const DEFAULT_DIFFICULTY = Difficulty.MYTHIC

export function getDifficultyShortName(difficulty: Difficulty): string {
    switch (difficulty) {
        case Difficulty.LFR: return 'LFR'
        case Difficulty.NORMAL: return 'N'
        case Difficulty.HEROIC: return 'H'
        case Difficulty.MYTHIC: return 'M'
    }
}

export function getDifficultyId(difficulty: Difficulty): number {
    switch (difficulty) {
        case Difficulty.LFR: return 1
        case Difficulty.NORMAL: return 3
        case Difficulty.HEROIC: return 4
        case Difficulty.MYTHIC: return 5
    }
}

export enum Metric {
    DPS = 'dps',
    HPS = 'hps',
    BOSSDPS ='bossdps',
}

export const DEFAULT_METRIC = Metric.DPS

// ----------------------------------------------------------------------------
// WoW
// ----------------------------------------------------------------------------

export enum WowClass {
    Unknown = 'UnknownClass',
    DeathKnight = 'deathknight',
    Druid = 'druid',
    Hunter = 'hunter',
    Mage = 'mage',
    Monk = 'monk',
    Paladin = 'paladin',
    Priest = 'priest',
    Rogue = 'rogue',
    Shaman = 'shaman',
    Warlock = 'warlock',
    Warrior = 'warrior',
    DemonHunter = 'demonhunter',
}

export function getClassName(classId: number): WowClass {
    switch (classId) {
        case 1: return WowClass.DeathKnight
        case 2: return WowClass.Druid
        case 3: return WowClass.Hunter
        case 4: return WowClass.Mage
        case 5: return WowClass.Monk
        case 6: return WowClass.Paladin
        case 7: return WowClass.Priest
        case 8: return WowClass.Rogue
        case 9: return WowClass.Shaman
        case 10: return WowClass.Warlock
        case 11: return WowClass.Warrior
        case 12: return WowClass.DemonHunter
        default: {
            return WowClass.Unknown
        }
    }
}

export type SpecInfo = {
    name: string
    role: string
}

export const specs: { [key in WowClass]: Array<SpecInfo> } = {
    [WowClass.Unknown]: [],
    [WowClass.DeathKnight]: [
        {
            name: 'Blood',
            role: 'tank',
        },
        {
            name: 'Frost',
            role: 'mdps',
        },
        {
            name: 'Unholy',
            role: 'mdps',
        },
    ],
    [WowClass.DemonHunter]: [
        {
            name: 'Havoc',
            role: 'mdps',
        },
        {
            name: 'Vengeance',
            role: 'tank',
        },
    ],
    [WowClass.Druid]: [
        {
            name: 'Balance',
            role: 'rdps',
        },
        {
            name: 'Feral',
            role: 'mdps',
        },
        {
            name: 'Guardian',
            role: 'tank',
        },
        {
            name: 'Restoration',
            role: 'healer',
        },
    ],
    [WowClass.Hunter]: [
        {
            name: 'BeastMastery',
            role: 'rdps',
        },
        {
            name: 'Marksmanship',
            role: 'rdps',
        },
        {
            name: 'Survival',
            role: 'mdps',
        },
    ],
    [WowClass.Mage]: [
        {
            name: 'Arcane',
            role: 'rdps',
        },
        {
            name: 'Fire',
            role: 'rdps',
        },
        {
            name: 'Frost',
            role: 'rdps',
        },
    ],
    [WowClass.Monk]: [
        {
            name: 'Brewmaster',
            role: 'tank',
        },
        {
            name: 'Mistweaver',
            role: 'healer',
        },
        {
            name: 'Windwalker',
            role: 'mdps',
        },
    ],
    [WowClass.Paladin]: [
        {
            name: 'Holy',
            role: 'healer',
        },
        {
            name: 'Protection',
            role: 'tank',
        },
        {
            name: 'Retribution',
            role: 'mdps',
        },
    ],
    [WowClass.Priest]: [
        {
            name: 'Discipline',
            role: 'healer',
        },
        {
            name: 'Holy',
            role: 'healer',
        },
        {
            name: 'Shadow',
            role: 'rdps',
        },
    ],
    [WowClass.Rogue]: [
        {
            name: 'Assassination',
            role: 'mdps',
        },
        {
            name: 'Outlaw',
            role: 'mdps',
        },
        {
            name: 'Subtlety',
            role: 'mdps',
        },
    ],
    [WowClass.Shaman]: [
        {
            name: 'Elemental',
            role: 'rdps',
        },
        {
            name: 'Enhancement',
            role: 'mdps',
        },
        {
            name: 'Restoration',
            role: 'healer',
        },
    ],
    [WowClass.Warlock]: [
        {
            name: 'Affliction',
            role: 'rdps',
        },
        {
            name: 'Demonology',
            role: 'rdps',
        },
        {
            name: 'Destruction',
            role: 'rdps',
        },
    ],
    [WowClass.Warrior]: [
        {
            name: 'Arms',
            role: 'mdps',
        },
        {
            name: 'Fury',
            role: 'mdps',
        },
        {
            name: 'Protection',
            role: 'tank',
        },
    ],
}
