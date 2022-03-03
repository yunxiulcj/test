import Vue from 'vue'
import App from './App.vue'
import router from './app/router'
import store from './app/store'
import request from './app/api/index'
import promiseFinally from '@/utils/promise-finally'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'default-passive-events'
import '@/assets/css/index.css'
import '@/assets/css/element.css'
import '@/assets/iconfont/iconfont.css'

Vue.use(ElementUI)
Vue.prototype.$http = request
promiseFinally()
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app')

window.needReload = false
