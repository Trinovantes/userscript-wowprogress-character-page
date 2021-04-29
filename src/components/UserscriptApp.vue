<template>
    <WarcraftLogsContainer />

    <div class="credit">
        <a :href="projectUrl">
            {{ title }}
        </a>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import WarcraftLogsContainer from './WarcraftLogsContainer.vue'

export default defineComponent({
    components: {
        WarcraftLogsContainer,
    },

    setup() {
        return {
            title: `${DEFINE.PRODUCT_NAME} ${DEFINE.VERSION}`,
            projectUrl: DEFINE.REPO.url,
        }
    },
})
</script>

<style lang="scss" scoped>
.credit{
    margin: $padding 0;

    a{
        text-decoration: none;

        &:hover{
            text-decoration: underline;
        }
    }
}
</style>
