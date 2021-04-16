/* eslint-disable no-use-before-define */

import { InjectionKey } from 'vue'
import { createStore, Store, useStore, MutationTree, ActionTree, CommitOptions, DispatchOptions, ActionContext } from 'vuex'
import { Difficulty, Metric, DEFAULT_DIFFICULTY, DEFAULT_METRIC } from './Constants'
import { authenticate, fetchCharacterData, OptionalFilters, CharacterData } from './WarcraftLogsV2'
import { sleep } from './utils'

const KEY_WCL_CLIENT_ID = 'KEY_WCL_CLIENT_ID'
const KEY_WCL_CLIENT_SECRET = 'KEY_WCL_CLIENT_SECRET'
const KEY_WCL_ACCESS_TOKEN = 'KEY_WCL_ACCESS_TOKEN'
const KEY_FILTER_METRIC = 'KEY_FILTER_METRIC'
const KEY_FILTER_DIFFICULTY = 'KEY_FILTER_DIFFICULTY'

// ----------------------------------------------------------------------------
// State
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------------

export enum RootMutation {
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
    SET_CLIENT_ID = 'SET_CLIENT_ID',
    SET_CLIENT_SECRET = 'SET_CLIENT_SECRET',
    SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN',
    SET_METRIC_FILTER = 'SET_METRIC_FILTER',
    SET_DIFFICULTY_FILTER = 'SET_DIFFICULTY_FILTER',
    SET_CHARACTER_DATA = 'SET_CHARACTER_DATA',
}

type Mutations<S = RootState> = {
    [RootMutation.SET_IS_LOADING]: (state: S, payload?: boolean) => void
    [RootMutation.SET_ERROR_MESSAGE]: (state: S, payload?: string) => void
    [RootMutation.SET_CLIENT_ID]: (state: S, payload?: string) => void
    [RootMutation.SET_CLIENT_SECRET]: (state: S, payload?: string) => void
    [RootMutation.SET_ACCESS_TOKEN]: (state: S, payload?: string) => void
    [RootMutation.SET_METRIC_FILTER]: (state: S, payload?: Metric) => void
    [RootMutation.SET_DIFFICULTY_FILTER]: (state: S, payload?: Difficulty) => void
    [RootMutation.SET_CHARACTER_DATA]: (state: S, payload?: CharacterData) => void
}

const mutations: MutationTree<RootState> & Mutations = {
    [RootMutation.SET_IS_LOADING]: (state: RootState, payload?: boolean) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.isLoading = payload
    },

    [RootMutation.SET_ERROR_MESSAGE]: (state: RootState, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.errorMessage = payload.trim()
    },

    [RootMutation.SET_CLIENT_ID]: (state: RootState, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.clientId = payload.trim()
    },

    [RootMutation.SET_CLIENT_SECRET]: (state: RootState, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.clientSecret = payload.trim()
    },

    [RootMutation.SET_ACCESS_TOKEN]: (state: RootState, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.accessToken = payload.trim()
    },

    [RootMutation.SET_METRIC_FILTER]: (state: RootState, payload?: Metric) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.metricFilter = payload
    },

    [RootMutation.SET_DIFFICULTY_FILTER]: (state: RootState, payload?: Difficulty) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.difficultyFilter = payload
    },

    [RootMutation.SET_CHARACTER_DATA]: (state: RootState, payload?: CharacterData) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.characterData = payload
    },
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

export enum RootAction {
    LOAD = 'LOAD',
    SAVE = 'SAVE',
    RESET_ACCESS_TOKEN = 'RESET_ACCESS_TOKEN',
    RESET_EVERYTHING = 'RESET_EVERYTHING',
    AUTHENTICATE = 'AUTHENTICATE',
    FETCH_CHARACTER_DATA = 'FETCH_CHARACTER_DATA',
}

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload?: Parameters<Mutations[K]>[1]
    ): ReturnType<Mutations[K]>
    dispatch<K extends keyof Actions>(
        key: K,
        payload?: Parameters<Actions[K]>[1]
    ): ReturnType<Actions[K]>
} & Omit<ActionContext<RootState, RootState>, 'commit' | 'dispatch'>

interface Actions {
    [RootAction.LOAD]: (context: AugmentedActionContext) => Promise<void>
    [RootAction.SAVE]: (context: AugmentedActionContext) => Promise<void>
    [RootAction.RESET_ACCESS_TOKEN]: (context: AugmentedActionContext) => Promise<void>
    [RootAction.RESET_EVERYTHING]: (context: AugmentedActionContext) => Promise<void>
    [RootAction.AUTHENTICATE]: (context: AugmentedActionContext) => Promise<void>
    [RootAction.FETCH_CHARACTER_DATA]: (context: AugmentedActionContext, optionalFilters: OptionalFilters) => Promise<void>
}

const actions: ActionTree<RootState, RootState> & Actions = {
    [RootAction.LOAD]: async({ commit }): Promise<void> => {
        const [clientId, clientSecret, accessToken, metricFilter, difficultyFilter] = await Promise.all([
            await GM.getValue(KEY_WCL_CLIENT_ID, '') ?? '',
            await GM.getValue(KEY_WCL_CLIENT_SECRET, '') ?? '',
            await GM.getValue(KEY_WCL_ACCESS_TOKEN, '') ?? '',
            await GM.getValue(KEY_FILTER_METRIC, '') || DEFAULT_METRIC,
            await GM.getValue(KEY_FILTER_DIFFICULTY, '') || DEFAULT_DIFFICULTY,
        ])

        console.info(DEFINE.NAME, 'store::load', `clientId:${clientId.length} clientSecret:${clientSecret.length} accessToken:${accessToken.length} metricFilter:${metricFilter} difficultyFilter:${difficultyFilter}`)

        commit(RootMutation.SET_CLIENT_ID, clientId)
        commit(RootMutation.SET_CLIENT_SECRET, clientSecret)
        commit(RootMutation.SET_ACCESS_TOKEN, accessToken)
        commit(RootMutation.SET_METRIC_FILTER, metricFilter as Metric)
        commit(RootMutation.SET_DIFFICULTY_FILTER, difficultyFilter as Difficulty)
    },

    [RootAction.SAVE]: async({ state }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::save', `clientId:${state.clientId.length} clientSecret:${state.clientSecret.length} accessToken:${state.accessToken.length} metricFilter:${state.metricFilter} difficultyFilter:${state.difficultyFilter}`)

        await Promise.all([
            GM.setValue(KEY_WCL_CLIENT_ID, state.clientId),
            GM.setValue(KEY_WCL_CLIENT_SECRET, state.clientSecret),
            GM.setValue(KEY_WCL_ACCESS_TOKEN, state.accessToken),
            GM.setValue(KEY_FILTER_METRIC, state.metricFilter),
            GM.setValue(KEY_FILTER_DIFFICULTY, state.difficultyFilter),
        ])
    },

    [RootAction.RESET_ACCESS_TOKEN]: async({ commit, dispatch }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::resetEverything')
        commit(RootMutation.SET_ACCESS_TOKEN, '')
        await dispatch(RootAction.SAVE)
    },

    [RootAction.RESET_EVERYTHING]: async({ commit, dispatch }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::resetEverything')
        commit(RootMutation.SET_CLIENT_ID, '')
        commit(RootMutation.SET_CLIENT_SECRET, '')
        commit(RootMutation.SET_ACCESS_TOKEN, '')
        commit(RootMutation.SET_METRIC_FILTER, DEFAULT_METRIC)
        commit(RootMutation.SET_DIFFICULTY_FILTER, DEFAULT_DIFFICULTY)
        await dispatch(RootAction.SAVE)
    },

    [RootAction.AUTHENTICATE]: async({ state, commit, dispatch }): Promise<void> => {
        commit(RootMutation.SET_IS_LOADING, true)
        commit(RootMutation.SET_ERROR_MESSAGE, '')

        try {
            if (!state.clientId || !state.clientSecret) {
                await sleep(250)
                throw new Error('Missing client id and secret')
            }

            const accessToken = await authenticate(state.clientId, state.clientSecret)
            commit(RootMutation.SET_ACCESS_TOKEN, accessToken)
            await dispatch(RootAction.SAVE)
        } catch (err) {
            const error = err as Error
            commit(RootMutation.SET_ERROR_MESSAGE, error.message)
            await dispatch(RootAction.RESET_EVERYTHING)
        } finally {
            commit(RootMutation.SET_IS_LOADING, false)
        }
    },

    [RootAction.FETCH_CHARACTER_DATA]: async({ state, commit }, optionalFilters?: OptionalFilters): Promise<void> => {
        commit(RootMutation.SET_IS_LOADING, true)
        commit(RootMutation.SET_ERROR_MESSAGE, '')

        try {
            const region = state.region
            if (region !== 'us' && region !== 'eu') {
                throw new Error('Unknown Region')
            }

            const data = await fetchCharacterData(state.accessToken, region, state.realm, state.characterName, optionalFilters)
            if (data) {
                commit(RootMutation.SET_CHARACTER_DATA, data)
            }
        } catch (err) {
            const error = err as Error
            commit(RootMutation.SET_ERROR_MESSAGE, error.message)
        } finally {
            commit(RootMutation.SET_IS_LOADING, false)
        }
    },
}

// ----------------------------------------------------------------------------
// Typescript Helpers
// ----------------------------------------------------------------------------

export function createRootStore(region: string, realm: string, characterName: string): Store<RootState> {
    const createDefaultState = () => {
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

    return createStore<RootState>({
        strict: DEFINE.IS_DEV,
        state: createDefaultState,
        mutations,
        actions,
    })
}

export type TypedStore = Omit<Store<RootState>, 'commit' | 'dispatch'> & {
    commit<K extends keyof Mutations, P extends Parameters<Mutations[K]>[1]>(
        key: K,
        payload?: P,
        options?: CommitOptions
    ): ReturnType<Mutations[K]>
} & {
    dispatch<K extends keyof Actions>(
        key: K,
        payload?: Parameters<Actions[K]>[1],
        options?: DispatchOptions
    ): ReturnType<Actions[K]>
}

// eslint-disable-next-line symbol-description
export const key: InjectionKey<Store<RootState>> = Symbol()
export function useTypedStore(): TypedStore {
    return useStore(key)
}
