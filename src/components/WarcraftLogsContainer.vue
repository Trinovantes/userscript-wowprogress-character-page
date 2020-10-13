<template>
    <div class="data-source">
        <h1>
            <a
                v-if="rankings"
                :href="`https://www.warcraftlogs.com/character/id/${rankings.canonicalID}`"
                target="_blank"
                class="link"
            >
                Warcraft Logs
                <img src="@img/links/warcraftlogs.png" alt="Link">
            </a>
            <span v-else>
                Warcraft Logs
            </span>
        </h1>

        <Loader :show="loading" />

        <span
            v-if="errorMessage"
            class="error"
        >
            {{ errorMessage }}
        </span>

        <form
            v-if="!loading && !client.accessToken"
            @submit="onSubmitClientCredentials"
        >
            <span class="warning">
                You need to <a href="https://www.warcraftlogs.com/api/clients/" target="_blank">register</a> a Warcraft Logs v2 API key
            </span>
            <label>
                <span>Client Id</span>
                <input
                    v-model="client.clientId"
                    type="text"
                    @input="onInputChanged"
                >
            </label>
            <label>
                <span>Client Secret</span>
                <input
                    v-model="client.clientSecret"
                    type="text"
                    @input="onInputChanged"
                >
            </label>
            <button type="submit">
                Set Up
            </button>
        </form>

        <div v-if="!loading && rankings">
            <div class="btn-group">
                <a
                    :class="`btn ${metricFilter === Metrics.DPS ? 'active' : ''}`"
                    @click="metricFilter = Metrics.DPS"
                >
                    DPS
                </a>
                <a
                    :class="`btn ${metricFilter === Metrics.HPS ? 'active' : ''}`"
                    @click="metricFilter = Metrics.HPS"
                >
                    HPS
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
                    v-for="spec of Specs[Object.values(Classes)[rankings.classID]]"
                    :key="spec.name"
                    :class="`btn ${specFilter === spec.name ? 'active' : ''}`"
                    @click="specFilter = spec.name"
                >
                    {{ spec.name }}
                </a>
            </div>
            <div
                v-for="[tierKey, tierRank] of Object.entries(getCurrentRankings())"
                :key="tierKey"
                class="raid"
            >
                <WarcraftLogsRaidRankings
                    :class-i-d="rankings.classID"
                    :tier-key="tierKey"
                    :tier-rank="tierRank"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Prop, Watch } from 'vue-property-decorator'
import Vue from 'vue'

import { Classes, CurrentTiers, Metrics, Regions, Specs, Tiers } from '../Constants'
import WarcraftLogs, { ICharacterRankings } from '@models/WarcraftLogs'

import Loader from './Loader.vue'
import WarcraftLogsRaidRankings from './WarcraftLogsRaidRankings.vue'

@Component({
    components: {
        Loader: Loader,
        WarcraftLogsRaidRankings: WarcraftLogsRaidRankings,
    },
})
export default class WarcraftLogsContainer extends Vue {
    @Prop({ type: String, required: true }) readonly region!: Regions
    @Prop({ type: String, required: true }) readonly realm!: string
    @Prop({ type: String, required: true }) readonly name!: string

    Metrics = Metrics
    Classes = Classes
    Specs = Specs

    client = new WarcraftLogs()

    metricFilter: Metrics = Metrics.Default
    specFilter: string = ''
    rankings: ICharacterRankings | null = null
    loading = false
    errorMessage = ''

    created(): void {
        void this.client.load()
    }

    async onInputChanged(): Promise<void> {
        await this.client.save()
    }

    // eslint-disable-next-line no-undef
    async onSubmitClientCredentials(event: SubmitEvent): Promise<void> {
        event.preventDefault()

        try {
            this.errorMessage = ''
            this.loading = true

            await this.client.authenticate()
        } catch (e) {
            const errorMessage = e as string
            console.warn(errorMessage)
            this.errorMessage = errorMessage
            await this.client.reset()
        } finally {
            this.loading = false
        }
    }

    private async fetch(): Promise<void> {
        try {
            this.errorMessage = ''
            this.loading = true

            this.rankings = await this.client.fetchInfo(this.region, this.realm, this.name, {
                metric: this.metricFilter,
                specName: this.specFilter,
            })

            if (!this.rankings) {
                this.errorMessage = 'Failed to find character on Warcraft Logs'
            }
        } catch (e) {
            const errorMessage = e as string
            console.warn(errorMessage)
            this.errorMessage = errorMessage
            await this.client.reset()
        } finally {
            this.loading = false
        }
    }

    @Watch('client.accessToken')
    async onAccessTokenChange(accessToken: string): Promise<void> {
        if (!accessToken) {
            return
        }

        await this.fetch()
    }

    @Watch('metricFilter')
    async onChangeMetric(metric: Metrics, oldMetric: Metrics): Promise<void> {
        if (metric === oldMetric || oldMetric === Metrics.Default) {
            return
        }

        await this.fetch()
    }

    @Watch('specFilter')
    async onChangeSpec(specName: string, oldSpecName: string): Promise<void> {
        if (specName === oldSpecName) {
            return
        }

        await this.fetch()
    }

    @Watch('rankings')
    updateMetricFilter(rankings: ICharacterRankings | null, oldRankings: ICharacterRankings | null): void {
        if (!rankings || rankings === oldRankings) {
            return
        }

        for (const [tierKey, tierRank] of Object.entries(rankings)) {
            if (Object.values(CurrentTiers).indexOf(tierKey as Tiers) === -1) {
                continue
            }

            // Assuming all zones use same metric so we only need to return the metric of the first zone
            this.metricFilter = tierRank?.metric || Metrics.Default
            return
        }
    }

    getCurrentRankings(): ICharacterRankings {
        if (!this.rankings) {
            return {}
        }

        const currentRankings: ICharacterRankings = {}
        for (const [tierKey, tierRank] of Object.entries(this.rankings)) {
            if (Object.values(CurrentTiers).indexOf(tierKey as Tiers) === -1) {
                continue
            }

            currentRankings[tierKey as Tiers] = tierRank
        }

        return currentRankings
    }
}
</script>

<style lang="scss" scoped>
.data-source {
    border: $border;
    padding: $margin;

    h1{
        margin: 0;
        margin-bottom: 1em;
        line-height: $margin * 2;

        a.link{
            display: block;
            overflow: hidden;

            img{
                display: block;
                float: left;
                margin-right: 10px;
                width: $margin * 2;
                height: $margin * 2;
            }
        }
    }

    span.warning,
    span.error {
        display: block;
        margin: 10px 0;
    }

    form{
        label{
            display: flex;

            span{
                display: inline-block;
                flex: 0.2;
            }

            input{
                flex: 1;
            }
        }

        button{
            cursor: pointer;
            padding: $padding;
        }
    }

    .btn-group{
        margin-bottom: $margin / 2;
        overflow: hidden;

        a.btn{
            background: #333;
            border: $border;
            cursor: pointer;
            display: block;
            float: left;
            padding: $padding;

            &.active{
                border-color: white;
                background: rgba(black, 0.25);
            }
        }
    }

    .raid{
        border: $border;
        padding: $margin;
        margin-top: $margin / 2;

        h2{
            margin: 0;
            margin-bottom: $margin / 2;
        }
    }
}
</style>
