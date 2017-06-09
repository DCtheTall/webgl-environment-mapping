module.exports = {
  entry: './src/main.ts',
  output: { filename: './public/bundle.js' },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
};
