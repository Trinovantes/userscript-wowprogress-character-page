<template>
    <div v-if="show" class="loader">
        Loading
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component
export default class Loader extends Vue {
    @Prop({ type: Boolean, default: false }) readonly show!: boolean
}
</script>

<style lang="scss">
.loader {
    border-radius: 50%;
    width: 4em;
    height: 4em;
}

.loader {
    border: 1em solid rgba(white, 0.2);
    border-left-color: white;
    margin: $margin auto;
    text-indent: -9999em;

    transform: translateZ(0);
    animation: load8 1.5s infinite linear;
}

@-webkit-keyframes load8 {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
@keyframes load8 {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

</style>
