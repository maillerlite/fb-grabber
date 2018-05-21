const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  app = express();

// view engine setup
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.siteName = process.env.siteName;
  res.locals.siteTitle = process.env.siteTitle;
  res.locals.siteSlogan = process.env.siteSlogan;
  next();
});

require('./router')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log(req.app.get('env'));
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {
    title: err.message
  });
});

module.exports = app;
