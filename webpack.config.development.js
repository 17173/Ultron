/* eslint strict: 0 */
'use strict';

var vue = require('vue-loader');
var webpack = require('webpack');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');


var config = Object.create(baseConfig);

config.debug = true;

config.devtool = 'cheap-module-eval-source-map';

config.entry = [
  'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
  './app/main.js'
];

config.output.publicPath = 'http://localhost:3000/';

config.module.loaders.push({
  test: /\.vue$/,
  loader: vue.withLoaders({
    // apply babel transform to all javascript
    // inside *.vue files.
    js: 'babel?optional[]=runtime&loose=all'
  })
});


config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': true,
    'process.env': JSON.stringify('development')
  })
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
