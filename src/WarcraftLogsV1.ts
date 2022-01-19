import { Metric, Region, Tier } from './Constants'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const WCL_CLIENT_ID = ''
const WCL_API_V1 = 'https://www.warcraftlogs.com/v1'
const WCL_API_RANKING_ENDPOINT = `${WCL_API_V1}/rankings/character`

// ----------------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------------

export type OptionalFilters = Partial<{
    metric: Metric
    zone: Tier
}>

type QueryParam = {
    // eslint-disable-next-line camelcase
    api_key: string
}

type RankingQueryParam = QueryParam & OptionalFilters

interface ErrorResponse {
    status: number
    error: string
}

interface Zone {
    id: number
    name: string
    encounters: Array<{
        id: number
        name: string
    }>
}

export type ZoneResponse = Array<Zone>

interface Ranking {
    encounterId: number
    encounterName: string
    class: string
}

export type RankingResponse = Array<Ranking>

// ----------------------------------------------------------------------------
// WarcraftLogs
// ----------------------------------------------------------------------------

export function fetchRankings(region: Region, realm: string, name: string, optionalFilters?: OptionalFilters): Promise<RankingResponse> {
    const query: RankingQueryParam = {
        ...optionalFilters,
        api_key: WCL_CLIENT_ID,
    }

    const searchQuery = new URLSearchParams(query as unknown as Record<string, string>)
    const url = `${WCL_API_RANKING_ENDPOINT}/${name}/${realm}/${region}?${searchQuery.toString()}`

    return fetchFromWarcraftLogs<RankingResponse>(url, 'Failed to fetch rankings data')
}

function fetchFromWarcraftLogs<IResponseType>(url: string, errorMsg: string): Promise<IResponseType> {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: 'GET',
            url,
            onload: (response) => {
                try {
                    if (response.status !== 200) {
                        const res = JSON.parse(response.responseText) as ErrorResponse
                        errorMsg += ` (${res.error}) [${res.status}]`
                        console.warn(DEFINE.NAME, 'WarcraftLogsV1::onload', errorMsg, response, res)
                        return reject(new Error(errorMsg))
                    }

                    const data = JSON.parse(response.responseText) as IResponseType
                    return resolve(data)
                } catch (error) {
                    console.warn(DEFINE.NAME, 'WarcraftLogsV1::onload', errorMsg, error)
                    return reject(new Error(errorMsg))
                }
            },
            onerror: (error) => {
                console.warn(DEFINE.NAME, 'WarcraftLogsV1::onerror', errorMsg, error)
                return reject(error)
            },
        })
    })
}
