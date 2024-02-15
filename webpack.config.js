plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html'
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      template: './about.html'
    }),
    new CleanWebpackPlugin(['dist'])
  ]