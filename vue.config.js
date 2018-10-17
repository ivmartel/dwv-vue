const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
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