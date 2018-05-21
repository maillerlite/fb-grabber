const _ = require('lodash'),
  request = require('request'),
  countryList = require('./country'),
  genderAvaiable = [
    'male',
    'female'
  ];

function grabber(userId, token, options, callback) {
  if (!userId) {
    callback(new Error('userId Kosong!'));
    return;
  }
  if (!token) {
    callback(new Error('Token Kosong!'));
    return;
  }
  
  options = _.extend({
    'limit': 1000,
    'gender': null,
    'country': null
  }, options ? options : {});
  
  if (false === _.isNull(options.gender) && false === _.includes(genderAvaiable, options.gender)) {
    callback(new Error('Gender option only avaiable ' + _.join(genderAvaiable, ', ')));
    return;
  }
  if (false === _.isNull(options.country) && _.isString(options.country)) {
    const country = _.result(_.find(countryList, (obj) => {
        return obj.code === _.toUpper(options.country);
    }), 'name');
    if (_.isUndefined(country)) {
      callback(new Error('Invalid country codes!'));
      return;
    }
    options.countryName = country;
  }
  
  const url = 'https://graph.facebook.com/' + userId + '/friends?&access_token=' + token + '&limit=' + options.limit + '&&fields=id%2Cname%2Cgender%2Clocation%7Blocation%7D&method=GET';
  
  request.get(url, {
    'json': true
  }, (error, httpResponse, body) => {
    if (error) {
      callback(error);
      return;
    }
    
    if (false === _.isObject(body)) {
      callback(new Error('Not object respond!'));
      return;
    }
    
    if (true === _.isObject(body.error)) {
      
      // ---------------------------------------------------------------------------------
      // https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling
      // =================================================================================
      
      if (body.error.code && [
        803 // user tidak ditemukan
      ].includes(body.error.code)) {
        return callback(null, []);
      }
      
      const err = new Error(),
        defineProperties = {};
      
      for (let errorKey in body.error) {
        defineProperties[errorKey] = {
          'value': body.error[errorKey],
          'enumerable': false,
          'writable': true,
          'configurable': true
        };
      }
      
      Object.defineProperties(err, defineProperties);
      callback(err);
      return;
    }
    
    if (false === _.isObject(body.data)) {
      callback(new Error('Response data kosong!'));
      return;
    }
    
    // Filter by country if not null and rewrite body.data
    if (false === _.isNull(options.country)) {
      body.data = body.data.filter(user => {
        if (_.isObject(user.location) && _.isObject(user.location.location)) {
          if (options.countryName === user.location.location.country) {
            return user;
          }
        }
        return false;
      });
    }
    
    // Filter by gender if not null and rewrite body.data
    if (false === _.isNull(options.gender)) {
      body.data = body.data.filter(user => {
        if (options.gender === user.gender) {
          return user;
        }
        return false;
      });
    }
    
    callback(null, body.data.map(user => {
      return user.id;
    }));
    
  });
}
  
module.exports = grabber;