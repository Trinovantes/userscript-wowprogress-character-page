import { CurrentTiers, Difficulty, Metrics, Regions, Tiers } from '@Constants'
import IDataSource, { IOptionalFilters } from './IDataSource'

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const AUTH_ENDPOINT = 'https://www.warcraftlogs.com/oauth/token'
const API_ENDPOINT = 'https://www.warcraftlogs.com/api/v2/client'

const KEY_WCL_CLIENT_ID = 'KEY_WCL_CLIENT_ID'
const KEY_WCL_CLIENT_SECRET = 'KEY_WCL_CLIENT_SECRET'
const KEY_WCL_ACCESS_TOKEN = 'KEY_WCL_ACCESS_TOKEN'

// ----------------------------------------------------------------------------
// Interfaces
// ----------------------------------------------------------------------------

interface IErrorResponse {
    // eslint-disable-next-line camelcase
    error_description: string,
}

interface ISuccessResponse {
    // eslint-disable-next-line camelcase
    access_token: string,
}

export interface IBossRank {
    encounter: {
        id: number,
        name: string,
    },
    rankPercent: number,
    medianPercent: number,
    totalKills: number,
    bestSpec: string,
    bestAmount: number,
    allStars?: {
        points: number,
        possiblePoints: number,
        rank: number,
        rankPercent: number,
    },
}

export interface ITierRank {
    metric: Metrics,
    partition: number,
    zone: number
    rankings: Array<IBossRank>
}

export type ICharacterRankings = {
    [key in Tiers]?: ITierRank
}

export interface ICharacterRankingsResponse {
    data: {
        characterData: {
            character: ICharacterRankings | null,
        }
    }
}

// ----------------------------------------------------------------------------
// WarcraftLogs
// ----------------------------------------------------------------------------

export default class WarcraftLogs implements IDataSource {
    clientId = ''
    clientSecret = ''
    accessToken = ''

    constructor() {
        console.info('Initializing WarcraftLogs')
    }

    async load(): Promise<void> {
        this.clientId = await GM.getValue(KEY_WCL_CLIENT_ID, '') || ''
        this.clientSecret = await GM.getValue(KEY_WCL_CLIENT_SECRET, '') || ''
        this.accessToken = await GM.getValue(KEY_WCL_ACCESS_TOKEN, '') || ''
    }

    async save(): Promise<void> {
        await Promise.all([
            GM.setValue(KEY_WCL_CLIENT_ID, this.clientId),
            GM.setValue(KEY_WCL_CLIENT_SECRET, this.clientSecret),
            GM.setValue(KEY_WCL_ACCESS_TOKEN, this.accessToken),
        ])
    }

    async reset(): Promise<void> {
        this.clientId = ''
        this.clientSecret = ''
        this.accessToken = ''
        await this.save()
    }

    authenticate(): Promise<void> {
        return new Promise((resolve, reject) => {
            const basicAuth = btoa(`${this.clientId}:${this.clientSecret}`)

            console.info('Fetching', AUTH_ENDPOINT)
            GM.xmlHttpRequest({
                method: 'POST',
                url: AUTH_ENDPOINT,
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: 'grant_type=client_credentials',
                onload: async(response) => {
                    try {
                        if (response.status !== 200) {
                            const data = JSON.parse(response.responseText) as IErrorResponse
                            const msg = `Warcraft Logs returned ${response.status}: ${data.error_description}`
                            return reject(msg)
                        }

                        const data = JSON.parse(response.responseText) as ISuccessResponse
                        this.accessToken = data.access_token
                        await this.save()

                        return resolve()
                    } catch (error) {
                        console.warn('Failed to parse auth response from Warcraft Logs')
                        return reject(error)
                    }
                },
                onerror: (error) => {
                    return reject(error.responseText)
                },
            })
        })
    }

    async fetchInfo(region: Regions, realm: string, name: string, optionalFilters?: IOptionalFilters): Promise<ICharacterRankings | null> {
        if (!this.accessToken) {
            throw new Error('No access token')
        }

        let zoneRankingQueryString = ''
        for (const zoneKey of CurrentTiers) {
            const re = /^T(\d+)$/
            const matches = re.exec(zoneKey)
            if (matches) {
                const zoneID = parseInt(matches[1])
                zoneRankingQueryString += `${zoneKey}: zoneRankings(`
                zoneRankingQueryString += `zoneID: ${zoneID}, difficulty: ${Difficulty.Mythic}, partition: -1`

                if (optionalFilters?.metric) {
                    zoneRankingQueryString += `, metric:${optionalFilters.metric}`
                }
                if (optionalFilters?.specName) {
                    zoneRankingQueryString += `, specName:"${optionalFilters.specName}"`
                }

                zoneRankingQueryString += ')'
            }
        }

        const queryString = `{
            characterData {
                character (serverRegion: "${region}", serverSlug: "${realm}", name: "${name}") {
                    classID
                    canonicalID
                    ${zoneRankingQueryString}
                }
            }
        }`

        console.info(`Fetching from Warcraft Logs region: ${region} realm: ${realm} name: ${name}`)

        const query = JSON.stringify({ query: queryString })
        console.info(query)

        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                method: 'POST',
                url: API_ENDPOINT,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: query,
                onload: (response) => {
                    try {
                        if (response.status !== 200) {
                            const data = JSON.parse(response.responseText) as IErrorResponse
                            const msg = `Warcraft Logs returned ${response.status}: ${data.error_description}`
                            return reject(msg)
                        }

                        const parsedResponse = JSON.parse(response.responseText) as ICharacterRankingsResponse
                        if (!parsedResponse) {
                            const msg = `Warcraft Logs returned invalid response ${response.responseText.substring(0, 80)}`
                            return reject(msg)
                        }

                        console.info('Received data from Warcraft Logs', parsedResponse.data.characterData.character)
                        return resolve(parsedResponse.data.characterData.character)
                    } catch (error) {
                        console.warn('Failed to parse data from Warcraft Logs')
                        return reject(error)
                    }
                },
                onerror: (error) => {
                    console.warn('Failed to fetch data from Warcraft Logs')
                    return reject(error)
                },
            })
        })
    }
}
