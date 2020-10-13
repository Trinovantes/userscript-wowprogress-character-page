import { Regions } from './Constants'
import Vue from 'vue'

export default class CharacterPage {
    components: Array<typeof Vue>
    region: Regions
    realm: string
    name: string

    constructor() {
        console.info('Initializing CharacterPage')

        this.components = []
        this.region = Regions.Unknown
        this.realm = ''
        this.name = ''
    }

    parse(): void {
        console.info('Parsing page')

        const href = $('a.armoryLink').attr('href')
        if (!href) {
            console.warn('Failed to parse page')
            return
        }

        const fragments = href.split('/')
        const l = fragments.length
        this.name = decodeURIComponent(fragments[l - 1])
        this.realm = decodeURIComponent(fragments[l - 2]).normalize('NFD').replace(/[\u0300-\u036f]/g, '')

        const locale = fragments[l - 4]
        switch (locale) {
            case 'en-us': {
                this.region = Regions.US
                break
            }
            case 'en-gb': {
                this.region = Regions.EU
                break
            }
        }
    }

    registerComponent(component: typeof Vue): void {
        this.components.push(component)
    }

    render(): void {
        console.info('Rendering page')
        const $profile = $('.registeredTo')

        for (const [idx, Component] of Object.entries(this.components)) {
            const component = new Component({
                propsData: {
                    region: this.region,
                    realm: this.realm,
                    name: this.name,
                },
            })

            $profile.before(`<div id="app-${idx}" />`)
            component.$mount(`#app-${idx}`)
        }
    }
}
