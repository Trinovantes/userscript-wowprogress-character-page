import { defineStore } from 'pinia'
import { authenticate, fetchCharacterData, CharacterData, OptionalFilters } from '../services/WarcraftLogsV2'
import { sleep } from '@/utils/sleep'
import { parseCharacterInfo } from '@/utils/parseCharacterInfo'
import { DEFAULT_METRIC, DEFAULT_DIFFICULTY } from '@/Constants'
import { Difficulty } from '@/services/Difficulty'
import { Metric } from '@/services/Metric'
import { Region } from '@/services/Region'

const KEY_WCL_CLIENT_ID = 'KEY_WCL_CLIENT_ID'
const KEY_WCL_CLIENT_SECRET = 'KEY_WCL_CLIENT_SECRET'
const KEY_WCL_ACCESS_TOKEN = 'KEY_WCL_ACCESS_TOKEN'
const KEY_FILTER_METRIC = 'KEY_FILTER_METRIC'
const KEY_FILTER_DIFFICULTY = 'KEY_FILTER_DIFFICULTY'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

export type State = {
    // Per page load
    isLoading: boolean
    errorMessage: string | null
    characterName: string | null
    realm: string | null
    region: Region | null

    // Persistent in userscript storage
    clientId: string
    clientSecret: string
    accessToken: string
    metricFilter: Metric
    difficultyFilter: Difficulty
}

function createDefaultState(): State {
    const { characterName, realm, region } = parseCharacterInfo()
    const defaultState: State = {
        isLoading: false,
        errorMessage: null,

        characterName,
        realm,
        region,

        clientId: '',
        clientSecret: '',
        accessToken: '',
        metricFilter: DEFAULT_METRIC,
        difficultyFilter: DEFAULT_DIFFICULTY,
    }

    return defaultState
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

export const useStore = defineStore('Store', {
    state: createDefaultState,

    actions: {
        async load() {
            const [clientId, clientSecret, accessToken, metricFilter, difficultyFilter] = await Promise.all([
                await GM.getValue(KEY_WCL_CLIENT_ID, ''),
                await GM.getValue(KEY_WCL_CLIENT_SECRET, ''),
                await GM.getValue(KEY_WCL_ACCESS_TOKEN, ''),
                await GM.getValue(KEY_FILTER_METRIC, DEFAULT_METRIC),
                await GM.getValue(KEY_FILTER_DIFFICULTY, DEFAULT_DIFFICULTY),
            ])

            this.$patch({
                clientId,
                clientSecret,
                accessToken,
                metricFilter,
                difficultyFilter,
            })

            console.info(DEFINE.NAME, 'Store::load', `clientId:${clientId.length} clientSecret:${clientSecret.length} accessToken:${accessToken.length} metricFilter:${metricFilter} difficultyFilter:${difficultyFilter}`)

            // If we stored clientId and clientSecret from previous session, try to authenticate with it
            if (clientId && clientSecret) {
                await this.authenticate()
            }
        },

        async save() {
            console.info(DEFINE.NAME, 'Store::save', `clientId:${this.clientId.length} clientSecret:${this.clientSecret.length} accessToken:${this.accessToken.length} metricFilter:${this.metricFilter} difficultyFilter:${this.difficultyFilter}`)

            await Promise.all([
                GM.setValue(KEY_WCL_CLIENT_ID, this.clientId),
                GM.setValue(KEY_WCL_CLIENT_SECRET, this.clientSecret),
                GM.setValue(KEY_WCL_ACCESS_TOKEN, this.accessToken),
                GM.setValue(KEY_FILTER_METRIC, this.metricFilter),
                GM.setValue(KEY_FILTER_DIFFICULTY, this.difficultyFilter),
            ])
        },

        async resetAuth() {
            console.info(DEFINE.NAME, 'Store::resetAuth')
            this.$patch({
                clientId: '',
                clientSecret: '',
                accessToken: '',
            })
            await this.save()
        },

        async resetSettings() {
            console.info(DEFINE.NAME, 'Store::resetSettings')
            this.$reset()
            await this.save()
        },

        async authenticate() {
            this.errorMessage = ''
            this.isLoading = true
            console.info(DEFINE.NAME, 'Store::authenticate')

            try {
                if (!this.clientId || !this.clientSecret) {
                    await sleep(250)
                    throw new Error('Missing clientId and/or clientSecret')
                }

                const accessToken = await authenticate(this.clientId, this.clientSecret)
                this.accessToken = accessToken
                await this.save()
            } catch (err) {
                this.errorMessage = (err as Error).message
                await this.resetAuth()
            } finally {
                this.isLoading = false
            }
        },

        async fetchCharacterData(optionalFilters?: OptionalFilters): Promise<CharacterData | undefined> {
            this.errorMessage = ''
            this.isLoading = true
            console.info(DEFINE.NAME, 'Store::fetchCharacterData')

            if (!this.region) {
                this.errorMessage = `Invalid region:${this.region}`
                return
            }
            if (!this.realm) {
                this.errorMessage = `Invalid realm:${this.realm}`
                return
            }
            if (!this.characterName) {
                this.errorMessage = `Invalid characterName:${this.characterName}`
                return
            }

            let characterData: CharacterData | undefined

            try {
                characterData = await fetchCharacterData(this.accessToken, this.region, this.realm, this.characterName, optionalFilters)
            } catch (err) {
                this.errorMessage = (err as Error).message
                await this.resetAuth()
            } finally {
                this.isLoading = false
            }

            return characterData
        },
    },
})
