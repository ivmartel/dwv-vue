const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/dwv-vue/demo/' + process.env.DEPLOY_NAME + '/' : '/',
  configureWebpack: {
    plugins: [
      // copy decoders
      new CopyWebpackPlugin([
        {
          from: './node_modules/dwv/decoders',
          to: 'assets/dwv/decoders'
        }
      ])
    ]
  }
}
