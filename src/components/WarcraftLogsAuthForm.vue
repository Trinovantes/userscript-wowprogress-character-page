<script lang="ts" setup>
import { computed } from 'vue'
import { useStore } from '@/store/useStore'

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
</script>

<template>
    <form
        class="flex-vgap"
        @submit="onSubmit"
    >
        <aside class="notice warning">
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
        </aside>

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

        <button
            type="submit"
            class="btn"
        >
            Authenticate
        </button>
    </form>
</template>

<style lang="scss" scoped>
label{
    align-items: center;
    display: grid;
    grid-template-columns: 1fr 5fr;

    input{
        padding: math.div($padding, 2)
    }
}
</style>
