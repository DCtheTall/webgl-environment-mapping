const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  output: { filename: './public/bundle.js' },
  resolve: {
    extensions: ['.ts', '.js', '.d.ts'],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
  plugins: [
    new UglifyJsWebpackPlugin(),
  ],
};
