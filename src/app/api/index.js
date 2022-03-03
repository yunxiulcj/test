import request from '@/app/axios/index'
import appManage from "./modules/appManage";
import common from "./modules/common";
import deliveryGroupManage from "./modules/deliveryGroupManage";
import sessionManage from "./modules/sessionManage";
import vmManage from "./modules/vmManage";
import systemManage from './modules/systemManage';

const config={
    ...appManage,
    ...common,
    ...deliveryGroupManage,
    ...sessionManage,
    ...vmManage,
    ...systemManage
}

/**
 *
 * @param {*} funcName 请求名
 * @param {*} data 数据
 * @param {*} baseConfig axios 默认配置
 */
 export default function req(funcName, data, baseConfig) {
    return request(config, funcName, data, baseConfig)
  }