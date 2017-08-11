module.exports = {
  devtool: 'cheap-module-source-map',
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
  node: {
   fs: "empty"
  },
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    inline: true,
    host: '0.0.0.0',
    port: 8080
  } 
}
