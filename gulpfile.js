/* GULPFILE
**************************************************/
var gulp = require("gulp"),
    babel = require("gulp-babel"),

    sass = require("gulp-sass"),
    autoprefix = require("gulp-autoprefixer"),

    scss_prefix = "last 5 versions",

    scss_src = "./scss/**/",
    css_dist = "./dist/css/",

    js_src = "./js/**/",
    js_dist = "./dist/js/";


/* CSS
---------------------*/
gulp.task("sass", function () {
    gulp.src(scss_src + "*.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefix({
            browsers: [scss_prefix]
        }))
        .pipe(gulp.dest(css_dist));
});


/* JS
---------------------*/
gulp.task("babel", function () {
  return gulp.src(js_src + "*.js")
    .pipe(babel())
    .pipe(gulp.dest(js_dist));
});


/* WATCHERS
---------------------*/
// Watch files for changes and run the appropriate tasks
gulp.task("watch_sass", function () {
    gulp.watch(scss_src + "*.scss", ["sass"]);
});

gulp.task("watch_js", function () {
    gulp.watch(js_src + "*.js", ["babel"]);
});


/* DEFAULT TASK
---------------------*/
gulp.task("default", ["sass", "babel", "watch_sass", "watch_js"]);
