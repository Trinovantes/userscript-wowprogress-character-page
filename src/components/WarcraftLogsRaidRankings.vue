<template>
    <div v-if="!isLoading && !hasErrors">
        <div class="btn-group">
            <a
                v-for="metric of Object.values(Metric)"
                :key="metric"
                style="text-transform: uppercase;"
                :class="{
                    'btn': true,
                    'active': metricFilter === metric
                }"
                @click="metricFilter = metric"
            >
                {{ metric }}
            </a>
        </div>
        <div class="btn-group">
            <a
                :class="`btn ${specFilter === '' ? 'active' : ''}`"
                @click="specFilter = ''"
            >
                All Specs
            </a>
            <a
                v-for="spec of playerSpecs"
                :key="spec.name"
                :class="`btn ${specFilter === spec.name ? 'active' : ''}`"
                @click="specFilter = spec.name"
            >
                {{ spec.name }}
            </a>
        </div>

        <div class="btn-group">
            <a
                v-for="difficulty of Difficulty"
                :key="difficulty"
                :class="`btn ${difficultyFilter === difficulty ? 'active' : ''}`"
                @click="difficultyFilter = difficulty"
            >
                {{ difficulty }}
            </a>
        </div>

        <div
            v-for="[tier, tierInfo] of Object.entries(characterTierInfos)"
            :key="tier"
            class="raid-ranking"
        >
            <h2>{{ getTierName(tier) }} ({{ getRaidProgress(tier) }})</h2>

            <table>
                <thead>
                    <tr>
                        <td>
                            Boss
                        </td>
                        <td>
                        <!-- Best Spec -->
                        </td>
                        <td class="metric">
                            Best <span>{{ metricFilter }}</span>
                        </td>
                        <td>
                            All Stars
                        </td>
                        <td>
                            Rank
                        </td>
                        <td>
                            Best %
                        </td>
                        <td>
                            Median %
                        </td>
                        <td>
                            Kills
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="bossRank of tierInfo.rankings"
                        :key="bossRank.encounter.id"
                    >
                        <td class="boss-name">
                            <img
                                :src="getBossIcon(tierInfo.zone, bossRank.encounter.id)"
                                class="wow-icon boss-icon"
                            >
                            <span>
                                {{ bossRank.encounter.name }}
                            </span>
                        </td>
                        <td>
                            <img
                                v-if="bossRank.totalKills > 0"
                                :src="getSpecIcon(bossRank.bestSpec)"
                                class="wow-icon spec-icon"
                            >
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span v-if="bossRank.totalKills > 0">
                                {{ formatNum(bossRank.bestAmount) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.allStars && bossRank.allStars.possiblePoints > 0"
                            >
                                {{ formatNum(bossRank.allStars.points) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.allStars && bossRank.allStars.possiblePoints > 0"
                                :style="{ color: getRankColor(bossRank.allStars.rankPercent) }"
                            >
                                {{ formatNum(bossRank.allStars.rank) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.totalKills > 0"
                                :style="{ color: getRankColor(bossRank.rankPercent) }"
                            >
                                {{ formatPercent(bossRank.rankPercent / 100) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.totalKills > 0"
                                :style="{ color: getRankColor(bossRank.medianPercent) }"
                            >
                                {{ formatPercent(bossRank.medianPercent / 100) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.totalKills > 0"
                            >
                                {{ formatNum(bossRank.totalKills) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { specs, Metric, Tier, getTierName, Difficulty, getClassName, getDifficultyShortName } from '@/Constants'
import { TierInfo, OptionalFilters } from '@/WarcraftLogsV2'
import { Action, Mutation, useTypedStore } from '@/store'
import { formatPercent, formatNum, getRankColor } from '@/utils'

export default defineComponent({
    setup() {
        const store = useTypedStore()
        const isLoading = computed(() => store.state.isLoading)
        const hasErrors = computed(() => store.state.errorMessage)
        const characterData = computed(() => store.state.characterData)
        const playerClassId = computed(() => characterData.value?.classID)

        const fetch = async() => {
            const optionalFilters: OptionalFilters = {
                specName: specFilter.value,
                metric: metricFilter.value,
                difficulty: difficultyFilter.value,
            }

            await store.dispatch(Action.FETCH_CHARACTER_DATA, optionalFilters)
        }

        onMounted(fetch)

        const onChangeFetch = async<T>(newValue: T, oldValue: T) => {
            if (newValue === oldValue) {
                return
            }

            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.info(DEFINE.NAME, `Changed "${oldValue}" to "${newValue}"`)
            await fetch()
        }

        const specFilter = ref<string>('')
        watch(specFilter, onChangeFetch)

        const metricFilter = computed({
            get(): Metric {
                return store.state.metricFilter
            },
            async set(newVal: Metric) {
                const oldVal = store.state.metricFilter
                store.commit(Mutation.SET_METRIC_FILTER, newVal)
                await store.dispatch(Action.SAVE)
                await onChangeFetch(newVal, oldVal)
            },
        })

        const difficultyFilter = computed({
            get(): Difficulty {
                return store.state.difficultyFilter
            },
            async set(newVal: Difficulty) {
                const oldVal = store.state.difficultyFilter
                store.commit(Mutation.SET_DIFFICULTY_FILTER, newVal)
                await store.dispatch(Action.SAVE)
                await onChangeFetch(newVal, oldVal)
            },
        })

        const characterTierInfos = computed(() => {
            const tierInfos: { [key in Tier]?: TierInfo } = {}

            if (characterData.value) {
                for (const [tier, tierInfo] of Object.entries(characterData.value)) {
                    if (!(tier in Tier)) {
                        continue
                    }

                    if (!(typeof tierInfo === 'object')) {
                        continue
                    }

                    if ('error' in tierInfo) {
                        console.warn(tier, tierInfo.error)
                        continue
                    }

                    tierInfos[tier as Tier] = tierInfo
                }
            }

            return tierInfos
        })

        const getRaidProgress = (tier: Tier): string => {
            const tierInfos = characterTierInfos.value?.[tier]
            if (!tierInfos) {
                return 'Failed to calculate progress'
            }

            const numBosses = tierInfos.rankings.length
            let numBossesKilled = 0

            for (const bossRank of tierInfos.rankings) {
                if (bossRank.totalKills > 0) {
                    numBossesKilled += 1
                }
            }

            return `${numBossesKilled}/${numBosses}${getDifficultyShortName(difficultyFilter.value)}`
        }

        const bossIcons = getBossIcons()
        const getBossIcon = (tier: Tier, encounterId: number): unknown => {
            const filename = `${tier}/${encounterId}.jpg`
            if (!(filename in bossIcons)) {
                console.warn(DEFINE.NAME, `Missing ${filename}`)
                return null
            }

            return bossIcons[filename]
        }

        const specIcons = getSpecIcons()
        const getSpecIcon = (specName: string): unknown => {
            if (playerClassId.value === undefined) {
                console.warn(DEFINE.NAME, 'Missing player class')
                return ''
            }

            const playerClassName = getClassName(playerClassId.value)
            const filename = `${playerClassName}-${specName}.jpg`.toLowerCase()
            if (!(filename in specIcons)) {
                console.warn(DEFINE.NAME, `Missing ${filename}`)
                return null
            }

            return specIcons[filename]
        }

        const playerSpecs = computed(() => {
            if (playerClassId.value === undefined) {
                return []
            }

            return specs[getClassName(playerClassId.value)]
        })

        return {
            isLoading,
            hasErrors,

            getTierName,
            getRaidProgress,
            getBossIcon,
            getSpecIcon,

            playerSpecs,
            specFilter,
            metricFilter,
            difficultyFilter,
            characterTierInfos,

            Metric,
            Difficulty,

            formatPercent,
            formatNum,
            getRankColor,
        }
    },
})

function getBossIcons(): { [key: string]: unknown } {
    const imgReq = require.context('@/assets/img/bosses', true, /(26)\/.*\.(jpe?g|png|gif|svg)$/i)
    const images: { [key: string]: unknown } = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename)
    }

    return images
}

function getSpecIcons(): { [key: string]: unknown } {
    const imgReq = require.context('@/assets/img/specs', false, /\.(jpe?g|png|gif|svg)$/i)
    const images: { [key: string]: unknown } = {}

    for (const filename of imgReq.keys()) {
        images[filename.replace('./', '')] = imgReq(filename)
    }

    return images
}
</script>

<style lang="scss">
.raid-ranking{
    h2{
        margin: $padding 0;
    }

    table{
        $height: 30px;

        border-collapse: collapse;
        margin: 0;

        tr{
            border-top: $border;

            &:last-child{
                border-bottom: $border;
            }

            td{
                line-height: $height;
                text-align: right;
                padding: 5px;

                &:first-child{
                    text-align: left;
                }

                &.boss-name{
                    display: grid;
                    grid-template-columns: $height 1fr;
                    gap: $padding;
                }

                &.metric{
                    span{
                        text-transform: uppercase;
                    }
                }

                img{
                    display: block;
                    height: $height;
                    width: $height;
                }

                span.blank:before{
                    content: '-';
                    color: var(--common);

                    display: inline-block;
                    height: $height;
                    width: $height;
                }
            }
        }
    }
}
</style>
