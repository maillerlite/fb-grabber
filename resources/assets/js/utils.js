const jQuery = require('jquery'),
  bluebird = require('bluebird');

function fromToObject(el) {
  let data = {};
  const dataArray = el.serializeArray();
  dataArray.forEach(val => {
    const key = val.name;
    data[key] = val.value;
  });
  return data;
}

function grabber(uid, options = {}) {
  
  uid = uid ? uid.replace(/(\r)/, '') : '';
  
  if (uid.length < 3) { // Jika dibawah panjang 3 karakter langsung ae skip
    return bluebird.resolve([]);
  }
  
  const url = '/api/grab',
    ajaxData = {
      uid: uid
    };
  
  if (options.token) {
    ajaxData.token = options.token.replace(/(\r)/, '');
  }
  if (options.country && options.country !== 'all') {
    ajaxData.country = options.country;
  }
  if (options.gender && options.gender !== 'all') {
    ajaxData.gender = options.gender;
  }
  
  const request = jQuery.ajax({
    url: url,
    data: ajaxData,
    cache: false,
    method: 'GET',
    dataType: 'json',
  });
  
  return bluebird.resolve(request);
}

function downloadText(text) {
  return window.URL.createObjectURL(new window.Blob(text, {
    type: "text/plain"
  }));
}

module.exports.fromToObject = fromToObject;
module.exports.grabber = grabber;
module.exports.downloadText = downloadText;
