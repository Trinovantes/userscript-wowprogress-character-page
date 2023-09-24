const specIcons = (() => {
    const imgReq = require.context('@/assets/img/specs', false, /\.jpg$/i)
    const images: Record<string, string> = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename) as string
    }

    return images
})()

export function getSpecIcon(className: string, specName: string) {
    const filename = `${className}-${specName}.jpg`.toLowerCase()
    if (!(filename in specIcons)) {
        throw new Error(`Missing ${filename}`)
    }

    return specIcons[filename]
}
