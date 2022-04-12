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
