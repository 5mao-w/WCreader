const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
module.exports = {
  devServer: {
    proxy: {
      '/covers': {
        target: 'http://localhost:5239/public',
        changeOrigin: true
      }
    }
  }
}
