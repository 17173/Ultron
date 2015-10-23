/* eslint strict: 0 */
'use strict';

var vue = require('vue-loader')
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
var baseConfig = require('./webpack.config.base');


var config = Object.create(baseConfig);

config.devtool = 'source-map';

config.entry = './app/main';

config.output.publicPath = '/';

var stylesTextPlugin = new ExtractTextPlugin('style.css', { allChunks: true });
var globalStylesTextPlugin = new ExtractTextPlugin('global-style.css', { allChunks: true });

config.module.loaders.push({
  test: /\.vue$/,
  loader: vue.withLoaders({
    // apply babel transform to all javascript
    // inside *.vue files.
    js: 'babel?optional[]=runtime&loose=all'
  })
});

config.plugins.push(
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env': JSON.stringify('production')
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false
    }
  }),
  stylesTextPlugin,
  globalStylesTextPlugin
);

config.target = webpackTargetElectronRenderer(config);

module.exports = config;
