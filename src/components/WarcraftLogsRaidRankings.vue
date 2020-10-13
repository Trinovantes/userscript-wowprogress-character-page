<template>
    <div>
        <h2>{{ getTierName(tierKey) }} ({{ getProgress(tierRank) }})</h2>
        <table>
            <thead>
                <tr>
                    <td>
                        Boss
                    </td>
                    <td />
                    <td>
                        Best <span class="metric">{{ tierRank.metric }}</span>
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
                    v-for="bossRank of tierRank.rankings"
                    :key="bossRank.encounter.id"
                >
                    <td>
                        <img
                            :src="require(`@img/bosses/${tierRank.zone}/${bossRank.encounter.id}.jpg`)"
                            class="wow-icon boss-icon"
                        >
                        {{ bossRank.encounter.name }}
                    </td>
                    <td>
                        <img
                            v-if="bossRank.totalKills > 0"
                            :src="require(`@img/specs/${getSpecIcon(classID, bossRank.bestSpec)}`)"
                            class="wow-icon spec-icon"
                        >
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
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Vue from 'vue'

import { ITierRank } from '@models/WarcraftLogs'
import { Classes, getTierName, Tiers } from '@Constants'

@Component
export default class WarcraftLogsRaidRankings extends Vue {
    @Prop({ type: Number, required: true }) readonly classID!: number
    @Prop({ type: String, required: true }) readonly tierKey!: string
    @Prop({ type: Object, required: true }) readonly tierRank!: ITierRank

    getTierName(tierKey: Tiers): string {
        return getTierName(tierKey)
    }

    getProgress(tierRank: ITierRank): string {
        const numBosses = tierRank.rankings.length
        let numBossesKilled = 0

        for (const bossRank of tierRank.rankings) {
            if (bossRank.totalKills > 0) {
                numBossesKilled += 1
            }
        }

        return `${numBossesKilled}/${numBosses}M`
    }

    formatPercent(val: number): string {
        if (isNaN(val)) {
            return '-'
        }

        const percentFormatter = new Intl.NumberFormat(navigator.language, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
            style: 'percent',
        })

        return percentFormatter.format(val)
    }

    formatNum(val: number): string {
        if (isNaN(val)) {
            return '-'
        }

        const numFormatter = new Intl.NumberFormat(navigator.language, {
            maximumFractionDigits: 0,
        })

        return numFormatter.format(val)
    }

    getRankColor(rank: number | undefined): string {
        if (!rank || isNaN(rank)) {
            return 'inherit'
        }

        let color = ''

        if (rank < 25) {
            color = 'common'
        } else if (rank < 50) {
            color = 'uncommon'
        } else if (rank < 75) {
            color = 'rare'
        } else if (rank < 95) {
            color = 'epic'
        } else if (rank < 99) {
            color = 'legendary'
        } else if (rank < 100) {
            color = 'astounding'
        } else if (rank === 100) {
            color = 'artifact'
        } else {
            return 'inherit'
        }

        return `var(--${color})`
    }

    getSpecIcon(classID: number, specName: string): string {
        const className = Object.values(Classes)[classID]
        return `${className}-${specName.toLowerCase()}.jpg`
    }
}
</script>

<style lang="scss" scoped>
h2{
    margin: 0;
    margin-bottom: $margin / 2;
}

table{
    $height: 30px;

    border-collapse: collapse;
    margin: 0;

    tr{
        td{
            line-height: $height;
            text-align: right;
            padding: 5px;

            &:first-child{
                text-align: left;
            }

            img.wow-icon{
                height: $height;
                width: $height;

                &.boss-icon {
                    float: left;
                    margin-right: 10px;
                }
                &.spec-icon{
                    float: left;
                }
            }

            span.blank:before{
                content: '-';
                color: var(--common);

                display: inline-block;
                height: $height;
                width: $height;
            }

            span.metric{
                text-transform: uppercase;
            }
        }
    }

    tbody{
        tr{
            border-top: $border;

            &:last-child{
                border-bottom: $border;
            }
        }
    }
}
</style>
