<template>
    <div class="warcraftlogs">
        <h1>
            <a
                :href="`https://www.warcraftlogs.com/character/${region}/${realm}/${characterName}`"
                target="_blank"
            >
                <img src="@/assets/img/links/warcraftlogs.png">
                Warcraft Logs
            </a>
        </h1>

        <div
            v-if="errorMessage"
            class="notice error"
        >
            {{ errorMessage }}
        </div>

        <Loader
            v-if="isLoading"
        />

        <WarcraftLogsAuth
            v-if="!accessToken"
        />
        <WarcraftLogsRaidRankings
            v-else
        />

        <a
            v-if="accessToken"
            class="btn"
            @click="resetApi"
        >
            Reset API
        </a>
    </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import { computed, defineComponent } from 'vue'
import Loader from './Loader.vue'
import WarcraftLogsAuth from './WarcraftLogsAuth.vue'
import WarcraftLogsRaidRankings from './WarcraftLogsRaidRankings.vue'
import { useTypedStore } from '@/store'

export default defineComponent({
    components: {
        Loader,
        WarcraftLogsAuth,
        WarcraftLogsRaidRankings,
    },

    setup() {
        const store = useTypedStore()

        const isLoading = computed(() => store.state.isLoading)

        const resetApi = async() => {
            await store.dispatch('reset')
        }

        return {
            isLoading,
            resetApi,
        }
    },

    computed: mapState([
        'errorMessage',
        'region',
        'realm',
        'characterName',
        'accessToken',
    ]),
})
</script>

<style lang="scss">
.warcraftlogs{
    border: $border;
    padding: $margin;

    h1,
    h2,
    p,
    ul,
    form,
    label,
    .btn,
    .notice,
    .btn-group,
    .raid-ranking{
        margin: $margin 0;

        &:first-child{
            margin-top: 0;
        }
        &:last-child{
            margin-bottom: 0;
        }
    }

    h1{
        margin: 0;
        margin: $margin 0;
        line-height: $margin * 2;

        a{
            display: block;
            overflow: hidden;

            &:hover{
                text-decoration: none;
            }

            img{
                display: block;
                float: left;
                margin-right: 10px;
                width: $margin * 2;
                height: $margin * 2;
            }
        }
    }

    .notice{
        color: white;
        display: block;
        padding: $margin;

        &.warning{
            background: black;
        }
        &.error{
            background: #300a0e;
        }
    }

    form{
        label{
            align-items: center;
            display: grid;
            grid-template-columns: 1fr 5fr;

            input{
                padding: ($margin / 2)
            }
        }
    }

    .btn{
        background: #333;
        border: $border;
        color: white;
        cursor: pointer;
        display: block;
        padding: ($margin / 2) $margin;
        transition: 0.25s;

        &:hover{
            background: #222;
        }

        &.active{
            border-color: white;
            background: #111;
        }
    }

    .btn-group{
        display: flex;
        gap: $margin;

        a.btn{
            flex: 1;
            margin: 0;
        }
    }

    .raid{
        border: $border;
        padding: $margin;

        h2{
            margin: 0;
            margin-bottom: $margin / 2;
        }
    }
}
</style>
