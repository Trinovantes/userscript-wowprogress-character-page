// ----------------------------------------------------------------------------
// Raid Info
// ----------------------------------------------------------------------------

export enum Tiers {
    // Dirty hack to work with GraphQL aliases
    // We need to use aliases when we request the same field (zoneRankings) with different args
    // But since our aliases must be type checked [key in Tiers], any other fields that we request must also be in this enum
    classID = 'classID',
    canonicalID = 'canonicalID',

    T20 = 'T20',
    T21 = 'T21',
    T22 = 'T22',
    T23 = 'T23',
    T24 = 'T24',
}

export function getTierName(tier: Tiers): string {
    switch (tier) {
        case Tiers.T20: return 'Uldir'
        case Tiers.T21: return 'Dazalor'
        case Tiers.T22: return 'Cruicible of Storms'
        case Tiers.T23: return 'Eternal Palance'
        case Tiers.T24: return 'Nyalotha'
        default: {
            throw new Error(`Unknown tier:${tier}`)
        }
    }
}

export const CurrentTiers: Array<Tiers> = [
    Tiers.T24,
]

// ----------------------------------------------------------------------------
// WarcraftLogs
// ----------------------------------------------------------------------------

export enum Regions {
    Unknown = 'unknown',
    US = 'us',
    EU = 'eu',
}

export enum Difficulty {
    LFR = 1,
    Normal = 3,
    Heroic = 4,
    Mythic = 5,
}

export enum Metrics {
    Default = 'default',
    DPS = 'dps',
    HPS = 'hps',
}

// ----------------------------------------------------------------------------
// WoW
// ----------------------------------------------------------------------------

export enum Classes {
    Unknown = 'Unknown',
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

export interface ISpecInfo {
    name: string,
    role: string,
}

export const Specs: { [key in Classes]: Array<ISpecInfo> } = {
    [Classes.Unknown]: [],
    [Classes.DeathKnight]: [
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
    [Classes.DemonHunter]: [
        {
            name: 'Havoc',
            role: 'mdps',
        },
        {
            name: 'Vengeance',
            role: 'tank',
        },
    ],
    [Classes.Druid]: [
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
    [Classes.Hunter]: [
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
    [Classes.Mage]: [
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
    [Classes.Monk]: [
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
    [Classes.Paladin]: [
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
    [Classes.Priest]: [
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
    [Classes.Rogue]: [
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
    [Classes.Shaman]: [
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
    [Classes.Warlock]: [
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
    [Classes.Warrior]: [
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
