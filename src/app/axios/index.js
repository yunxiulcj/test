import vueSystem from '@/app/vue-system'
import { requestInterceptor, responseInterceptor, error } from './interceptors'
import { clone } from '@/utils/obj-operation'
import store from '@/app/store/index'

/**
 * axios 实例
 */
/* eslint-disable */
let baseSetting = {
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
  // baseURL:'/api',
  withCredentials: true
}
let instance = vueSystem.axios.create(baseSetting)

instance.interceptors.request.use(requestInterceptor)

instance.interceptors.response.use(responseInterceptor, error)

/**
 * iframe 页面通信
 */

window.addEventListener('message', responseInterceptor, false)

export default function request (config, funcName, data, baseConfig = {}) {
  if (typeof config[funcName] !== 'object') {
    console.log(
      '%c调用api函数函数错误，请检查函数名称是否错误',
      'color: red',
      funcName
    )
    return
  }
  let newConfig = clone(config[funcName])
  if (data) {
    let cloneData = clone(data)
    newConfig.url = newConfig.url.replace(/\{([\d\w_]+)\}/g, (word, $1) => {
      let res = cloneData[$1]
      // 删除data中的对应字段
      delete cloneData[$1]
      return res
    })
    newConfig.data = cloneData
  }
  /**
   * 根据代理设置路径
   */
  let url = newConfig.url
  let symSetting = store.getters.symSetting
  let condev = process.env.NODE_ENV === 'production' ? symSetting.host : '/api'
  window.urlHead = condev
  newConfig.url = condev + url
  if (data != undefined && data.isRestful) {
    newConfig.url = newConfig.url + data.param
  }
  if (data != undefined && data.methodName == 'get') {
    return instance.get(newConfig.url, newConfig.data, baseConfig)
  }
  return instance.post(newConfig.url, newConfig.data, baseConfig)
}
