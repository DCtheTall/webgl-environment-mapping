module.exports = {
  entry: './src/main.ts',
  output: { filename: './public/bundle.js' },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      },
    ],
  },
};
