const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
module.exports = {
    entry: './src/index.js',
    mode: 'development',
    plugins: [new ErrorOverlayPlugin(),
    new HtmlWebpackPlugin({
        title: 'Development',
        // filename: 'index.html',
        template: './public/index.html',
    }),
    ],
    devtool: 'cheap-module-source-map',
    devServer: {
        static: './public',
        hot: true,
        // contentBase: path.join(__dirname, 'public')
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'docs'),
        clean: true,
        publicPath: './',
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {

        fallback: {
          "fs": false,
          "tls": false,
          "net": false,
          "path": false,
          "zlib": false,
          "http": false,
          "https": false,
          "stream": false,
          "crypto": false,
          "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
        } 
      },
};