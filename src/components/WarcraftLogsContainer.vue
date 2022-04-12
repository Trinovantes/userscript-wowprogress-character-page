<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import SpinningLoader from './SpinningLoader.vue'
import WarcraftLogsAuth from './WarcraftLogsAuth.vue'
import WarcraftLogsRaidRankings from './WarcraftLogsRaidRankings.vue'
import { useStore, region, realm, characterName } from '@/store'

export default defineComponent({
    components: {
        SpinningLoader,
        WarcraftLogsAuth,
        WarcraftLogsRaidRankings,
    },

    setup() {
        const store = useStore()
        const isLoading = computed(() => store.isLoading)
        const errorMessage = computed(() => store.errorMessage)
        const accessToken = computed(() => store.accessToken)

        onMounted(async() => {
            await store.load()
            await store.authenticate()
        })

        const refresh = async() => {
            await store.resetAccessToken()
            await store.authenticate()
        }

        const resetEverything = async() => {
            await store.resetEverything()
        }

        return {
            region,
            realm,
            characterName,

            isLoading,
            errorMessage,
            accessToken,

            refresh,
            resetEverything,
        }
    },
})
</script>

<template>
    <div class="warcraftlogs-container">
        <h1>
            <a
                :href="`https://www.warcraftlogs.com/character/${region}/${realm}/${characterName}`"
                target="_blank"
            >
                <img src="@/assets/img/links/warcraftlogs.png">
                Warcraft Logs
            </a>
        </h1>

        <SpinningLoader
            v-if="isLoading"
        />

        <div
            v-if="errorMessage"
            class="notice error"
        >
            {{ errorMessage }}
        </div>

        <WarcraftLogsRaidRankings
            v-if="accessToken"
        />
        <WarcraftLogsAuth
            v-else
        />

        <div class="btn-group">
            <a
                class="btn"
                title="This will attempt to refresh all of the data"
                @click="refresh"
            >
                Refresh
            </a>
            <a
                class="btn"
                title="This will reset your settings and you will need to re-enter your Warcraft Logs API client id/secret again"
                @click="resetEverything"
            >
                Reset Everything
            </a>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.warcraftlogs-container{
    border: $border;
    display: grid;
    gap: $padding;
    padding: $padding;
}

h1{
    line-height: $padding * 2;

    a{
        display: block;
        font-size: 1.5rem;
        overflow: hidden;

        &:hover{
            text-decoration: none;
        }

        img{
            display: block;
            float: left;
            margin-right: 10px;
            width: $padding * 2;
            height: $padding * 2;
        }
    }
}
</style>
