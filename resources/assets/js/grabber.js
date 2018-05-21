const jQuery = require('jquery'),
  bluebird = require('bluebird'),
  utils = require('./utils');

class processGrab {
  
  constructor(elementForm, elementOutput) {
    this.elementForm = jQuery(elementForm);
    this.elementOutput = jQuery(elementOutput);
    this.elementCount = jQuery('#count-total');
    this.elementGrabberInput = jQuery('#grabber-input');
    this.elementGrabberOutput = jQuery('#grabber-output');
    
    this.token = null;
    this._stopRequest = false;
    this.tokenRusak = [];
    
    // Event
    jQuery(this.elementOutput).on('click', () => {
       jQuery(this.elementOutput).select();
    });
  }
  
  _alert(message) {
    const box = document.createElement('div'),
      b = document.createElement('b');
    
    b.innerHTML = 'Kesalahan :';
    box.appendChild(b);
    box.appendChild(document.createTextNode(' ' + message));
    return box;
  }
  
  pushAlert(message) {
    const elAlert = utils.createAlertElement(this._alert(message), {
      type: 'danger'
    });
    this.elementForm.find('#form_grabber_alert').append(elAlert);
  }
  
  setToken(listToken) {
    if (null === this.token) {
      if (listToken.length > 0) {
        this.token = listToken[0];
      }
    }
    else {
      for (let i = 0; i < listToken.length; i++) {
        if (!this.tokenRusak.includes(listToken[i])) {
          this.token = listToken[i];
          break;
        }
      }
    }
    return this.token;
  }
  
  _onStop() {
    
    console.log('stop event');
    
    this._stopRequest = true;
    
    jQuery('#grab-btn-stop').addClass('d-none');
    jQuery('#grab-btn-other').removeClass('d-none');
    
    const elementGrabberOutput = jQuery(this.elementGrabberOutput);
    
    elementGrabberOutput.find('button#grab-download').on('click', () => {
      
      const text = jQuery(this.elementOutput).val(),
        a = document.createElement("a"),
        d = new Date(),
        url = utils.downloadText([text]);
      
      document.body.appendChild(a);
      a.setAttribute('id', 'dnl');
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = d.getMonth()+1 + "-" + d.getDate() + "-" + d.getFullYear() + '-' + this._country + '-' + this._gender + '.txt';
      a.click();
      
      window.URL.revokeObjectURL(url);
      
      if (jQuery('a#dnl').length > 0) {
        jQuery('a#dnl').remove();
      }
        
    });
    
    elementGrabberOutput.find('button#grab-clear').on('click', () => {
      this._onReset();
    });
    
  }
  
  _onReset() {
    // Set TOTAL_UID to 0
    this.elementCount.text(0);
    // Remove d-none
    this.elementGrabberInput.removeClass('d-none');
    this.elementGrabberOutput.addClass('d-none');
    
    jQuery('#grab-btn-stop').removeClass('d-none');
    jQuery('#grab-btn-other').addClass('d-none');
    
    // SET 0 OUTPUT
    jQuery(this.elementOutput).text('');
    
    const elementProcess = jQuery(this.elementGrabberOutput).find('#process-bar');
    elementProcess.attr('aria-valuenow', 0);
    elementProcess.width('0%');
    elementProcess.text('0%');
  }
  
  _onRun() {
    this.elementGrabberInput.addClass('d-none');
    this.elementGrabberOutput.removeClass('d-none');
    
    const elementGrabberOutput = jQuery(this.elementGrabberOutput);
    
    elementGrabberOutput.find('button#grab-btn-stop').on('click', () => {
      this._onStop();
    });
  }
  
  // This is a callback
  _onGrabSuccess(response, current, count) {
    const elementProcess = this.elementGrabberOutput.find('#process-bar'),
      percent = (current/count*100),
      countElement = jQuery(this.elementCount),
      countUids = countElement.text();
    
    elementProcess.attr('aria-valuenow', percent);
    elementProcess.width(percent + '%');
    elementProcess.text(parseInt(percent, 10) + '%');
    
    // Set TOTAL_UID
    countElement.text(parseInt(countUids, 10) + response.length);
    
    // Append UID
    jQuery.each(response, (index, uid) => {
      jQuery(this.elementOutput).append(uid + "\r");
    });
  }
  
  run(data) {
    
    const _this = this;
    
    this._onReset();
    this.setToken(data.token);
    this._onRun();
    
    this._gender = data.gender;
    this._country = data.country;
    
    const options = {
      token: this.token,
      country: data.country,
      gender: data.gender
    };
    
    console.log('Token sekarang ' + _this.token);
    bluebird.each(data.uid, (uid, current, count) => {
      
      // create variable function to rollback to here if have someting problem to handle request in loop
      const __request = (options) => {
        
        // Stop
        if (true === _this._stopRequest) {
          return bluebird.resolve([]);
        }
        
        return utils.grabber(uid, options).then(response => {
          
          // catch response
          if (response.error) {
            const error = new Error();
            for (let errorKey in response.error) {
              error[errorKey] = response.error[errorKey];
            }
            console.error(error);
            if ((_this.tokenRusak.length + 1) < data.token.length) {
              _this.tokenRusak.push(_this.token);
              let token = _this.setToken(data.token);
              options.token = token;
              console.log('Token sekarang ' + _this.token);
              return __request(options);
            }
            alert(error.message);
            return bluebird.reject(error);
          }
          _this._onGrabSuccess(response, current, count);
          return response;
        }).catch(error => {
          if (error.status == 0) { // permintaan tidak diinisialisasi
            console.log('Request not initialized');
            return new Promise(resolve => {
              setTimeout(() => { // wait a 1 seconts to request again
                console.log('Retry request start UID : ' + uid);
                return __request(options);
              }, 1000); 
            });
          }
          else {
            return bluebird.reject(error);
          }
        });
        
      };
      
      return __request(options);
      
    }).finally(() => {
      
      const elementProcess = jQuery(_this.elementGrabberOutput).find('#process-bar');
      elementProcess.attr('aria-valuenow', 100);
      elementProcess.width('100%');
      elementProcess.text('100%');
    
      // Stop if _stopRequest not true
      if (false === _this._stopRequest) {
        _this._onStop();
      }

    });
  }
  
}

jQuery(document).ready(() => {
 
 jQuery('#form_grabber').on('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    
    const _this = jQuery('#form_grabber'),
      data = utils.fromToObject(_this),
      process = new processGrab(_this, '#output');
    
    data.token = data.token.split(/\n/);
    data.uid = data.uid.split(/\n/);
    
    if (_this.length && _this[0].checkValidity() === true) {
      process.run(data);
    }
    _this.addClass('was-validated');
  });
  
});