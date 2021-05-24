import { InjectionKey } from 'vue'
import { createStore as _createStore, Store, useStore, MutationTree, ActionTree, CommitOptions, DispatchOptions, ActionContext } from 'vuex'
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

export interface State {
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

export enum Mutation {
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE',
    SET_CLIENT_ID = 'SET_CLIENT_ID',
    SET_CLIENT_SECRET = 'SET_CLIENT_SECRET',
    SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN',
    SET_METRIC_FILTER = 'SET_METRIC_FILTER',
    SET_DIFFICULTY_FILTER = 'SET_DIFFICULTY_FILTER',
    SET_CHARACTER_DATA = 'SET_CHARACTER_DATA',
}

interface Mutations {
    [Mutation.SET_IS_LOADING]: (state: State, payload?: boolean) => void
    [Mutation.SET_ERROR_MESSAGE]: (state: State, payload?: string) => void
    [Mutation.SET_CLIENT_ID]: (state: State, payload?: string) => void
    [Mutation.SET_CLIENT_SECRET]: (state: State, payload?: string) => void
    [Mutation.SET_ACCESS_TOKEN]: (state: State, payload?: string) => void
    [Mutation.SET_METRIC_FILTER]: (state: State, payload?: Metric) => void
    [Mutation.SET_DIFFICULTY_FILTER]: (state: State, payload?: Difficulty) => void
    [Mutation.SET_CHARACTER_DATA]: (state: State, payload?: CharacterData) => void
}

const mutations: MutationTree<State> & Mutations = {
    [Mutation.SET_IS_LOADING]: (state: State, payload?: boolean) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.isLoading = payload
    },

    [Mutation.SET_ERROR_MESSAGE]: (state: State, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.errorMessage = payload.trim()
    },

    [Mutation.SET_CLIENT_ID]: (state: State, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.clientId = payload.trim()
    },

    [Mutation.SET_CLIENT_SECRET]: (state: State, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.clientSecret = payload.trim()
    },

    [Mutation.SET_ACCESS_TOKEN]: (state: State, payload?: string) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.accessToken = payload.trim()
    },

    [Mutation.SET_METRIC_FILTER]: (state: State, payload?: Metric) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.metricFilter = payload
    },

    [Mutation.SET_DIFFICULTY_FILTER]: (state: State, payload?: Difficulty) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.difficultyFilter = payload
    },

    [Mutation.SET_CHARACTER_DATA]: (state: State, payload?: CharacterData) => {
        if (payload === undefined) {
            throw new Error('Missing Payload')
        }

        state.characterData = payload
    },
}

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

export enum Action {
    LOAD = 'LOAD',
    SAVE = 'SAVE',
    RESET_ACCESS_TOKEN = 'RESET_ACCESS_TOKEN',
    RESET_EVERYTHING = 'RESET_EVERYTHING',
    AUTHENTICATE = 'AUTHENTICATE',
    FETCH_CHARACTER_DATA = 'FETCH_CHARACTER_DATA',
}

type TypedActionContext = Omit<ActionContext<State, State>, 'commit' | 'dispatch' | 'getters' | 'rootState' | 'rootGetters'> & {
    commit<K extends keyof Mutations>(
        key: K,
        payload?: Parameters<Mutations[K]>[1]
    ): ReturnType<Mutations[K]>

    // eslint-disable-next-line no-use-before-define
    dispatch<K extends keyof Actions>(
        key: K,
        // eslint-disable-next-line no-use-before-define
        payload?: Parameters<Actions[K]>[1]
    // eslint-disable-next-line no-use-before-define
    ): ReturnType<Actions[K]>
}

interface Actions {
    [Action.LOAD]: (context: TypedActionContext) => Promise<void>
    [Action.SAVE]: (context: TypedActionContext) => Promise<void>
    [Action.RESET_ACCESS_TOKEN]: (context: TypedActionContext) => Promise<void>
    [Action.RESET_EVERYTHING]: (context: TypedActionContext) => Promise<void>
    [Action.AUTHENTICATE]: (context: TypedActionContext) => Promise<void>
    [Action.FETCH_CHARACTER_DATA]: (context: TypedActionContext, optionalFilters?: OptionalFilters) => Promise<void>
}

const actions: ActionTree<State, State> & Actions = {
    [Action.LOAD]: async({ commit }): Promise<void> => {
        const [clientId, clientSecret, accessToken, metricFilter, difficultyFilter] = await Promise.all([
            await GM.getValue(KEY_WCL_CLIENT_ID, '') ?? '',
            await GM.getValue(KEY_WCL_CLIENT_SECRET, '') ?? '',
            await GM.getValue(KEY_WCL_ACCESS_TOKEN, '') ?? '',
            await GM.getValue(KEY_FILTER_METRIC, '') || DEFAULT_METRIC,
            await GM.getValue(KEY_FILTER_DIFFICULTY, '') || DEFAULT_DIFFICULTY,
        ])

        console.info(DEFINE.NAME, 'store::load', `clientId:${clientId.length} clientSecret:${clientSecret.length} accessToken:${accessToken.length} metricFilter:${metricFilter} difficultyFilter:${difficultyFilter}`)

        commit(Mutation.SET_CLIENT_ID, clientId)
        commit(Mutation.SET_CLIENT_SECRET, clientSecret)
        commit(Mutation.SET_ACCESS_TOKEN, accessToken)
        commit(Mutation.SET_METRIC_FILTER, metricFilter as Metric)
        commit(Mutation.SET_DIFFICULTY_FILTER, difficultyFilter as Difficulty)
    },

    [Action.SAVE]: async({ state }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::save', `clientId:${state.clientId.length} clientSecret:${state.clientSecret.length} accessToken:${state.accessToken.length} metricFilter:${state.metricFilter} difficultyFilter:${state.difficultyFilter}`)

        await Promise.all([
            GM.setValue(KEY_WCL_CLIENT_ID, state.clientId),
            GM.setValue(KEY_WCL_CLIENT_SECRET, state.clientSecret),
            GM.setValue(KEY_WCL_ACCESS_TOKEN, state.accessToken),
            GM.setValue(KEY_FILTER_METRIC, state.metricFilter),
            GM.setValue(KEY_FILTER_DIFFICULTY, state.difficultyFilter),
        ])
    },

    [Action.RESET_ACCESS_TOKEN]: async({ commit, dispatch }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::resetEverything')
        commit(Mutation.SET_ACCESS_TOKEN, '')
        await dispatch(Action.SAVE)
    },

    [Action.RESET_EVERYTHING]: async({ commit, dispatch }): Promise<void> => {
        console.info(DEFINE.NAME, 'store::resetEverything')
        commit(Mutation.SET_CLIENT_ID, '')
        commit(Mutation.SET_CLIENT_SECRET, '')
        commit(Mutation.SET_ACCESS_TOKEN, '')
        commit(Mutation.SET_METRIC_FILTER, DEFAULT_METRIC)
        commit(Mutation.SET_DIFFICULTY_FILTER, DEFAULT_DIFFICULTY)
        await dispatch(Action.SAVE)
    },

    [Action.AUTHENTICATE]: async({ state, commit, dispatch }): Promise<void> => {
        commit(Mutation.SET_IS_LOADING, true)
        commit(Mutation.SET_ERROR_MESSAGE, '')

        try {
            if (!state.clientId || !state.clientSecret) {
                await sleep(250)
                throw new Error('Missing client id and secret')
            }

            const accessToken = await authenticate(state.clientId, state.clientSecret)
            commit(Mutation.SET_ACCESS_TOKEN, accessToken)
            await dispatch(Action.SAVE)
        } catch (err) {
            const error = err as Error
            commit(Mutation.SET_ERROR_MESSAGE, error.message)
            await dispatch(Action.RESET_EVERYTHING)
        } finally {
            commit(Mutation.SET_IS_LOADING, false)
        }
    },

    [Action.FETCH_CHARACTER_DATA]: async({ state, commit }, optionalFilters?: OptionalFilters): Promise<void> => {
        commit(Mutation.SET_IS_LOADING, true)
        commit(Mutation.SET_ERROR_MESSAGE, '')

        try {
            const region = state.region
            if (region !== 'us' && region !== 'eu') {
                throw new Error('Unknown Region')
            }

            const data = await fetchCharacterData(state.accessToken, region, state.realm, state.characterName, optionalFilters)
            if (data) {
                commit(Mutation.SET_CHARACTER_DATA, data)
            }
        } catch (err) {
            const error = err as Error
            commit(Mutation.SET_ERROR_MESSAGE, error.message)
        } finally {
            commit(Mutation.SET_IS_LOADING, false)
        }
    },
}

// ----------------------------------------------------------------------------
// Typescript Helpers
// ----------------------------------------------------------------------------

export function createRootStore(region: string, realm: string, characterName: string): Store<State> {
    const createDefaultState = () => {
        const defaultState: State = {
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

    return _createStore<State>({
        strict: DEFINE.IS_DEV,

        state: createDefaultState,
        mutations,
        actions,
    })
}

type TypedStore = Omit<Store<State>, 'commit' | 'dispatch' | 'getters'> & {
    commit<K extends keyof Mutations>(
        key: K,
        payload?: Parameters<Mutations[K]>[1],
        options?: CommitOptions
    ): ReturnType<Mutations[K]>
} & {
    dispatch<K extends keyof Actions>(
        key: K,
        payload?: Parameters<Actions[K]>[1],
        options?: DispatchOptions
    ): ReturnType<Actions[K]>
}

export const key: InjectionKey<TypedStore> = Symbol('Vuex InjectionKey')

export function useTypedStore(): TypedStore {
    return useStore(key)
}
