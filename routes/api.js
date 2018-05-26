const express = require('express'),
  router = express.Router(),
  // grabber = require('../app/grabber'),
  Grab = require('../app/grab'),
  stackTrace = require('stack-trace');

router.get('/grab/user', (req, res, next) => {

  const filter = {};

  if (req.query.country) {
    filter.country = req.query.country;
  }
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }
  
  const grab = new Grab(req.query.token);
  
  grab.user(req.query.uid, filter, (error, response) => {
    if (error) {
      const errObj = {
        message: error.message,
        type: error.type,
        code: error.code
      };
      if ('development' === process.env.NODE_ENV) {
        errObj.stack = stackTrace.parse(error);
      }
      res.send({error: errObj});
      return;
    }
    res.send(response);
  });

});

router.get('/grab/group', (req, res, next) => {
  const filter = {};

  if (req.query.country) {
    filter.country = req.query.country;
  }
  if (req.query.gender) {
    filter.gender = req.query.gender;
  }
  
  const grab = new Grab(req.query.token);
  
  grab.group(req.query.uid, filter, (error, response) => {
    if (error) {
      const errObj = {
        message: error.message,
        type: error.type,
        code: error.code
      };
      if ('development' === process.env.NODE_ENV) {
        errObj.stack = stackTrace.parse(error);
      }
      res.send({error: errObj});
      return;
    }
    res.send(response);
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
