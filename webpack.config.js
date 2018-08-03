const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
module.exports = {
  entry: {
    'app': './app.ts',
    'pages/index/index': './pages/index/index.ts'
  },
  context: path.resolve(__dirname, 'src'),
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/dist'),
    publicPath: 'build/'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader' },
      {
        test: /\.sa|css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'resolve-url-loader', 'sass-loader?sourceMap=true']
        })
      },
      {
        test: /\.(json|wxml)$/,
        type: 'javascript/auto',
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          }
        }]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [{
          loader: 'url-loader'
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].wxss')
  ]
}
