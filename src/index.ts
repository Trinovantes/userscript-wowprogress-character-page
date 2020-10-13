'use strict'

import CharacterPage from './CharacterPage'
import WarcraftLogsContainer from './components/WarcraftLogsContainer.vue'

function main() {
    try {
        const characterPage = new CharacterPage()
        characterPage.parse()
        characterPage.registerComponent(WarcraftLogsContainer)
        characterPage.render()
    } catch (error) {
        console.warn(error)
    }
}

import '@css/main.scss'
void main()
