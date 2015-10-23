var path = require('path');

module.exports = {
  module: {
    loaders: [{
      test: /\.vue?$/,
      loaders: ['vue-loader'],
      exclude: /node_modules/
    }]
  },
  output: {
    path: './app',
    publicPath: '/app/',
    filename: 'build.js'
  },
  plugins: [

  ],
  externals: [
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ]
};
