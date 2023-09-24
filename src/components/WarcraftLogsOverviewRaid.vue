<script lang="ts" setup>
import { computed } from 'vue'
import { formatNumber } from '@/utils/formatNumber'
import { formatPercent } from '@/utils/formatPercent'
import { getBossIcon } from '@/utils/getBossIcon'
import { getSpecIcon } from '@/utils/getSpecIcon'
import { getParseRankColor } from '@/utils/getParseRankColor'
import { TierInfo } from '@/services/WarcraftLogsV2'
import { Difficulty, getDifficultyShortName } from '@/services/Difficulty'
import { Metric } from '@/services/Metric'

const props = defineProps<{
    tierName: string
    tierInfo: TierInfo
    playerClassName: string
    metricFilter: Metric
    difficultyFilter: Difficulty
}>()

const raidProgress = computed(() => {
    const numBosses = props.tierInfo.rankings.length
    let numBossesKilled = 0

    for (const bossRank of props.tierInfo.rankings) {
        if (bossRank.totalKills > 0) {
            numBossesKilled += 1
        }
    }

    return `${numBossesKilled} / ${numBosses} ${getDifficultyShortName(props.difficultyFilter)}`
})
</script>

<template>
    <div class="flex-vgap">
        <h2>
            {{ tierName }} ({{ raidProgress }})
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
                            :src="getSpecIcon(playerClassName, bossRank.bestSpec)"
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
</template>

<style lang="scss" scoped>
h2{
    font-size: 1.5rem;
    margin-top: $padding;
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
</style>
