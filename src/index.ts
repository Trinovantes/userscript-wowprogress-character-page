import CharacterPage from '@/CharacterPage'
import WarcraftLogsContainer from '@/components/WarcraftLogsContainer.vue'
import '@/assets/css/main.scss'

async function main() {
    await $.when($.ready)

    const characterPage = new CharacterPage()
    characterPage.render(WarcraftLogsContainer)
}

main().catch((err) => {
    console.warn(DEFINE.NAME, err)
})
