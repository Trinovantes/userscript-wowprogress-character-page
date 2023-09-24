const bossIcons = (() => {
    const imgReq = require.context('@/assets/img/bosses/current', true, /(\d{2})\/(\d{4})\.jpg$/i)
    const images: Record<string, string> = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename) as string
    }

    return images
})()

export function getBossIcon(zoneId: number, encounterId: number) {
    const filename = `${zoneId}/${encounterId}.jpg`
    if (!(filename in bossIcons)) {
        throw new Error(`Missing ${filename}`)
    }

    return bossIcons[filename]
}
