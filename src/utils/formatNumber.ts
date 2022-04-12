export function formatNumber(val: number): string {
    if (isNaN(val)) {
        return '-'
    }

    const numFormatter = new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits: 0,
    })

    return numFormatter.format(val)
}
