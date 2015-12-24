var vue = require('vue-loader')
var webpack = require('webpack')
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');

var options = {
  entry: './app/main.js',
  output: {
    path: './app',
    publicPath: '/app/',
    filename: 'app.js'
  },

  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      }, {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      }, {
        // edit this for additional asset file types
        test: /\.(png|jpg|gif)$/,
        loader: 'url',
        query: {
          // inline files smaller then 10kb as base64 dataURL
          limit: 10000,
          // fallback to file-loader with this naming scheme
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  vue: {
    loaders: {
      js: 'babel'
    }
  },
  // configure babel-loader (for both .js and .vue files).
  // see https://babeljs.io/docs/usage/options/
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
};

if (process.env.NODE_ENV === 'production') {
  options.plugins = [
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
  options.devtool = '#source-map';
}

options.target = webpackTargetElectronRenderer(options);

module.exports = options;
