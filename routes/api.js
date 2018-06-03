const express = require('express'),
  router = express.Router(),
  Grab = require('core-fb-grabber'),
  stackTrace = require('stack-trace');

router.get('/grab', (req, res, next) => { // old route

  const grab = new Grab(req.query.token),
    filter = {};

  if (req.query.country) {
    filter.country = [req.query.country];
  }
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }
  
  grab.user(req.query.uid, {
    filter: filter,
    option: {
      limit: 5000
    }
  }, (error, response) => {
    if (error) {
      if ('development' === process.env.NODE_ENV) {
        error.stack = stackTrace.parse(error);
      }
      res.json({error: error});
      return;
    }
    res.json(response.map(user => user.id));
  });

});

router.get('/grab/user', (req, res, next) => {

  const grab = new Grab(req.query.token),
    filter = {};

  if (req.query.country) {
    filter.country = req.query.country.split(',');
  }
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }
  
  grab.user(req.query.uid, {
    filter: filter,
    option: {
      limit: 5000
    }
  }, (error, response) => {
    if (error) {
      if ('development' === process.env.NODE_ENV) {
        error.stack = stackTrace.parse(error);
      }
      res.json({error: error});
      return;
    }
    res.json({
      count: response.length,
      data: response.map(user => user.id).join('\n')
    });
  });

});

router.get('/grab/group', (req, res, next) => {
  
  const grab = new Grab(req.query.token),
    filter = {};

  if (req.query.country) {
    filter.country = req.query.country;
  }
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }
  
  grab.group(req.query.uid, {
    filter: filter,
    option: {
      limit: 5000
    }
  }, (error, response) => {
    if (error) {
      if ('development' === process.env.NODE_ENV) {
        error.stack = stackTrace.parse(error);
      }
      res.json({error: error});
      return;
    }
    res.json({
      count: response.length,
      data: response.map(user => user.id).join('\n')
    });
  });
});

// -----------------------------------------------------
// handle all responds to json
// =====================================================

// catch 404 and forward to error handler
router.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
router.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({
    message: err.message,
    code: err.code,
    stack: stackTrace.parse(err)
  });
});

module.exports = router;
