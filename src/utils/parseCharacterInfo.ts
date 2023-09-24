import { Region } from '@/services/Region'

export function parseCharacterInfo() {
    const href = document.querySelector('a.armoryLink')?.getAttribute('href')
    if (!href) {
        throw new Error('Failed to parse page')
    }

    const fragments = href.split('/')
    if (fragments.length !== 7) {
        throw new Error('Failed to parse armory url')
    }

    const characterName = decodeURIComponent(fragments[6])
    const realm = decodeURIComponent(fragments[5]).normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const locale = fragments[3]
    let region: Region
    switch (locale) {
        case 'en-us': {
            region = 'us'
            break
        }
        case 'en-gb': {
            region = 'eu'
            break
        }
        default: {
            throw new Error(`Unknown locale:"${locale}"`)
        }
    }

    console.info(DEFINE.NAME, `Store::parseCharacterInfo() region:${region} realm:${realm} name:${characterName}`)
    return {
        characterName,
        realm,
        region,
    }
}
