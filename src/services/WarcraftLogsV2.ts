import { CURRENT_TIERS } from '@/Constants'
import { Difficulty } from './Difficulty'
import { Metric } from './Metric'
import { Region } from './Region'
import { Tier } from './Tier'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const AUTH_ENDPOINT = 'https://www.warcraftlogs.com/oauth/token'
const API_ENDPOINT = 'https://www.warcraftlogs.com/api/v2/client'

// ----------------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------------

type ErrorResponse = {
    error: string
} | {
    errors: Array<{
        message: string
    }>
}

type SuccessResponse = {
    access_token: string
}

export type OptionalFilters = Partial<{
    metric: Metric
    specName: string
    difficulty: Difficulty
}>

export type BossRank = {
    encounter: {
        id: number
        name: string
    }
    rankPercent: number
    medianPercent: number
    totalKills: number
    bestSpec: string
    bestAmount: number
    allStars?: {
        points: number
        possiblePoints: number
        rank: number
        rankPercent: number
    }
}

export type TierInfo = {
    zone: number
    metric: Metric
    partition: number
    rankings: Array<BossRank>
}

export type CharacterData = {
    classID: number
} & {
    [key in Tier]?: TierInfo | { error: string }
}

type CharacterRankingsResponse = {
    data?: {
        characterData?: {
            character?: CharacterData
        }
    }
}

// ----------------------------------------------------------------------------
// WarcraftLogs
// ----------------------------------------------------------------------------

function getWclErrorMessage(errorResponse: ErrorResponse) {
    if ('error' in errorResponse) {
        return errorResponse.error
    } else {
        return errorResponse.errors.reduce((msg, currentError) => {
            return msg + currentError.message + ' '
        }, '')
    }
}

export async function authenticate(clientId: string, clientSecret: string): Promise<string> {
    return await new Promise((resolve, reject) => {
        console.info(DEFINE.NAME, 'Fetching', AUTH_ENDPOINT)
        const basicAuth = btoa(`${clientId}:${clientSecret}`)

        GM.xmlHttpRequest({
            method: 'POST',
            url: AUTH_ENDPOINT,
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: 'grant_type=client_credentials',
            onload: (res) => {
                try {
                    const response = JSON.parse(res.responseText) as ErrorResponse | SuccessResponse

                    if (res.status !== 200 || 'error' in response || 'errors' in response) {
                        const errorResponse = response as ErrorResponse
                        const msg = `WarcraftLogs returned Status:${res.status} (${getWclErrorMessage(errorResponse)})`
                        console.warn(DEFINE.NAME, 'WarcraftLogsV2::authenticate::onload', msg, errorResponse)
                        reject(new Error(msg))
                        return
                    }

                    const accessToken = response.access_token
                    resolve(accessToken)
                } catch (error) {
                    const msg = 'Failed to parse auth response from WarcraftLogs'
                    console.warn(DEFINE.NAME, 'WarcraftLogsV2::authenticate::onload', msg, error)
                    reject(new Error(msg))
                }
            },
            onerror: (errorResponse) => {
                const msg = `Failed fetch ${AUTH_ENDPOINT} (${errorResponse.responseText})`
                console.warn(DEFINE.NAME, 'WarcraftLogsV2::authenticate::onerror', msg, errorResponse)
                reject(new Error(msg))
            },
        })
    })
}

export async function fetchCharacterData(accessToken: string, region: Region, realm: string, name: string, optionalFilters?: OptionalFilters): Promise<CharacterData | undefined> {
    let zoneRankingQueryString = ''
    for (const tier of CURRENT_TIERS) {
        const zoneId = /T(\d+)/.exec(tier)?.[1]
        if (!zoneId) {
            continue
        }

        zoneRankingQueryString += `T${zoneId}: zoneRankings(`
        zoneRankingQueryString += `zoneID: ${zoneId}`

        if (optionalFilters?.metric !== undefined) {
            zoneRankingQueryString += `, metric:${optionalFilters.metric}`
        }
        if (optionalFilters?.specName !== undefined) {
            zoneRankingQueryString += `, specName:"${optionalFilters.specName}"`
        }
        if (optionalFilters?.difficulty !== undefined) {
            zoneRankingQueryString += `, difficulty:${optionalFilters.difficulty}`
        }

        zoneRankingQueryString += ')'
    }

    const queryString = `{
        characterData {
            character (serverRegion:"${region}", serverSlug:"${realm}", name:"${name}") {
                classID
                ${zoneRankingQueryString}
            }
        }
    }`

    const query = JSON.stringify({ query: queryString })
    console.info(DEFINE.NAME, `Fetching from WarcraftLogs region:${region} realm:${realm} name:${name}`)
    console.info(DEFINE.NAME, queryString)

    return await new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: 'POST',
            url: API_ENDPOINT,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            data: query,
            onload: (res) => {
                try {
                    const response = JSON.parse(res.responseText) as ErrorResponse | CharacterRankingsResponse

                    if (res.status !== 200 || 'error' in response || 'errors' in response) {
                        const errorResponse = response as ErrorResponse
                        const msg = `WarcraftLogs returned Status:${res.status} (${getWclErrorMessage(errorResponse)})`
                        console.warn(DEFINE.NAME, 'WarcraftLogsV2::authenticate::onload', msg, errorResponse)
                        reject(new Error(msg))
                        return
                    }

                    const character = response?.data?.characterData?.character
                    if (!character) {
                        const msg = `WarcraftLogs returned invalid response (${res.responseText.substring(0, 80)})`
                        console.warn(DEFINE.NAME, 'WarcraftLogsV2::fetchRankings::onload', msg, character)
                        reject(new Error(msg))
                        return
                    }

                    console.info(DEFINE.NAME, 'Received data from WarcraftLogs', character)
                    resolve(character)
                } catch (error) {
                    const msg = 'Failed to parse ranking response from WarcraftLogs'
                    console.warn(DEFINE.NAME, 'WarcraftLogsV2::fetchRankings::onload', msg, error)
                    reject(new Error(msg))
                }
            },
            onerror: (errorResponse) => {
                const msg = `Failed fetch ${API_ENDPOINT} (${errorResponse.responseText})`
                console.warn(DEFINE.NAME, 'WarcraftLogsV2::fetchRankings::onerror', msg, errorResponse)
                reject(new Error(msg))
            },
        })
    })
}
