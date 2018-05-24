const _ = require('lodash'),
  request = require('request'),
  countryList = require('./country'),
  genderAvaiable = [
    'male',
    'female'
  ];

function translateError(error) {
  error.title = 'Error';
  if (error.code === 458) {
    error.title = 'Aplikasi Tidak Terpasang';
    error.message = 'Pengguna belum masuk ke aplikasi Anda. Lakukan autentikasi ulang pada pengguna.';
  }
  else if (error.code === 459) {
    error.title = 'Pengguna yang Sudah Melewati Titik Pemeriksaan';
    error.message = 'Pengguna harus masuk di https://www.facebook.com atau https://m.facebook.com untuk memperbaiki masalah.';
  }
  else if (error.code === 460) {
    error.title = 'Kata Sandi Diubah';
    error.message = 'Pada iOS 6 ke atas, jika seseorang masuk menggunakan aliran OS terintegrasi, mereka harus diarahkan ke pengaturan OS Facebook pada perangkat untuk memperbarui kata sandinya. Jika tidak, dia harus masuk ke aplikasi lagi.';
  }
  else if (error.code === 463) {
    error.title = 'Kedaluwarsa';
    error.message = 'Status masuk atau token akses telah kedaluwarsa, telah dicabut, atau tidak valid.';
  }
  else if (error.code === 464) {
    error.title = 'Pengguna Belum Dikonfirmasi';
    error.message = 'Pengguna harus masuk di https://www.facebook.com atau https://m.facebook.com untuk memperbaiki masalah.';
  }
  else if (error.code === 467) {
    error.title = 'Token akses tidak valid';
    error.message = 'Token akses telah kedaluwarsa, telah dicabut, atau tidak valid.';
  }
  else if (error.code === 102) {
    error.title = 'Sesi API';
    error.message = 'Akses token sudah kedaluwarsa, sudah dihapus, atau tidak valid.';
  }
  else if (error.code === 1) {
    error.title = 'API Tidak Diketahui';
    error.message = 'Kemungkinan masalah sementara karena downtime. Tunggu dan coba lagi.';
  }
  else if (error.code === 2) {
    error.title = 'Layanan API';
    error.message = 'Masalah sementara karena downtime. Tunggu dan coba lagi.';
  }
  else if (error.code === 4) {
    error.title = 'Terlalu Banyak Panggilan API';
    error.message = 'Masalah sementara karena macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
  }
  else if (error.code === 17) {
    error.title = 'Terlalu Banyak Panggilan Pengguna API';
    error.message = 'Masalah sementara karena macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
  }
  else if (error.code === 10) {
    error.title = 'Izin API Ditolak';
    error.message = 'Izin tidak diberikan atau sudah dihapus.';
  }
  else if (error.code === 190) {
    error.message = 'Token akses sudah kedaluwarsa';
  }
  else if (error.code === 341) {
    error.title = 'Batas Aplikasi Tercapai';
    error.message = 'Masalah sementara karena downtime atau macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
  }
  else if (error.code === 368) {
    error.title = 'Izin API Ditolak';
    error.message = 'Sementara diblokir karena melanggar kebijakan';
  }
  else if (error.code === 506) {
    error.message = 'Kiriman Duplikat';
  }
  else if (error.code === 1609005) {
    error.message = 'Kesalahan Mengirim Tautan';
  }
  else {
    error.error = 'Error not detailed';
  }
  return error;
}

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
      callback(translateError(err));
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