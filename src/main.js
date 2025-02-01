import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueIntersect from 'vue-intersect'

createApp(App).use(VueIntersect).use(store).use(router).mount('#app')
