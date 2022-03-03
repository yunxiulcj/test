import axios from 'axios'
import store from '@/app/store/index'

/**
 * 获取配置
 */
export default async function () {
  let { data } = await axios.get('./config.json')
  store.commit('SET_SYM_SETTING', data)
}
