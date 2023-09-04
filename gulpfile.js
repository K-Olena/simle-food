const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const imagemin = require("gulp-imagemin");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
    notify: false,
  });
}

function fonts() {
  return src("./app/fonts/src/*.*")
    .pipe(
      fonter({
        formats: ["woff", "ttf"],
      })
    )
    .pipe(src("./app/fonts/*.ttf"))
    .pipe(ttf2woff2())
    .pipe(dest("./app/fonts"));
}

function styles() {
  return src("./app/scss/*.scss")
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("./app/css"))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(["./node_modules/jquery/dist/jquery.js", "./app/js/main.js", "!./app/js/main.min.js"]).pipe(concat("main.min.js")).pipe(uglify()).pipe(dest("./app/js")).pipe(browserSync.stream());
}

function images() {
  return src("./app/images/src/*.*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("./app/images"));
}

function watching() {
  watch(["./app/scss/**/*.scss"], styles);
  watch(["./app/images/src"], images);
  watch(["./app/js/**/*.js", "!./app/js/main.min.js"], scripts);
  watch(["./app/**/*.html"]).on("change", browserSync.reload);
}
function building() {
  return src(["./app/**/*.html", "./app/fonts/*.*", "./app/images/*.*", "./app/css/style.min.css", "./app/js/main.min.js"], { base: "./app" }).pipe(dest("./dist"));
}

function cleanDist() {
  return src("./dist").pipe(clean());
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.images = images;
exports.fonts = fonts;

exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, fonts, images, scripts, browsersync, watching);
