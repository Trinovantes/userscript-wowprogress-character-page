<script lang="ts" setup>
import { useStore } from '@/store/useStore'
import { projectTitle, projectUrl } from '@/Constants'
import WarcraftLogsOverview from './WarcraftLogsOverview.vue'
import WarcraftLogsAuthForm from './WarcraftLogsAuthForm.vue'
import SpinningLoader from './SpinningLoader.vue'

const store = useStore()
</script>

<template>
    <div class="flex-vgap">
        <h1>
            <a
                :href="`https://www.warcraftlogs.com/character/${store.region}/${store.realm}/${store.characterName}`"
                target="_blank"
                class="flex-hgap"
            >
                <img src="@/assets/img/links/warcraftlogs.png">
                Warcraft Logs
            </a>
        </h1>

        <div>
            <a
                :href="projectUrl"
                target="_blank"
                :title="projectTitle"
            >
                {{ projectTitle }}
            </a>
        </div>

        <aside
            v-if="store.errorMessage"
            class="notice error"
        >
            {{ store.errorMessage }}
        </aside>

        <SpinningLoader
            v-if="store.isLoading"
        />

        <WarcraftLogsOverview
            v-if="store.accessToken"
        />
        <WarcraftLogsAuthForm
            v-else
        />
    </div>
</template>

<style lang="scss" scoped>
h1{
    line-height: $padding * 2;

    a{
        align-items: center;
        color: white;
        font-size: 1.5rem;

        img{
            display: block;
            width: $padding * 2;
            height: $padding * 2;
        }
    }
}
</style>
