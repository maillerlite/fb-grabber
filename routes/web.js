const express = require('express'),
    router = express.Router(),
    countryList = require('../app/country');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    'countryList': countryList
  });
});

module.exports = router;
