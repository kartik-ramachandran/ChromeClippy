const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content/index.js',
    background: './src/background/background.js',
    popup: './src/popup/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    clean: true
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'async',
          minSize: 0
        }
      }
    },
    usedExports: true,
    sideEffects: false,
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'src/styles/clippy.css', to: 'clippy.css' },
        { from: 'clippy-icon.png', to: 'clippy-icon.png' },
        { from: 'clippy-icon-16.png', to: 'clippy-icon-16.png' },
        { from: 'clippy-icon-32.png', to: 'clippy-icon-32.png' },
        { from: 'clippy-icon-48.png', to: 'clippy-icon-48.png' },
        { from: 'clippy-icon-128.png', to: 'clippy-icon-128.png' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 300000, // 300KB - reasonable for Chrome extension
    maxAssetSize: 300000,      // 300KB per asset
    assetFilter: (assetFilename) => {
      // Only warn about JS files, not images
      return assetFilename.endsWith('.js');
    }
  },
  mode: 'development',
  devtool: 'cheap-module-source-map'
};