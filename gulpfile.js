var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var es = require('event-stream');
var del = require('del');
var rev = require('gulp-rev');
var sourcemaps  = require('gulp-sourcemaps');

var paths = {
   scripts: 'web/**/*.js',
    cmaps: 'web/cmaps/*',
    images: 'web/images/*',
    locale: 'web/locale/**/*',
    pdf:'web/*.pdf',
    css: 'web/*.css',
    html: 'web/*.html',
   distDev: 'dist'
};

var pipes = {};
pipes.script = function(){
    return gulp.src(['build/pdf.worker.js', 'build/pdf.js', 'web/debugger.js', 'web/viewer.js'])
        .pipe(plugins.babel({presets: ['es2015']}))
        .pipe(sourcemaps.init())
        .pipe(plugins.uglify({ mangle: {reserved : ['require','exports','module','window']}}))
        .pipe(plugins.concat({path: 'app.min.js', stat: {mode: 0666}}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
};

pipes.cmaps = function(){
    return gulp.src(paths.cmaps)
    .pipe(gulp.dest('dist/cmaps'));
};

pipes.images = function(){
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/images'));
};

pipes.locale = function(){
    return gulp.src(paths.locale)
        .pipe(gulp.dest('dist/locale'));
};

pipes.pdf = function(){
    return gulp.src(paths.pdf)
        .pipe(gulp.dest('dist'));
};

pipes.css = function(){
    return gulp.src(paths.css)
        .pipe(plugins.minifyCss({ processImport: false }))
        .pipe(gulp.dest('dist'));
};

pipes.html = function(){
    var options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    return gulp.src(paths.html)
        .pipe(plugins.htmlmin(options))
        .pipe(gulp.dest('dist'));
};

pipes.builtApp = function() {

    var orderedVendorScripts = pipes.script();

    var appStyles = pipes.css();

    return pipes.html()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plugins.inject(orderedVendorScripts, { relative: true }))
        .pipe(plugins.inject(appStyles, { relative: true }))
        .pipe(gulp.dest(paths.distDev));
};

gulp.task('clean', function() {
    return del(paths.distDev).then(function(paths) {
        if (paths && paths !== '') {
            console.log('[gulp][clean] Deleted files/folders:\n', paths.join('\n'));
        }
    });
});

gulp.task('cmaps', pipes.cmaps);
gulp.task('images', pipes.images);
gulp.task('locale', pipes.locale);
gulp.task('pdf', pipes.pdf);

gulp.task('builtApp', ['clean', 'cmaps', 'images', 'locale', 'pdf'], pipes.builtApp);