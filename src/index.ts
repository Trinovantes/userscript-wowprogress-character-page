import CharacterPage from '@/CharacterPage'
import '@/assets/css/main.scss'
import WarcraftLogsContainer from '@/components/WarcraftLogsContainer.vue'
import { TAG } from '@/Constants'

try {
    const characterPage = new CharacterPage()
    characterPage.render(WarcraftLogsContainer)
} catch (error) {
    console.warn(TAG, error)
}
