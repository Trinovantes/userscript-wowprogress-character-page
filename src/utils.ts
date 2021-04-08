export function formatPercent(val: number): string {
    if (isNaN(val)) {
        return '-'
    }

    const percentFormatter = new Intl.NumberFormat(navigator.language, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        style: 'percent',
    })

    return percentFormatter.format(val)
}

export function formatNum(val: number): string {
    if (isNaN(val)) {
        return '-'
    }
    const numFormatter = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 0,
    })
    return numFormatter.format(val)
}

export function getRankColor(rank: number | undefined): string {
    if (!rank || isNaN(rank)) {
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

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
