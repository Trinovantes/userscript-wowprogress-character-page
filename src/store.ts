import { InjectionKey } from 'vue'
import { createStore, Store, useStore, MutationTree, ActionTree } from 'vuex'
import { Difficulty, Metric, TAG, DEFAULT_DIFFICULTY, DEFAULT_METRIC } from '@/Constants'
import { authenticate, fetchCharacterData, OptionalFilters, CharacterData } from '@/models/WarcraftLogsV2'

const KEY_WCL_CLIENT_ID = 'KEY_WCL_CLIENT_ID'
const KEY_WCL_CLIENT_SECRET = 'KEY_WCL_CLIENT_SECRET'
const KEY_WCL_ACCESS_TOKEN = 'KEY_WCL_ACCESS_TOKEN'
const KEY_FILTER_METRIC = 'KEY_FILTER_METRIC'
const KEY_FILTER_DIFFICULTY = 'KEY_FILTER_DIFFICULTY'

export interface RootState {
    isLoading: boolean
    errorMessage: string

    region: string
    realm: string
    characterName: string

    clientId: string
    clientSecret: string
    accessToken: string

    metricFilter: Metric
    difficultyFilter: Difficulty
    characterData: CharacterData | null
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<RootState>> = Symbol()
export function useTypedStore(): Store<RootState> {
    return useStore(key)
}

export function createRootStore(region: string, realm: string, characterName: string): Store<RootState> {
    const state = () => {
        const defaultState: RootState = {
            isLoading: false,
            errorMessage: '',

            region,
            realm,
            characterName,

            clientId: '',
            clientSecret: '',
            accessToken: '',

            metricFilter: DEFAULT_METRIC,
            difficultyFilter: DEFAULT_DIFFICULTY,
            characterData: null,
        }

        return defaultState
    }

    const mutations: MutationTree<RootState> = {
        setIsLoading(state: RootState, payload: boolean) {
            state.isLoading = payload
        },
        setErrorMessage(state: RootState, payload: string) {
            state.errorMessage = payload.trim()
        },
        setClientId(state: RootState, payload: string) {
            state.clientId = payload.trim()
        },
        setClientSecret(state: RootState, payload: string) {
            state.clientSecret = payload.trim()
        },
        setAccessToken(state: RootState, payload: string) {
            state.accessToken = payload.trim()
        },
        setMetricFilter(state: RootState, payload: Metric) {
            state.metricFilter = payload
        },
        setDifficultyFilter(state: RootState, payload: Difficulty) {
            state.difficultyFilter = payload
        },
        setCharacterData(state: RootState, payload: CharacterData) {
            state.characterData = payload
        },
    }

    const actions: ActionTree<RootState, RootState> = {
        async load({ commit }): Promise<void> {
            const [clientId, clientSecret, accessToken, metricFilter, difficultyFilter] = await Promise.all([
                await GM.getValue(KEY_WCL_CLIENT_ID, '') ?? '',
                await GM.getValue(KEY_WCL_CLIENT_SECRET, '') ?? '',
                await GM.getValue(KEY_WCL_ACCESS_TOKEN, '') ?? '',
                await GM.getValue(KEY_FILTER_METRIC, '') || DEFAULT_METRIC,
                await GM.getValue(KEY_FILTER_DIFFICULTY, '') || DEFAULT_DIFFICULTY,
            ])

            console.info(TAG, 'store::load', `clientId:${clientId.length} clientSecret:${clientSecret.length} accessToken:${accessToken.length} metricFilter:${metricFilter} difficultyFilter:${difficultyFilter}`)

            commit('setClientId', clientId)
            commit('setClientSecret', clientSecret)
            commit('setAccessToken', accessToken)
            commit('setMetricFilter', metricFilter)
            commit('setDifficultyFilter', difficultyFilter)
        },

        async save({ state }): Promise<void> {
            console.info(TAG, 'store::save', `clientId:${state.clientId.length} clientSecret:${state.clientSecret.length} accessToken:${state.accessToken.length} metricFilter:${state.metricFilter} difficultyFilter:${state.difficultyFilter}`)

            await Promise.all([
                GM.setValue(KEY_WCL_CLIENT_ID, state.clientId),
                GM.setValue(KEY_WCL_CLIENT_SECRET, state.clientSecret),
                GM.setValue(KEY_WCL_ACCESS_TOKEN, state.accessToken),
                GM.setValue(KEY_FILTER_METRIC, state.metricFilter),
                GM.setValue(KEY_FILTER_DIFFICULTY, state.difficultyFilter),
            ])
        },

        async reset({ commit, dispatch }): Promise<void> {
            console.info(TAG, 'store::reset')
            commit('setClientId', '')
            commit('setClientSecret', '')
            commit('setAccessToken', '')
            commit('setMetricFilter', DEFAULT_METRIC)
            commit('setDifficultyFilter', DEFAULT_DIFFICULTY)
            await dispatch('save')
        },

        async authenticate({ state, commit, dispatch }): Promise<void> {
            commit('setIsLoading', true)
            commit('setErrorMessage', '')

            try {
                if (!state.clientId || !state.clientSecret) {
                    await sleep(250)
                    throw new Error('Missing client id and secret')
                }

                const accessToken = await authenticate(state.clientId, state.clientSecret)
                commit('setAccessToken', accessToken)
                await dispatch('save')
            } catch (err) {
                const error = err as Error
                commit('setErrorMessage', error.message)
                await dispatch('reset')
            } finally {
                commit('setIsLoading', false)
            }
        },

        async fetchCharacterData({ state, commit }, optionalFilters: OptionalFilters): Promise<void> {
            commit('setIsLoading', true)
            commit('setErrorMessage', '')

            try {
                const region = state.region
                if (region !== 'us' && region !== 'eu') {
                    throw new Error('Unknown Region')
                }

                const data = await fetchCharacterData(state.accessToken, region, state.realm, state.characterName, optionalFilters)
                commit('setCharacterData', data)
            } catch (err) {
                const error = err as Error
                commit('setErrorMessage', error.message)
            } finally {
                commit('setIsLoading', false)
            }
        },
    }

    return createStore<RootState>({
        state,
        mutations,
        actions,
    })
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}
