let mix = require('laravel-mix');

require('dotenv').config();

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/dist/js')
  .sass('resources/assets/sass/app.scss', 'public/dist/css');

mix.webpackConfig({
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
});

mix.options({
  postCss: [
    require('autoprefixer')({
      browsers: ['>0.1%'],
      cascade: false
    })
  ]
});

if (!mix.inProduction()) {
  mix.sourceMaps();
}