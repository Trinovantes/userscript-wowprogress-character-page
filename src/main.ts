import './assets/css/main.scss'
import { Region } from './Constants'
import { createRootStore, key } from './store'
import { createApp } from 'vue'
import UserscriptApp from './components/UserscriptApp.vue'

async function main() {
    await $.when($.ready)

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
            throw new Error(`Unknown locale:"${locale}"`)
        }
    }

    console.info(DEFINE.NAME, `region:${region} realm:${realm} name:${characterName}`)

    const appContainerId = 'userscript-app'
    const $profile = $('.registeredTo')
    $profile.before(`<div id="${appContainerId}" />`)

    const store = createRootStore(region, realm, characterName)
    const app = createApp(UserscriptApp)
    app.use(store, key)
    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
