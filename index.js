const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  morgan = require('morgan'),
  helmet = require('helmet'),
  pjson = require('./package.json'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  app = express();

// view engine setup
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1);
app.disable('x-powered-by');

if ('development' === process.env.NODE_ENV) {
  app.use(morgan('dev'));
}
else {
  app.use(morgan('combined', {
    skip: function (req, res) { return res.statusCode < 400 }
  }));
}

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.siteName = process.env.siteName;
  res.locals.siteTitle = process.env.siteTitle;
  res.locals.siteSlogan = process.env.siteSlogan;
  res.locals.pjson = pjson;
  
  next();
});

require('./router')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
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
