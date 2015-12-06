var gulp = require("gulp");
var pkg = require('./package.json');
var gutil = require("gulp-util");
var webpack = require("webpack");
var modRewrite = require('connect-modrewrite');
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js"),
    path = require("path"),
    runSequence = require('run-sequence');
var notifier = require('node-notifier');
var browserSync = require('browser-sync').create(pkg.name);
var Q = require('q');

/*// The development server (the recommended option for development)
 gulp.task("default", ["webpack-dev-server"]);

 // Build and watch cycle (another option for development)
 // Advantage: No server required, can run app from filesystem
 // Disadvantage: Requests are not blocked until bundle is available,
 //               can serve an old app on refresh
 gulp.task("build-dev", ["webpack:build-dev"], function() {
 gulp.watch(["app/!**!/!*"], ["webpack:build-dev"]);
 });

 // Production build
 gulp.task("build", ["webpack:build"]);

 gulp.task("webpack:build", function(callback) {
 // modify some webpack config options
 var myConfig = Object.create(webpackConfig);
 myConfig.plugins = myConfig.plugins.concat(
 new webpack.DefinePlugin({
 "process.env": {
 // This has effect on the react lib size
 "NODE_ENV": JSON.stringify("production")
 }
 }),
 new webpack.optimize.DedupePlugin(),
 new webpack.optimize.UglifyJsPlugin()
 );

 // run webpack
 webpack(myConfig, function(err, stats) {
 if(err) throw new gutil.PluginError("webpack:build", err);
 gutil.log("[webpack:build]", stats.toString({
 colors: true
 }));
 callback();
 });
 });

 // modify some webpack config options
 var myDevConfig = Object.create(webpackConfig);
 myDevConfig.devtool = "sourcemap";
 myDevConfig.debug = true;

 // create a single instance of the compiler to allow caching
 var devCompiler = webpack(myDevConfig);

 gulp.task("webpack:build-dev", function(callback) {
 // run webpack
 devCompiler.run(function(err, stats) {
 if(err) throw new gutil.PluginError("webpack:build-dev", err);
 gutil.log("[webpack:build-dev]", stats.toString({
 colors: true
 }));
 callback();
 });
 });*/


// Static server + livereload
gulp.task('browser-sync', function () {
    var deferred = Q.defer(),
        port = 3000;
    //protocol = configShared.localServer.https ? 'https:' : 'http:';

    browserSync.init({
        server: {
            baseDir: path.join(__dirname, "dist"),
            middleware: [
                modRewrite([
                    '^/$ /index.html [L]',
                    '^/admin$ /admin/index.html',
                    '^/admin[/\\w+]+$ /admin/index.html [L]',
                    '(^/\\w+\.html\\?.*)$ /$1 [L]',
                    '!\\.\\w+ /app.html [L]'
                ])
            ]
        },
        //https: configShared.localServer.https,
        port: port,
        host: 'localhost',
        open: false,
        notify: false
    }, function (err, bs) {
        if (bs.active) {
            notifier.notify({
                title: pkg.name,
                message: 'Local server is running on  http://localhost:3000'
            });

            deferred.resolve();
        } else {
            console.log(err);

            deferred.reject();
        }
    });

    return deferred.promise;
});

gulp.task("webpack-dev-server", function (callback) {
    new WebpackDevServer(webpack(Object.create(webpackConfig)), {
        stats: {
            colors: true
        },
        contentBase: path.join(__dirname, "dist"),
        hot: true,
        historyApiFallback: true
    }).listen(8080, "localhost", function (err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
    });
});

// serve-dev
gulp.task('serve-dev', function () {
    runSequence(
        ["webpack-dev-server"]
    );
});
