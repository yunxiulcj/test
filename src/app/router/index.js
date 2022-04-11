import Vue from 'vue'
import login from '@/views/login/index'
import vueSystem from '@/app/vue-system'
import initialScript from '@/app/initial-script/index'
import resourceManage from './modules/resourceManage'
import deliveryGroupManage from './modules/deliveryGroupManage'
import systemManage from './modules/systemManage'
import sessionManage from './modules/sessionManage'
import vmManage from './modules/vmManage'
// import strategyManage from './modules/strategyManage'
// import noticeManage from './modules/noticeManage'
Vue.use(vueSystem.router)

const defaultRouter = [
  ...resourceManage,
  ...deliveryGroupManage,
  ...vmManage,
  ...sessionManage,
  ...systemManage,
  // ...strategyManage,
  // ...noticeManage,
  
]
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/frame/index.vue'),
    redirect: '/resourceManage',
    children: [...defaultRouter],
  },
  {
    path: '/login',
    name: 'login',
    component: login,
  },
  {
    path: '*',
    name: 'error',
    component: () => import('@/views/error/index.vue'),
  },
]
const router = new vueSystem.router({
  routes,
})
router.registerInitScript(() => {
  return initialScript()
    .then(() => {
      console.log('挂载全局函数成功')
    })
    .catch((e) => {
      console.log('初始化全局script失败')
      console.log(e)
    })
})
router.beforeEach((to, from, next) => {
  // request.reqManage && request.reqManage.cancelRouterReq(from.path)
  // if (from.path == '/login') {
  //   refreshRouter()
  // }
  next()
})
export { defaultRouter }
export default router
