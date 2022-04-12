export function getIconsBoss() {
    const imgReq = require.context('@/assets/img/bosses', true, /(\d+)\/.*\.(jpe?g|png|gif|svg)$/i)
    const images: Record<string, string> = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename) as string
    }

    return images
}
