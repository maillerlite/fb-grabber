const router = app => {
  
  //Web router
  const web = require('./routes/web');
  app.use('/', web);
  
  //Api router
  const api = require('./routes/api');
  app.use('/api', api);
  
};

module.exports = router;