import { createApp } from 'vue'
import { Region, TAG } from '@/Constants'
import { createRootStore, key, RootState } from './store'
import { Store } from 'vuex'

export default class CharacterPage {
    static idx = 0

    store: Store<RootState>

    constructor() {
        console.info(TAG, 'CharacterPage::parse()')

        const href = $('a.armoryLink').attr('href')
        if (!href) {
            throw new Error('Failed to parse page')
        }

        const fragments = href.split('/')
        const len = fragments.length
        const characterName = decodeURIComponent(fragments[len - 1])
        const realm = decodeURIComponent(fragments[len - 2]).normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        let region: Region
        const locale = fragments[len - 4]
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
                console.warn(TAG, 'Unknown locale', locale)
                region = 'unknown'
            }
        }

        console.info(TAG, 'CharacterPage::parsed()', `region:${region} realm:${realm} name:${characterName}`)
        this.store = createRootStore(region, realm, characterName)
    }

    render<IComponentType>(component: IComponentType): void {
        const $profile = $('.registeredTo')

        const app = createApp(component)
        app.use(this.store, key)

        $profile.before(`<div id="app-${CharacterPage.idx}" />`)
        app.mount(`#app-${CharacterPage.idx}`)
    }
}
