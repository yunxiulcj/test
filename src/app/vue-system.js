import VueSystem from 'vue-system'
import Router from 'vue-router'
import Axios from 'axios'

/**
 * vue-system封装了一些钩子
 *
 * Router：
 *        registerInitScript(fn) 注册全局js
 *        registerPermission(fn) 注册权限函数
 *
 * Axios:
 *        registerReqManage(reqWhitelist, mode) 注册请求管理器
 */
export default new VueSystem(Axios, Router)
