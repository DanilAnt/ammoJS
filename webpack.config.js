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
        path: path.resolve(__dirname, 'docs'),

        filename: 'bundle.js',
   
        clean: true,
        publicPath: '',
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
                
              },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
};