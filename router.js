// const memStat = require('mem-stat'),
//   cpuStat = require('cpu-stat');

// setInterval(() => {
//   cpuStat.usagePercent(function(err, percent, seconds) {
//     if (err) {
//       return console.log(err);
//     }
  
//     //the percentage cpu usage over all cores
//     console.log(percent);
  
//     //the approximate number of seconds the sample was taken over
//     console.log(seconds);
//   });
// }, 1000);

// var allStats = memStat.allStats();
// console.log(allStats);

const router = (app, io) => {
  
  //Aeb router
  const web = require('./routes/web');
  app.use('/', web);
  
  //Api router
  const api = require('./routes/api');
  app.use('/api', api);
  
  // io.sockets.on('connection', function (socket) {
  //   require('./router-io/facebook')(io, socket);
  // });
  
};

module.exports = router;