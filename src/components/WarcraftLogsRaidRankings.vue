<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { specs, Metric, Tier, getTierName as _getTierName, Difficulty, getClassName, getDifficultyShortName } from '@/Constants'
import { TierInfo, OptionalFilters, CharacterData } from '@/services/WarcraftLogsV2'
import { useStore } from '@/store'
import { formatPercent } from '@/utils/formatPercent'
import { formatNumber } from '@/utils/formatNumber'
import { getParseRankColor } from '@/utils/getParseRankColor'
import { getIconsSpec } from '@/utils/getIconsSpec'
import { getIconsBoss } from '@/utils/getIconsBoss'

export default defineComponent({
    setup() {
        const store = useStore()
        const isLoading = computed(() => store.isLoading)
        const hasErrors = computed(() => store.errorMessage)

        const characterData = ref<CharacterData | undefined>(undefined)
        const specFilter = ref<string>('')
        const metricFilter = computed({
            get: () => store.metricFilter,
            set: (val) => { store.metricFilter = val },
        })
        const difficultyFilter = computed({
            get: () => store.difficultyFilter,
            set: (val) => { store.difficultyFilter = val },
        })

        watch([
            specFilter,
            metricFilter,
            difficultyFilter,
        ], async(newValues, oldValues) => {
            const optionalFilters: OptionalFilters = {
                specName: specFilter.value,
                metric: metricFilter.value,
                difficulty: difficultyFilter.value,
            }

            if (newValues.length > 0 && newValues.length === oldValues.length) {
                await store.save()
            }

            characterData.value = await store.fetchCharacterData(optionalFilters)
        }, {
            immediate: true,
        })

        const characterTierInfos = computed(() => {
            const tierInfos: Record<string, TierInfo> = {}

            for (const [tierName, tierInfo] of Object.entries(characterData.value ?? {})) {
                if (!(typeof tierInfo === 'object')) {
                    continue
                }

                if ('error' in tierInfo) {
                    console.warn(tierName, tierInfo.error)
                    continue
                }

                tierInfos[tierName] = tierInfo
            }

            return tierInfos
        })

        const getTierName = (tierName: string): string => {
            const matches = /^T(\d+)$/.exec(tierName)
            if (!matches) {
                return 'Unknown Tier Name'
            }

            const tier = matches[1] as Tier
            return _getTierName(tier)
        }

        const getRaidProgress = (tierName: string): string => {
            const tierInfos = characterTierInfos.value[tierName]
            const numBosses = tierInfos.rankings.length
            let numBossesKilled = 0

            for (const bossRank of tierInfos.rankings) {
                if (bossRank.totalKills > 0) {
                    numBossesKilled += 1
                }
            }

            return `${numBossesKilled}/${numBosses}${getDifficultyShortName(difficultyFilter.value)}`
        }

        const bossIcons = getIconsBoss()
        const getBossIcon = (tier: Tier, encounterId: number): string | undefined => {
            const filename = `${tier}/${encounterId}.jpg`
            if (!(filename in bossIcons)) {
                console.warn(DEFINE.NAME, `Missing ${filename}`)
                return
            }

            return bossIcons[filename]
        }

        const specIcons = getIconsSpec()
        const getSpecIcon = (specName: string): string | undefined => {
            if (playerClassId.value === undefined) {
                console.warn(DEFINE.NAME, 'Missing player class')
                return
            }

            const playerClassName = getClassName(playerClassId.value)
            const filename = `${playerClassName}-${specName}.jpg`.toLowerCase()
            if (!(filename in specIcons)) {
                console.warn(DEFINE.NAME, `Missing ${filename}`)
                return
            }

            return specIcons[filename]
        }

        const playerClassId = computed(() => characterData.value?.classID)
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

            Tier,
            Metric,
            Difficulty,

            formatPercent,
            formatNumber,
            getParseRankColor,
        }
    },
})
</script>

<template>
    <div
        v-if="!isLoading && !hasErrors"
        class="raid-rankings"
    >
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
            v-for="[tierName, tierInfo] of Object.entries(characterTierInfos)"
            :key="tierName"
            class="raid-ranking"
        >
            <h2>
                {{ getTierName(tierName) }} ({{ getRaidProgress(tierName) }})
            </h2>

            <table>
                <thead>
                    <tr>
                        <td>
                            <!-- Boss -->
                        </td>
                        <td>
                            <!-- Best Spec -->
                        </td>
                        <td>
                            Best <span style="text-transform: uppercase;">{{ metricFilter }}</span>
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
                                {{ formatNumber(bossRank.bestAmount) }}
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
                                {{ formatNumber(bossRank.allStars.points) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.allStars && bossRank.allStars.possiblePoints > 0"
                                :style="{ color: getParseRankColor(bossRank.allStars.rankPercent) }"
                            >
                                {{ formatNumber(bossRank.allStars.rank) }}
                            </span>
                            <span
                                v-else
                                class="blank"
                            />
                        </td>
                        <td>
                            <span
                                v-if="bossRank.totalKills > 0"
                                :style="{ color: getParseRankColor(bossRank.rankPercent) }"
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
                                :style="{ color: getParseRankColor(bossRank.medianPercent) }"
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
                                {{ formatNumber(bossRank.totalKills) }}
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

<style lang="scss" scoped>
.raid-rankings{
    display: grid;
    gap: $padding;
}

.raid-ranking{
    display: grid;
    gap: $padding;

    h2{
        font-size: 1.3rem;
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
                vertical-align: middle;

                &.boss-name{
                    display: grid;
                    grid-template-columns: $height 1fr;
                    gap: $padding;
                    text-align: left;
                }

                img{
                    display: block;
                    height: $height;
                    width: $height;
                }

                span{
                    display: inline-block;
                    height: $height;
                    line-height: $height;

                    &.blank:before{
                        content: '-';
                        color: var(--common);
                        width: $height;
                    }
                }
            }
        }
    }
}
</style>
