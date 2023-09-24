import './assets/css/main.scss'
import { createVueApp } from './createVueApp'

async function main() {
    const node = document.createElement('div')
    node.id = DEFINE.NAME

    const mainEl = document.querySelector('#primary .primary')
    mainEl?.insertBefore(node, document.querySelector('.registeredTo'))

    const app = await createVueApp()
    app.mount(node)
}

if (document.readyState !== 'loading') {
    void main()
} else {
    window.addEventListener('DOMContentLoaded', () => {
        void main()
    })
}
