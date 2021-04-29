<template>
    <form
        @submit="onSubmit"
    >
        <div class="notice warning">
            <p>
                You need to <a href="https://www.warcraftlogs.com/api/clients/" target="_blank">obtain a Warcraft Logs v2 client API key</a>.
            </p>
            <ul>
                <li>
                    Use a descriptive name (e.g. "[your username]-userscript") for the application name
                </li>
                <li>
                    Use "https://www.wowprogress.com" for the redirect URL
                </li>
                <li>
                    Do not enable public client
                </li>
            </ul>
        </div>
        <label>
            <span>Client Id</span>
            <input
                v-model="clientId"
                type="text"
            >
        </label>
        <label>
            <span>Client Secret</span>
            <input
                v-model="clientSecret"
                type="text"
            >
        </label>
        <button type="submit" class="btn">
            Authenticate
        </button>
    </form>
</template>

<script lang="ts">
import { RootAction, RootMutation, useTypedStore } from '@/store'
import { computed, defineComponent, onMounted } from 'vue'

export default defineComponent({
    setup() {
        const store = useTypedStore()

        const clientId = computed({
            get() {
                return store.state.clientId
            },
            set(val: string) {
                store.commit(RootMutation.SET_CLIENT_ID, val)
            },
        })

        const clientSecret = computed({
            get() {
                return store.state.clientSecret
            },
            set(val: string) {
                store.commit(RootMutation.SET_CLIENT_SECRET, val)
            },
        })

        const onSubmit = async(event: Event) => {
            event.preventDefault()
            await store.dispatch(RootAction.AUTHENTICATE)
        }

        onMounted(async() => {
            await store.dispatch(RootAction.LOAD)
            await store.dispatch(RootAction.AUTHENTICATE)
        })

        return {
            clientId,
            clientSecret,
            onSubmit,
        }
    },
})
</script>
