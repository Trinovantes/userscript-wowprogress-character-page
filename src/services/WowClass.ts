export const enum WowClass {
    Unknown = 0,
    DeathKnight = 1,
    Druid = 2,
    Hunter = 3,
    Mage = 4,
    Monk = 5,
    Paladin = 6,
    Priest = 7,
    Rogue = 8,
    Shaman = 9,
    Warlock = 10,
    Warrior = 11,
    DemonHunter = 12,
    Evoker = 13,
}

export function getClassName(wowClassId?: number): string {
    switch (wowClassId) {
        case WowClass.DeathKnight:
            return 'deathknight'
        case WowClass.Druid:
            return 'druid'
        case WowClass.Hunter:
            return 'hunter'
        case WowClass.Mage:
            return 'mage'
        case WowClass.Monk:
            return 'monk'
        case WowClass.Paladin:
            return 'paladin'
        case WowClass.Priest:
            return 'priest'
        case WowClass.Rogue:
            return 'rogue'
        case WowClass.Shaman:
            return 'shaman'
        case WowClass.Warlock:
            return 'warlock'
        case WowClass.Warrior:
            return 'warrior'
        case WowClass.DemonHunter:
            return 'demonhunter'
        case WowClass.Evoker:
            return 'evoker'
        default:
            return 'UnknownClass'
    }
}

export function getClassSpecs(wowClassId?: number): Array<{ name: string; role: string }> {
    switch (wowClassId) {
        case WowClass.DeathKnight:
            return [
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
            ]

        case WowClass.Druid:
            return [
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
            ]

        case WowClass.Hunter:
            return [
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
            ]

        case WowClass.Mage:
            return [
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
            ]

        case WowClass.Monk:
            return [
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
            ]

        case WowClass.Paladin:
            return [
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
            ]

        case WowClass.Priest:
            return [
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
            ]

        case WowClass.Rogue:
            return [
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
            ]

        case WowClass.Shaman:
            return [
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
            ]

        case WowClass.Warlock:
            return [
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
            ]

        case WowClass.Warrior:
            return [
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
            ]

        case WowClass.DemonHunter:
            return [
                {
                    name: 'Havoc',
                    role: 'mdps',
                },
                {
                    name: 'Vengeance',
                    role: 'tank',
                },
            ]
        case WowClass.Evoker:
            return [
                {
                    name: 'Devastation',
                    role: 'rdps',
                },
                {
                    name: 'Augmentation',
                    role: 'rdps',
                },
                {
                    name: 'Preservation',
                    role: 'healer',
                },
            ]

        default:
            return []
    }
}
