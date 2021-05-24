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

        <div class="btn-group">
            <a
                class="btn"
                title="This will attempt to reload all the data"
                @click="resetAccessToken"
            >
                Reload
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

<script lang="ts">
import { computed, defineComponent } from 'vue'
import Loader from './Loader.vue'
import WarcraftLogsAuth from './WarcraftLogsAuth.vue'
import WarcraftLogsRaidRankings from './WarcraftLogsRaidRankings.vue'
import { Action, useTypedStore } from '@/store'

export default defineComponent({
    components: {
        Loader,
        WarcraftLogsAuth,
        WarcraftLogsRaidRankings,
    },

    setup() {
        const store = useTypedStore()

        const isLoading = computed(() => store.state.isLoading)
        const errorMessage = computed(() => store.state.errorMessage)
        const region = computed(() => store.state.region)
        const realm = computed(() => store.state.realm)
        const characterName = computed(() => store.state.characterName)
        const accessToken = computed(() => store.state.accessToken)

        const resetAccessToken = async() => {
            await store.dispatch(Action.RESET_ACCESS_TOKEN)
        }

        const resetEverything = async() => {
            await store.dispatch(Action.RESET_EVERYTHING)
        }

        return {
            isLoading,
            errorMessage,
            region,
            realm,
            characterName,
            accessToken,

            resetAccessToken,
            resetEverything,
        }
    },
})
</script>

<style lang="scss">
.warcraftlogs{
    border: $border;
    padding: $padding;

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
        margin: $padding 0;

        &:first-child{
            margin-top: 0;
        }
        &:last-child{
            margin-bottom: 0;
        }
    }

    h1{
        margin: 0;
        margin: $padding 0;
        line-height: $padding * 2;

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
                width: $padding * 2;
                height: $padding * 2;
            }
        }
    }

    .notice{
        color: white;
        display: block;
        padding: $padding;

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
                padding: math.div($padding, 2)
            }
        }
    }

    .btn{
        background: #333;
        border: $border;
        color: white;
        cursor: pointer;
        display: block;
        padding: math.div($padding, 2) $padding;
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
        gap: $padding;

        a.btn{
            flex: 1;
            margin: 0;
        }
    }

    .raid{
        border: $border;
        padding: $padding;

        h2{
            margin: 0;
            margin-bottom: math.div($padding, 2);
        }
    }
}
</style>
