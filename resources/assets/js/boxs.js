const jQuery = require('jquery'),
  listener = require('./listener'),
  utils = require('./utils'),
  Grab = require('./grab');

class Boxs extends listener {
  
  constructor(baseTemplate) {
    super();
    
    this.count = 0;
    this._list = [];
    
    if (!baseTemplate) {
      throw new Error('baseTemplate is required!');
    }
    
    this.baseTemplate = baseTemplate.clone();
    this.baseTemplate.removeClass('d-none');
    this.baseTemplate.attr('id', 'grab-box');
    
    this.on('clickStart', box => {
      
      const boxFormInput = box.element.find('#form-input'),
        boxFormOutput = box.element.find('#form-output');
       
      boxFormInput.addClass('d-none');
      boxFormOutput.removeClass('d-none');
      
    });
    
    this.on('clickStop', box => {
      
      box.grab.stop();
      
      box.element.find('#grab-btn-stop').addClass('d-none');
      box.element.find('#grab-btn-other').removeClass('d-none');
      
    });
    
    this.on('resetOutput', box => {
      
      const boxFormOutput = box.element.find('#form-output'),
        elementProcess = boxFormOutput.find('#process-bar');
      
      elementProcess.attr('aria-valuenow', 23);
      elementProcess.width('23%');
      elementProcess.text('loading...');
      
      boxFormOutput.find('#grab-btn-other').addClass('d-none');
      boxFormOutput.find('#grab-btn-stop').removeClass('d-none');
      
      boxFormOutput.find('#output').text('');
      
      boxFormOutput.find('#grab-count-process').text(0);
      boxFormOutput.find('#grab-count-total').text(0);
      boxFormOutput.find('#grab-count-grabbed').text(0);
      
    });
    
    this.on('clickReset', box => {
      const boxFormInput = box.element.find('#form-input'),
        boxFormOutput = box.element.find('#form-output');
      
      this.emit('resetOutput', box);
      
      boxFormInput.removeClass('d-none');
      boxFormOutput.addClass('d-none');
      
    });
  }
  
  _registerEvent(box) {
    
    const form = box.element.find('#grab-form'),
      btnStop = box.element.find('#grab-btn-stop'),
      btnReset = box.element.find('#grab-btn-reset'),
      btnDownload = box.element.find('#grab-btn-download');
    
    box.grab.on('start', (uid, token, filter) => {
      
      this.emit('resetOutput', box);
      
    });
    
    box.grab.on('grab', (error, response, current, processed) => {
      
      const boxFormOutput = box.element.find('#form-output'),
        elementProcess = boxFormOutput.find('#process-bar'),
        output = boxFormOutput.find('#output'),
        grabbed = boxFormOutput.find('#grab-count-grabbed'),
        percent = (current/processed*100);
        
      boxFormOutput.find('#grab-count-process').text(current);
      boxFormOutput.find('#grab-count-total').text(processed);
      grabbed.text((parseInt(grabbed.text(), 10) + response.length));
      
      elementProcess.attr('aria-valuenow', percent);
      elementProcess.width(percent + '%');
      elementProcess.text(parseInt(percent, 10) + '%');
      
      if (!error) {
        output.append(response.length ? response.join("\n") + "\n" : '');
      }
      else {
        let msg = '';
        if (error.title) {
          msg += error.title + ' - ';
        }
        msg += error.message;
        alert(msg);
      }
      
    });
    
    box.grab.on('finish', () => {
      
      const elementProcess = box.element.find('#process-bar');
      
      elementProcess.attr('aria-valuenow', 100);
      elementProcess.width('100%');
      elementProcess.text('100%');
      
      this.emit('clickStop', box);
      
    });
    
    form.on('submit', event => {
      
      const data = utils.fromToObject(form);
      
      event.preventDefault();
      event.stopPropagation();
      
      const token = data.token = data.token.split(/\n/);
      const uid = data.uid = data.uid.split(/\n/);
      
      if (form.length && form[0].checkValidity() === true) {
        
        box.grab.start(uid, token, {
          'country': data.country,
          'gender': data.gender
        });
        
        this.emit('clickStart', box);
      }
      form.addClass('was-validated');
    });
    
    btnStop.on('click', () => {
      this.emit('clickStop', box);
    });
    
    btnReset.on('click', () => {
      this.emit('clickReset', box);
    });
    
    btnDownload.on('click', () => {
      const currentBox = box.element.closest('#grab-box'),
        uids = box.element.find('#output').val(),
        a = document.createElement("a"),
        d = new Date(),
        url = utils.downloadText([uids]),
        dateTextFormat = d.getMonth()+1 + "-" + d.getDate() + "-" + d.getFullYear(),
        filename = dateTextFormat + '-' + box.element.find("select[name='gender']").val() + '-' + box.element.find("select[name='country']").val() + '-' + box.element.find("#grab-count-grabbed").text() + '-' + '.txt';
      
      currentBox.append(a);
      a.setAttribute('id', 'dnl-' + box.number );
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      
      window.URL.revokeObjectURL(url);
      
      if (currentBox.find('a#dnl-' + box.number).length > 0) {
        currentBox.find('a#dnl-' + box.number).remove();
      }
    });
    
  }
  
  add() {
    
    const element = this.baseTemplate.clone(),
      grab = new Grab();
    
    element.attr('data-box-number', this._list.length);
    element.attr('data-box-process', false);
    element.find('#form-input #task').text((this._list.length + 1));
    
    jQuery('#grab-boxs.row').append(element);
    
    const box = {
      'element': element,
      'grab': grab,
      'number': this._list.length
    };
    this._registerEvent(box);
    this._list.push(box);
    this.emit('add', element, this._list.length);
    this.count++;
    return box;
    
  }
  
  remove(number) {
    
    this._list[number].element.remove();
    this._list.splice(number, 1);
    this.emit('remove', number);
    
  }
  
}

module.exports = Boxs;
