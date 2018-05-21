const express = require('express'),
  router = express.Router(),
  grabber = require('../app/grabber'),
  stackTrace = require('stack-trace');

function props(obj) {
  var p = [];
  for (; obj != null; obj = Object.getPrototypeOf(obj)) {
    var op = Object.getOwnPropertyNames(obj);
    for (var i=0; i<op.length; i++) {
      if (p.indexOf(op[i]) == -1) {
        p.push(op[i]);
      }
    }
  }
  return p;
}

router.get('/grab', (req, res, next) => {

  const options = {};

  if (req.query.country) {
    options.country = req.query.country;
  }
  if (req.query.gender) {
    options.gender = req.query.gender;
  }
  
  grabber(req.query.uid, req.query.token, options, (error, response) => {
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
    stack: err.stack
  });
});

module.exports = router;
