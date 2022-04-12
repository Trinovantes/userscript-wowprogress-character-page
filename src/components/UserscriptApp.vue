<script lang="ts">
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

<template>
    <div class="userscript-wowprogress-character-page">
        <WarcraftLogsContainer />

        <div class="credit">
            <a
                :href="projectUrl"
                :title="title"
            >
                {{ title }}
            </a>
        </div>
    </div>
</template>

<style lang="scss">
.userscript-wowprogress-character-page{
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video{
        background: none;
        outline: none;
        border: none;
        margin: 0;
        padding: 0;

        color: #fff;
        font-size: 15px;
        font-weight: normal;
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.5;
        vertical-align: baseline;
    }

    .notice{
        color: white;
        display: grid;
        gap: $padding;
        padding: $padding;

        ul{
            padding-left: $padding;
        }

        &.warning{
            background: black;
        }
        &.error{
            background: #300a0e;
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
}
</style>

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
