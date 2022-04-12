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
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
    setup() {
        const store = useStore()

        const clientId = computed({
            get() {
                return store.clientId
            },
            set(val: string) {
                store.clientId = val.trim()
            },
        })

        const clientSecret = computed({
            get() {
                return store.clientSecret
            },
            set(val: string) {
                store.clientSecret = val.trim()
            },
        })

        const onSubmit = async(event: Event) => {
            event.preventDefault()
            await store.authenticate()
        }

        return {
            clientId,
            clientSecret,
            onSubmit,
        }
    },
})
</script>
