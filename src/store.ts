import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Difficulty, Metric, DEFAULT_DIFFICULTY, DEFAULT_METRIC } from './Constants'
import { authenticate, fetchCharacterData, CharacterData, OptionalFilters } from './services/WarcraftLogsV2'

const KEY_WCL_CLIENT_ID = 'KEY_WCL_CLIENT_ID'
const KEY_WCL_CLIENT_SECRET = 'KEY_WCL_CLIENT_SECRET'
const KEY_WCL_ACCESS_TOKEN = 'KEY_WCL_ACCESS_TOKEN'
const KEY_FILTER_METRIC = 'KEY_FILTER_METRIC'
const KEY_FILTER_DIFFICULTY = 'KEY_FILTER_DIFFICULTY'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

export interface State {
    isLoading: boolean
    errorMessage: string

    clientId: string
    clientSecret: string
    accessToken: string

    metricFilter: Metric
    difficultyFilter: Difficulty
}

function createDefaultState(): State {
    const defaultState: State = {
        isLoading: false,
        errorMessage: '',

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

export const region = ref('')
export const realm = ref('')
export const characterName = ref('')

export const useStore = defineStore('Store', {
    state: createDefaultState,

    actions: {
        async load() {
            const [clientId, clientSecret, accessToken, metricFilter, difficultyFilter] = await Promise.all([
                await GM.getValue(KEY_WCL_CLIENT_ID, '') || '',
                await GM.getValue(KEY_WCL_CLIENT_SECRET, '') || '',
                await GM.getValue(KEY_WCL_ACCESS_TOKEN, '') || '',
                await GM.getValue(KEY_FILTER_METRIC, '') || DEFAULT_METRIC,
                await GM.getValue(KEY_FILTER_DIFFICULTY, '') || DEFAULT_DIFFICULTY,
            ])

            console.info(DEFINE.NAME, 'Store::load', `clientId:${clientId.length} clientSecret:${clientSecret.length} accessToken:${accessToken.length} metricFilter:${metricFilter} difficultyFilter:${difficultyFilter}`)

            this.$patch({
                clientId,
                clientSecret,
                accessToken,
                metricFilter: metricFilter as Metric,
                difficultyFilter: difficultyFilter as Difficulty,
            })
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

        async resetAccessToken() {
            console.info(DEFINE.NAME, 'Store::resetAccessToken')
            this.accessToken = ''
            await this.save()
        },

        async resetEverything() {
            console.info(DEFINE.NAME, 'Store::resetEverything')
            this.$reset()
            await this.save()
        },

        async authenticate() {
            try {
                this.isLoading = true
                this.errorMessage = ''

                if (!this.clientId || !this.clientSecret) {
                    throw new Error(`Missing clientId:${this.clientId} or clientSecret:${this.clientSecret}`)
                }

                const accessToken = await authenticate(this.clientId, this.clientSecret)
                this.accessToken = accessToken
                await this.save()
            } catch (err) {
                const error = err as Error
                this.errorMessage = error.message
                console.warn(DEFINE.NAME, error)
                await this.resetEverything()
            } finally {
                this.isLoading = false
            }
        },

        async fetchCharacterData(optionalFilters?: OptionalFilters): Promise<CharacterData | undefined> {
            let characterData: CharacterData | undefined

            try {
                this.isLoading = true
                this.errorMessage = ''

                if (region.value !== 'us' && region.value !== 'eu') {
                    throw new Error(`Unknown Region "${region.value}"`)
                }

                characterData = await fetchCharacterData(this.accessToken, region.value, realm.value, characterName.value, optionalFilters)
            } catch (err) {
                const error = err as Error
                this.errorMessage = error.message
                console.warn(DEFINE.NAME, error)
                await this.resetEverything()
            } finally {
                this.isLoading = false
            }

            return characterData
        },
    },
})
