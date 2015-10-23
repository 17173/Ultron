var vue = require('vue-loader')
var webpack = require('webpack')

module.exports = {
  entry: './app/main.js',
  output: {
    path: './app',
    publicPath: '/app/',
    filename: 'build.js'
  },
  target: 'atom',

  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: vue.withLoaders({
          // apply babel transform to all javascript
          // inside *.vue files.
          js: 'babel?optional[]=runtime&loose=all'
        })
      }
    ]
    //exclude: ['dialog']
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
} else {
  module.exports.devtool = '#source-map'
}
