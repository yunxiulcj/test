const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: 'virtual',
  assetsDir: 'static',
  productionSourceMap: false,
  transpileDependencies: true,
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title= '信创虚拟化'
        return args
      })
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.22:9005',
        changeOrigin: true,
        pathRewrite:{
          '^/api': ''
      }
      },
    },
    port: 9005,
  },
})
