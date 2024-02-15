const HtmlWebpackPlugin = require('html-webpack-plugin');

let htmlPageNames = ['index', 'about', 'work'];
let multipleHtmlPlugins = htmlPageNames.map(name => {
  return new HtmlWebpackPlugin({
    template: `./${name}.html`, // relative path to the HTML files
    filename: `${name}.html`, // output HTML files
    chunks: [`${name}`] // respective JS files
  })
});

module.exports = {
  entry: {
    main: './main.js',
    example1: './gsap.js',
    example2: './script.js',
    example3: './threedee.js',

    //... repeat until example 4
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
        template: "./about.html",
        chunks: ['main']
      })
  ].concat(multipleHtmlPlugins)
  
};