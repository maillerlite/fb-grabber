const express = require('express'),
    router = express.Router(),
    countryList = require('../app/country');

router.use((req, res, next) => {
  const mainMenu = [
    {
      "name": "Home",
      "url": "/"
    }
  ];
  mainMenu.forEach(menu => {
    if (menu.url == req.originalUrl) {
      menu.active = true;
    }
  });
  res.locals.mainMenu = mainMenu;
  next();
});

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    'countryList': countryList
  });
});

module.exports = router;
