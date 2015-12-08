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
var gulpLoadPlugins = require('gulp-load-plugins');
var merge = require('deepmerge');
var config = require('./config');

var plugins = gulpLoadPlugins({
    rename: {
        'gulp-minify-css': 'minifyCss',
        'gulp-rev-easy': 'reveasy'
    }
});
var currentConfig = {},
    isProduction = false,
    configPrivate,
    configShared,
    configApp,
    configAdmin;

initBuildConfig();

function initBuildConfig() {
    configShared = config.shared;
    configApp = merge(configShared, config.app);
    configAdmin = merge(configShared, config.admin);
}

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

// concat and copy files of vendors
gulp.task("vendor", function () {
    var vendors = [],
        cssFilter = plugins.filter(['*.css']),
        jsFilter = plugins.filter(['*.js']);


    for (var vendor in currentConfig.vendors) {
        if (currentConfig.vendors.hasOwnProperty(vendor)) {
            vendors.push(currentConfig.vendors[vendor]);
        }
    }

    // build vendor css files
    if (currentConfig.files.cssVendorsFilename) {
        gulp.src(vendors)
            .pipe(cssFilter)
            .pipe(plugins.concat(currentConfig.files.cssVendorsFilename))
            .pipe(plugins.if(isProduction, plugins.minifyCss()))
            .pipe(plugins.size())
            .pipe(gulp.dest(currentConfig.paths.dest));
    }

    // build vendor js files
    gulp.src(vendors)
        .pipe(jsFilter)
        .pipe(plugins.concat(currentConfig.files.jsVendorsFilename))
        .pipe(plugins.if(isProduction, plugins.ngmin()))
        .pipe(plugins.if(isProduction, plugins.uglify()))
        .pipe(plugins.size())
        .pipe(gulp.dest(currentConfig.paths.dest))
    ;
});

// clean the output folders of app
gulp.task('clean-app', function () {
    currentConfig = configApp;
    console.log(configApp.paths.dest + '/*', '!' + configAdmin.paths.dest);
    return gulp.src([configApp.paths.dest + '/*', '!' + configAdmin.paths.dest], {read: false})
        .pipe(plugins.clean());
});

// clean the output folders of admin
gulp.task('clean-admin', function () {
    currentConfig = configAdmin;

    return gulp.src(configAdmin.paths.dest, {read: false})
        .pipe(plugins.clean());
});

// serve-dev
gulp.task('serve-dev', function () {
    isProduction = false;
    runSequence(
        'clean-app',
        'vendor',
        'clean-admin',
        'vendor',
        'webpack-dev-server'
    );
});
