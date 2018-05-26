const _ = require('lodash'),
  request = require('request'),
  countryList = require('./country'),
  genderAvaiable = [
    'male',
    'female'
  ];
  
class Grab {
  
  constructor(token) {
    this.token = token;
  }
  
  _filter(data, filter) {
    
    let gender = null,
      country = null;
    
    if (false === _.isObject(filter)) {
      return data;
    }
    
    if (false === _.isArray(data)) {
      return data;
    }
    
    if (true === _.isString(filter.gender)) {
      if (false === _.includes(genderAvaiable, filter.gender)) {
        throw new Error('Gender option only avaiable ' + _.join(genderAvaiable, ', '));
      }
      gender = filter.gender;
    }
    
    if (true === _.isString(filter.country)) {
      const findCountry = _.result(_.find(countryList, (obj) => {
          return obj.code === _.toUpper(filter.country);
      }), 'name');
      if (_.isUndefined(findCountry)) {
        throw new Error('Invalid country codes!');
      }
      country = findCountry;
    }
    
    if (false === _.isNull(country)) {
      data = data.filter(user => {
        if (_.isObject(user.location) && _.isObject(user.location.location)) {
          if (country === user.location.location.country) {
            return user;
          }
        }
        return false;
      });
    }
    
    if (false === _.isNull(gender)) {
      data = data.filter(user => {
        if (gender === user.gender) {
          return user;
        }
        return false;
      });
    }
    
    return data;
    
  }
  
  user(id, filter, _options, callback) {
    
    if (_.isFunction(_options)) {
      callback = _options;
    }
    
    if (!id) {
      callback(new Error('ID is required!'));
      return;
    }
    
    if (false === _.isString(this.token) && _.size(this.token.trim()) > 0) {
      callback(new Error('Token is required!'));
      return;
    }
    
    const options = _.extend({
      'limit': 1000
    }, _.isObject(_options) ? _options : {});
    
    const url = 'https://graph.facebook.com/' + id + '/friends?&access_token=' + this.token + '&limit=' + options.limit + '&&fields=id%2Cname%2Cgender%2Clocation%7Blocation%7D&method=GET';
    
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
        callback(new Error('respond data kosong!'));
        return;
      }
      
      if (_.isObject(filter) && filter.country || filter.gender) {
        try {
          body.data = this._filter(body.data, filter);
        }
        catch (error) {
          callback(error);
          return;
        }
      }
      
      callback(null, body.data.map(user => {
        return user.id;
      }));
    
    });
    
  }
  
  group(id, filter, _options, callback) {
    
    if (_.isFunction(_options)) {
      callback = _options;
    }
    
    if (!id) {
      callback(new Error('ID is required!'));
      return;
    }
    
    if (false === _.isString(this.token) && _.size(this.token.trim()) > 0) {
      callback(new Error('Token is required!'));
      return;
    }
    
    const options = _.extend({
      'limit': 50000
    }, _.isObject(_options) ? _options : {});
    
    const url = 'https://graph.facebook.com/' + id + '/members?&access_token=' + this.token + '&limit=' + options.limit + '&fields=id%2Cname%2Cgender%2Clocation%7Blocation%7D&method=GET';
    
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
        callback(new Error('respond data kosong!'));
        return;
      }
      
      if (_.isObject(filter) && filter.country || filter.gender) {
        try {
          body.data = this._filter(body.data, filter);
        }
        catch (error) {
          callback(error);
          return;
        }
      }
      
      callback(null, body.data.map(user => {
        return user.id;
      }));
    
    });
    
  }

}

//-------------------------------------------------
// Not use this time, maybe next time will be used
//=================================================

// function translateError(error) {
//   error.title = 'Error';
//   if (error.code === 458) {
//     error.title = 'Aplikasi Tidak Terpasang';
//     error.message = 'Pengguna belum masuk ke aplikasi Anda. Lakukan autentikasi ulang pada pengguna.';
//   }
//   else if (error.code === 459) {
//     error.title = 'Pengguna yang Sudah Melewati Titik Pemeriksaan';
//     error.message = 'Pengguna harus masuk di https://www.facebook.com atau https://m.facebook.com untuk memperbaiki masalah.';
//   }
//   else if (error.code === 460) {
//     error.title = 'Kata Sandi Diubah';
//     error.message = 'Pada iOS 6 ke atas, jika seseorang masuk menggunakan aliran OS terintegrasi, mereka harus diarahkan ke pengaturan OS Facebook pada perangkat untuk memperbarui kata sandinya. Jika tidak, dia harus masuk ke aplikasi lagi.';
//   }
//   else if (error.code === 463) {
//     error.title = 'Kedaluwarsa';
//     error.message = 'Status masuk atau token akses telah kedaluwarsa, telah dicabut, atau tidak valid.';
//   }
//   else if (error.code === 464) {
//     error.title = 'Pengguna Belum Dikonfirmasi';
//     error.message = 'Pengguna harus masuk di https://www.facebook.com atau https://m.facebook.com untuk memperbaiki masalah.';
//   }
//   else if (error.code === 467) {
//     error.title = 'Token akses tidak valid';
//     error.message = 'Token akses telah kedaluwarsa, telah dicabut, atau tidak valid.';
//   }
//   else if (error.code === 102) {
//     error.title = 'Sesi API';
//     error.message = 'Akses token sudah kedaluwarsa, sudah dihapus, atau tidak valid.';
//   }
//   else if (error.code === 1) {
//     error.title = 'API Tidak Diketahui';
//     error.message = 'Kemungkinan masalah sementara karena downtime. Tunggu dan coba lagi.';
//   }
//   else if (error.code === 2) {
//     error.title = 'Layanan API';
//     error.message = 'Masalah sementara karena downtime. Tunggu dan coba lagi.';
//   }
//   else if (error.code === 4) {
//     error.title = 'Terlalu Banyak Panggilan API';
//     error.message = 'Masalah sementara karena macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
//   }
//   else if (error.code === 17) {
//     error.title = 'Terlalu Banyak Panggilan Pengguna API';
//     error.message = 'Masalah sementara karena macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
//   }
//   else if (error.code === 10) {
//     error.title = 'Izin API Ditolak';
//     error.message = 'Izin tidak diberikan atau sudah dihapus.';
//   }
//   else if (error.code === 190) {
//     error.message = 'Token akses sudah kedaluwarsa';
//   }
//   else if (error.code === 341) {
//     error.title = 'Batas Aplikasi Tercapai';
//     error.message = 'Masalah sementara karena downtime atau macet. Tunggu dan coba lagi operasi tersebut, atau periksa volume permintaan API Anda.';
//   }
//   else if (error.code === 368) {
//     error.title = 'Izin API Ditolak';
//     error.message = 'Sementara diblokir karena melanggar kebijakan';
//   }
//   else if (error.code === 506) {
//     error.message = 'Kiriman Duplikat';
//   }
//   else if (error.code === 1609005) {
//     error.message = 'Kesalahan Mengirim Tautan';
//   }
//   else {
//     error.error = 'Error not detailed';
//   }
//   return error;
// }

module.exports = Grab;