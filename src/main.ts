import './assets/css/main.scss'
import { createVueApp } from './createVueApp'

async function main() {
    await $.when($.ready)

    const appContainerId = DEFINE.NAME
    const $profile = $('.registeredTo')
    $profile.before(`<div id="${appContainerId}" />`)

    const app = await createVueApp()
    app.mount(`#${appContainerId}`)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
