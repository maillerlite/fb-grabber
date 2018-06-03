const jQuery = require('jquery'),
  lodash = require('lodash'),
  bluebird = require('bluebird'),
  listener = require('./listener');

bluebird.config({
  cancellation :true
});

class Grab extends listener {
  
  constructor() {
    super();
    
    this._dataEmpthy = {
      count: 0,
      data: ''
    };
    
    this.count = {
      process: 0, // number total uid yang akan di proses
      current: 0 // number uid yang sedang di proses
    };
    
    this._token = null; // token aktif yang akan digunakan
    this._tokenRisk = []; // token yang bermasalah ditampung disini
    
    this._uids = null; // list uid dari input
    this._tokens = null; // list token dari input
    this._filter = {}; // object filter
  }
  
  request(uid, type) {
    
    uid = jQuery.trim(uid).replace(/(\r)/, '');
  
    if (!type) {
      type = 'user';
    }
  
    const url = '/api/grab/' + type,
      ajaxData = {
        'uid': uid,
        'token': this._token
      };
    
    if (uid.length < 1) { // Jika dibawah panjang 3 karakter langsung ae skip
      return bluebird.resolve(this._dataEmpthy);
    }
    
    if (this._token.length < 1) { // Jika dibawah panjang 3 karakter langsung ae skip
      return bluebird.resolve(this._dataEmpthy);
    }
    
    if (true === jQuery.isPlainObject(this._filter)) {
      if (this._filter.country && this._filter.country !== 'all') {
        ajaxData.country = this._filter.country;
      }
      if (this._filter.gender && this._filter.gender !== 'all') {
        ajaxData.gender = this._filter.gender;
      }
    }
    
    return new bluebird((resolve, reject, onCancel) => {
      const xhr = jQuery.ajax({
        url: url,
        data: ajaxData,
        cache: false,
        success: resolve,
        error: (jqXHR, textStatus, errorThrown) => {
          const error = new Error(errorThrown);
          error.readyState = jqXHR.readyState;
          error.status = jqXHR.status;
          reject(error);
        },
        method: 'GET',
        dataType: 'json'
      });
      
      onCancel(() => {
        xhr.abort();
      });
      
    });
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
        if (false === this._tokenRisk.includes(this._tokens[i])) {
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
    this._tokenStart();
    this.emit('start', this._uids, this._tokens, this._filter);
    this._process = bluebird.each(this._uids, (uid, current, count) => {
      
      let errorRequestCount = 0;
      
      let req = () => {
        
        return this.request(uid).then(response => {
          // catch response
          if (response.error) {
            
            if ('GraphMethodException' === response.error.type) {
              return this._dataEmpthy;
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
                this.emit('grab', error, this._dataEmpthy, (current + 1), count);
                return bluebird.reject(error);
              }
              
              console.log('token ' + this._token + ' rusak');
              if (lodash.size(this._tokens) >= 2) { // Jika token ada lebih dari 1
                this._tokenSkip();
                console.log('token has change to ' + this._token);
                return req();
              }
              else {
                this.emit('grab', error, this._dataEmpthy, (current + 1), count);
                return bluebird.reject(error);
              }
            }
            
            this.emit('grab', null, this._dataEmpthy, (current + 1), count);
            return this._dataEmpthy;
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
          else {
            console.log(error);
          }
          
          if (errorRequestCount >= 5) {
            console.log('Connection prolem width 5x request, SKIP this');
            return bluebird.resolve(this._dataEmpthy);
          }
          
          if (error.status !== 0) {
            errorRequestCount++;
          }
          
          if (jQuery.type(error.status) !== "undefined"
            && jQuery.type(error.readyState) !== "undefined") { // detect this error form ajax
            
            return new bluebird(resolve => {
              if (!this._process.isCancelled()) { // don't run if process loop is canceled
                setTimeout(() => { // wait a 3 seconts to request again
                  console.log('Retry request start UID : ' + uid);
                  return resolve(req());
                }, 3000);
              }
            });
          }
          else {
            return bluebird.reject(error);
          }
          
        });
      };
      
      return req();
      
    }).catch(error => {
      // No catch handle
    }).finally(() => {
      this.emit('finish');
    });
  }
  
  stop() {
    if (this._process) {
      this._process.cancel();
    }
    this.emit('stop');
  }
  
}

module.exports = Grab;
