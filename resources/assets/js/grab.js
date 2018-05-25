const jQuery = require('jquery'),
  lodash = require('lodash'),
  bluebird = require('bluebird'),
  listener = require('./listener');

class Grab extends listener {
  
  constructor() {
    super();
    
    this.count = {
      process: 0, // number total uid yang akan di proses
      current: 0 // number uid yang sedang di proses 
    };
    
    
    this._stopNow = false;
    this._token = null; // token aktif yang akan digunakan
    this._tokenRisk = []; // token yang bermasalah ditampung disini
    
    this._uids = null; // list uid dari input
    this._tokens = null; // list token dari input
    this._filter = {}; // object filter
  }
  
  request(uid) {
    
    uid = lodash.trim(uid).replace(/(\r)/, '');
  
    const url = '/api/grab',
      ajaxData = {
        'uid': uid,
        'token': this._token
      };
    
    if (lodash.size(uid) < 1) { // Jika dibawah panjang 3 karakter langsung ae skip
      return bluebird.resolve([]);
    }
    
    if (lodash.size(this._token) < 1) { // Jika dibawah panjang 3 karakter langsung ae skip
      return bluebird.resolve([]);
    }
    
    if (true === lodash.isObject(this._filter)) {
      if (this._filter.country && this._filter.country !== 'all') {
        ajaxData.country = this._filter.country;
      }
      if (this._filter.gender && this._filter.gender !== 'all') {
        ajaxData.gender = this._filter.gender;
      }
    }
    
    const response = jQuery.ajax({
      url: url,
      data: ajaxData,
      cache: false,
      method: 'GET',
      dataType: 'json'
    });
    
    return bluebird.resolve(response);
  }
  
  _tokenSkip() {
    this._tokenRisk.push(this._token);
    this._tokenStart(this._tokens);
  }
  
  _tokenStart() {
    if (null === this._tokens) {
      if (lodash.size(this._tokens) > 0) {
        this._token = this._tokens[0];
      }
    }
    else {
      for (let i = 0; i < this._tokens.length; i++) {
        if (false === lodash.includes(this._tokenRisk, this._tokens[i])) {
          this._token = this._tokens[i];
          break;
        }
      }
    }
    return this._token;
  }
  
  start(uids, tokens, filter) {
    this._uids = uids;
    this._tokens = lodash.filter(tokens, token => {
      token = lodash.trim(token).replace(/(\r)/, '');
      return lodash.size(token) > 3;
    });
    this._filter = lodash.isObject(filter) ? filter : {};
    this._stopNow = false;
    this._tokenStart();
    this.emit('start', this._uids, this._tokens, this._filter);
    
    bluebird.each(this._uids, (uid, current, count) => {
      
      let errorRequestCount = 0;
      
      let req = () => {
        
        if (true === this._stopNow) {
          return [];
        }
        
        return this.request(uid).then(response => {
          // catch response
          if (response.error) {
            
            if ('GraphMethodException' === response.error.type) {
              this.emit('grab', null, [], (current + 1), count);
              return [];
            }
            
            const error = new Error();
            for (let errorKey in response.error) {
              error[errorKey] = response.error[errorKey];
            }
            
            console.error(response.error);
            
            const codeErrorToken = [
              190, // Akses Token sudah kedaluwarsa
              460,
              463, // Token kedaluwarsa
              464,
              467, // Akses token tidak valid
              102,
              4,
              17,
              341
            ];
            
            if (codeErrorToken.includes(error.code)) {
              
              if (this._tokenRisk.length >= this._tokens.length) {
                this.emit('grab', error, [], (current + 1), count);
                return bluebird.reject(error);
              }
              
              console.log('token ' + this._token + ' rusak');
              if (lodash.size(this._tokens) > 0) {
                this._tokenSkip();
                console.log('token has change to ' + this._token);
              }
              
              return req();
            }
            
            this.emit('grab', error, [], (current + 1), count);
          }
          this.emit('grab', null, response, (current + 1), count);
          return response;
        }).catch(error => { // Hanya catch koneksi internet
          if (error.status === 0) { // permintaan tidak diinisialisasi
            console.log('Request not initialized');
          }
          else if (error.status === 'timeout') {
            console.log('Request timeou');
          }
          else if (error.status === 'parsererror') {
            console.log('HTTP error occurs');
          }
          
          if (errorRequestCount >= 5) {
            console.log('Connection prolem width 5x request, SKIP this');
            return bluebird.resolve([]);
          }
          
          if (error.status !== 0) {
            errorRequestCount++;
          }
          
          return new Promise(resolve => {
            setTimeout(() => { // wait a 1 seconts to request again
              console.log('Retry request start UID : ' + uid);
              return resolve(req());
            }, 3000);
          });
        });
      };
      
      return req();
      
    }).finally(() => {
      if (false === this._stopNow) {
        this.stop();
      }
      this.emit('finish');
    });
  }
  
  stop() {
    this._stopNow = true;
    this.emit('stop');
  }
  
}

module.exports = Grab;
