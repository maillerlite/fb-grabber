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
  }
  
  _registerEvent(box) {
    const form = box.element.find('#grab-form'),
      btnStop = box.element.find('#grab-btn-stop'),
      btnReset = box.element.find('#grab-btn-reset'),
      btnDownload = box.element.find('#grab-btn-download'),
      btnOther = box.element.find('#grab-btn-other'),
      
      boxFormInput = box.element.find('#form-input'),
      boxFormOutput = box.element.find('#form-output'),
      
      output = boxFormOutput.find('#output'),
      elementProcess = boxFormOutput.find('#process-bar'),
      grabbed = boxFormOutput.find('#grab-count-grabbed');
    
    box.grab.on('start', (uid, token, filter) => {
      this.emit('resetOutput', box);
      box.element.find('#grab-count-total').text(uid.length);
    });
    
    box.grab.on('grab', (error, response, current, processed) => {
      const percent = (current/processed*100);
      
      boxFormOutput.find('#grab-count-process').text(current);
      boxFormOutput.find('#grab-count-total').text(processed);
      
      if (response.length) {
        grabbed.text((parseInt(grabbed.text(), 10) + response.length));
      }
      
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
      elementProcess.attr('aria-valuenow', 100);
      elementProcess.width('100%');
      elementProcess.text('100%');
      this.emit('clickStop', box);
    });
    
    form.on('submit', event => {
      event.preventDefault();
      event.stopPropagation();
      
      const data = utils.fromToObject(form),
        token = data.token = jQuery.trim(data.token).split(/\n/),
        uid = data.uid = jQuery.trim(data.uid).split(/\n/);
      
      if (form.length && form[0].checkValidity() === true) {
        box.grab.start(uid, token, {
          'country': data.country,
          'gender': data.gender
        });
        
        boxFormInput.addClass('d-none');
        boxFormOutput.removeClass('d-none');
      }
      
      form.addClass('was-validated');
    });
    
    btnStop.on('click', () => {
      this.emit('clickStop');
    });
    
    btnReset.on('click', () => {
      this.emit('resetOutput', box);
      boxFormInput.removeClass('d-none');
      boxFormOutput.addClass('d-none');
    });
    
    this.on('clickStop', () => {
      box.grab.stop();
      btnStop.addClass('d-none');
      btnOther.removeClass('d-none');
    });
    
    this.on('resetOutput', box => {
      elementProcess.attr('aria-valuenow', 23);
      elementProcess.width('23%');
      elementProcess.text('loading...');
      
      btnOther.addClass('d-none');
      btnStop.removeClass('d-none');
      
      output.text('');
      
      boxFormOutput.find('#grab-count-process').text(0);
      boxFormOutput.find('#grab-count-total').text(0);
      grabbed.text(0);
    });
    
    box.element.find('#output').focus(() => {
      const $this = box.element.find('#output');
      $this.select();
      // Work around Chrome's little problem
      $this.mouseup(() => {
        // Prevent further mouseup intervention
        $this.unbind("mouseup");
        return false;
      });
    });
    
    btnDownload.on('click', () => {
      const currentBox = box.element.closest('#grab-box'),
        uids = box.element.find('#output').val(),
        d = new Date(),
        dateTextFormat = d.getMonth()+1 + "-" + d.getDate() + "-" + d.getFullYear(),
        filename = dateTextFormat + '-' + box.element.find("select[name='gender']").val() + '-' + box.element.find("select[name='country']").val() + '-' + box.element.find("#grab-count-grabbed").text() + '-' + '.txt';
      utils.createDownloadText(currentBox, box.number, [uids], filename);
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
