// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ComponentCustomProperties } from 'vue'
import { RootState } from '@/store'
import { Store } from 'vuex'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store<RootState>
    }
}
