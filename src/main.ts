import './assets/css/main.scss'
import { createApp } from 'vue'
import UserscriptApp from './components/UserscriptApp.vue'
import { createPinia } from 'pinia'
import { characterName, realm, region } from './store'

function parseCharacterInfo() {
    const href = $('a.armoryLink').attr('href')
    if (!href) {
        throw new Error('Failed to parse page')
    }

    const fragments = href.split('/')
    const len = fragments.length

    characterName.value = decodeURIComponent(fragments[len - 1])
    realm.value = decodeURIComponent(fragments[len - 2]).normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const locale = fragments[len - 4]
    switch (locale) {
        case 'en-us': {
            region.value = 'us'
            break
        }
        case 'en-gb': {
            region.value = 'eu'
            break
        }
        default: {
            throw new Error(`Unknown locale:"${locale}"`)
        }
    }

    console.info(DEFINE.NAME, `region:${region.value} realm:${realm.value} name:${characterName.value}`)
}

async function main() {
    await $.when($.ready)

    parseCharacterInfo()

    const appContainerId = 'userscript-app'
    const $profile = $('.registeredTo')
    $profile.before(`<div id="${appContainerId}" />`)

    const app = createApp(UserscriptApp)
    const pinia = createPinia()
    app.use(pinia)
    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
