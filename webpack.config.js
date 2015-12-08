'use strict';
var _ = require('lodash');
var ExtractTextPlugin = require("extract-text-webpack-plugin"),
    path = require("path"),
    webpack = require('webpack'),
    HtmlPlugin = require('html-webpack-plugin'),
    isProduction = false;
var config = require('./config.json');
var vendorsShared = _.values(config.shared.vendors);
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
function addRoot(n) {
    return './' + n;
}
module.exports = {
    //context: path.join(__dirname, "app"),
    context: path.join(__dirname, 'app'),
    entry: {
        //main: ['webpack-dev-server/client', 'webpack/hot/dev-server', './main'],
        //main: [path.join(__dirname, 'node_modules', 'webpack-dev-server', 'client'), './main'],
        // vendors: _.map(vendorsShared, addRoot),
        app: [ // --inline --hot
            'webpack-dev-server/client?http://localhost:8080',
            'webpack/hot/dev-server',
            './app',
            './index.html'
        ]
        //styles:'./styles'
        //styles: [
        //    'webpack-dev-server/client?http://localhost:8080',
        //    'webpack/hot/dev-server',
        //    './styles'
        //]
    },
    output: {
        path: path.join(__dirname, '/dist/'),
        publicPath: '/',
        filename: '[name].js'
    },
    /*watch: true,// webpack пересобирает с учетом кеша только те файлы которые изменились
     watchOptions: {
     aggregateTimeout: 100
     },*/
    devtool: 'source-map',
    /* resolve: {
     extensions: ['', '.js', '.styl']
     },*/
    module: {
        loaders: [
            //{
            //    test: /\.js$/,
            //    loader: "babel"
            //},
            {test: /\.js$/, exclude: /node_modules/, loaders: ['babel']},
            {
                test: /\.jade$/,
                loader: "jade"
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract('style', 'css!stylus?resolve url')
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css?sourceMap', 'autoprefixer-loader?browsers=last 5 version', 'sass?sourceMap']
            },
            {
                test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                loader: 'file?name=[path][name].[ext]?[hash]'
            },
            {
                test: /\.json$/, loader: 'json'
            },
            {
                test: /\.html$/, loader: 'raw'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css', {allChunks: true, disable: true}),
        new webpack.DefinePlugin({
            __DEV__: JSON.stringify(JSON.parse(!isProduction)),
            __PROD__: JSON.stringify(JSON.parse(isProduction)),
            __CONFIG__: JSON.stringify({"title": "JellyChip"})
        }),
        new webpack.HotModuleReplacementPlugin(),
        // Этот файл будет являться "корневым" index.html
        new HtmlPlugin({
            title: 'Test APP',
            chunks: ['app'],
            filename: 'index.html',
            template: path.join(__dirname, 'app', 'index.html')
        })
    ]
    //devServer: {
    //    stats: {
    //        colors: true
    //    },
    //    contentBase: path.join(__dirname, "dist"),
    //    hot: true
    //}
};