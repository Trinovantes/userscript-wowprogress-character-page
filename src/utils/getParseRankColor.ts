export function getParseRankColor(rank: number | undefined): string {
    if (rank === undefined || isNaN(rank)) {
        return 'inherit'
    }

    let color = ''
    if (rank < 25) {
        color = 'common'
    } else if (rank < 50) {
        color = 'uncommon'
    } else if (rank < 75) {
        color = 'rare'
    } else if (rank < 95) {
        color = 'epic'
    } else if (rank < 99) {
        color = 'legendary'
    } else if (rank < 100) {
        color = 'astounding'
    } else if (rank === 100) {
        color = 'artifact'
    } else {
        return 'inherit'
    }

    return `var(--${color})`
}
