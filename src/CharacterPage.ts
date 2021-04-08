import { createApp } from 'vue'
import { Region } from '@/Constants'
import { createRootStore, key, RootState } from './store'
import { Store } from 'vuex'

export default class CharacterPage {
    idx = 0
    store: Store<RootState>

    constructor() {
        console.info(DEFINE.NAME, 'CharacterPage::CharacterPage()')

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
                console.warn(DEFINE.NAME, 'Unknown locale', locale)
                region = 'unknown'
            }
        }

        console.info(DEFINE.NAME, 'CharacterPage::CharacterPage()', `region:${region} realm:${realm} name:${characterName}`)
        this.store = createRootStore(region, realm, characterName)
    }

    render<IComponentType>(component: IComponentType): void {
        this.idx++

        const app = createApp(component)
        app.use(this.store, key)

        const $profile = $('.registeredTo')
        $profile.before(`<div id="app-${this.idx}" />`)
        app.mount(`#app-${this.idx}`)
    }
}
