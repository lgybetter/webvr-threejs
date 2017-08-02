module.exports = {
  devtool: 'eval-source-map',
  entry: __dirname + '/src/js/index.js',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    inline: true
  } 
}