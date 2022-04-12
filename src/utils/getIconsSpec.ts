export function getIconsSpec() {
    const imgReq = require.context('@/assets/img/specs', false, /\.(jpe?g|png|gif|svg)$/i)
    const images: Record<string, string> = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename) as string
    }

    return images
}
