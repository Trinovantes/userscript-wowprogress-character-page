<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { OptionalFilters, CharacterData, TierInfo } from '@/services/WarcraftLogsV2'
import { useStore } from '@/store/useStore'
import WarcraftLogsOverviewRaid from './WarcraftLogsOverviewRaid.vue'
import { getClassName, getClassSpecs } from '@/services/WowClass'
import { Metric } from '@/services/Metric'
import { Difficulty, getDifficultyFullName } from '@/services/Difficulty'
import { Tier, getTierName } from '@/services/Tier'

const store = useStore()
const specFilter = ref<string>('')
const metricFilter = computed<Metric>({
    get: () => store.metricFilter,
    set: (val) => { store.metricFilter = val },
})
const difficultyFilter = computed<Difficulty>({
    get: () => store.difficultyFilter,
    set: (val) => { store.difficultyFilter = val },
})

const characterData = ref<CharacterData | undefined>()
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

    const hasChanges = newValues.length > 0
    const isNotFirstTime = newValues.length === oldValues.length

    if (hasChanges && isNotFirstTime) {
        await store.save()
    }

    characterData.value = await store.fetchCharacterData(optionalFilters)
}, {
    immediate: true,
})

const playerClassId = computed(() => characterData.value?.classID)
const playerClassName = computed(() => getClassName(playerClassId.value))
const playerSpecs = computed(() => getClassSpecs(playerClassId.value))
const playerTierInfos = computed(() => {
    const tierInfos: Partial<Record<Tier, TierInfo>> = {}

    for (const [tier, tierInfo] of Object.entries(characterData.value ?? {}).reverse()) {
        if (!(typeof tierInfo === 'object')) {
            continue
        }

        if ('error' in tierInfo) {
            console.warn(tier, tierInfo.error)
            continue
        }

        tierInfos[tier as Tier] = tierInfo
    }

    return tierInfos
})
</script>

<template>
    <div
        v-if="!store.errorMessage && !store.isLoading"
        class="flex-vgap"
    >
        <div class="flex-hgap">
            <button
                v-for="metric of Object.values(Metric)"
                :key="metric"
                style="text-transform: uppercase;"
                :class="{
                    'btn': true,
                    'flex-1': true,
                    'active': metricFilter === metric
                }"
                @click="metricFilter = metric"
            >
                {{ metric }}
            </button>
        </div>
        <div class="flex-hgap">
            <button
                :class="{
                    'btn': true,
                    'flex-1': true,
                    'active': !specFilter,
                }"
                @click="specFilter = ''"
            >
                All Specs
            </button>
            <button
                v-for="spec of playerSpecs"
                :key="spec.name"
                :class="{
                    'btn': true,
                    'flex-1': true,
                    'active': specFilter === spec.name,
                }"
                @click="specFilter = spec.name"
            >
                {{ spec.name }}
            </button>
        </div>
        <div class="flex-hgap">
            <button
                v-for="difficulty of Difficulty"
                :key="difficulty"
                :class="{
                    'btn': true,
                    'flex-1': true,
                    'active': difficultyFilter === difficulty,
                }"
                @click="difficultyFilter = difficulty"
            >
                {{ getDifficultyFullName(difficulty) }}
            </button>
        </div>

        <WarcraftLogsOverviewRaid
            v-for="[tier, tierInfo] of Object.entries(playerTierInfos)"
            :key="tier"
            :tier-name="getTierName(tier as Tier)"
            :tier-info="tierInfo"
            :player-class-name="playerClassName"
            :metric-filter="metricFilter"
            :difficulty-filter="difficultyFilter"
        />

        <div>
            <button
                class="btn"
                title="This will reset your settings and you will need to re-enter your Warcraft Logs API client id/secret again"
                @click="store.resetSettings()"
            >
                Reset Settings
            </button>
        </div>
    </div>
</template>
