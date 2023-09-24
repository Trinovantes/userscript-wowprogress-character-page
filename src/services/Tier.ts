export enum Tier {
    // BfA
    T20 = 'T20',
    T21 = 'T21',
    T22 = 'T22',
    T23 = 'T23',
    T24 = 'T24',

    // Shadowlands
    T26 = 'T26',
    T28 = 'T28',
    T29 = 'T29',

    // Dragonflight
    T31 = 'T31',
    T33 = 'T33',
}

export function getTierName(tier: Tier): string {
    switch (tier) {
        // BfA
        case Tier.T20: return 'Uldir'
        case Tier.T21: return 'Dazalor'
        case Tier.T22: return 'Cruicible of Storms'
        case Tier.T23: return 'Eternal Palance'
        case Tier.T24: return 'Nyalotha'

        // Shadowlands
        case Tier.T26: return 'Castle Nathria'
        case Tier.T28: return 'Sanctum of Domination'
        case Tier.T29: return 'Sepulcher of the First Ones '

        // Dragonflight
        case Tier.T31: return 'Vault of the Incarnates'
        case Tier.T33: return 'Aberrus, the Shadowed Crucible'

        default: {
            return 'Unknown Tier Name'
        }
    }
}
