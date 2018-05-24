const express = require('express'),
    router = express.Router(),
    countryList = require('../app/country');

router.use((req, res, next) => {
  if (false === req.secure && true === res.locals.httpsRedirect) {
    res.redirect('https://' + req.headers.host + req.url);
  } else {
    next();
  }
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    'countryList': countryList
  });
});

module.exports = router;
