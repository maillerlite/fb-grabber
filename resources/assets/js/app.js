const jQuery = require('jquery'),
  lodash = require('lodash'),
  Boxs = require('./boxs');

try {
  window._ = lodash;
  window.$ = window.jQuery = jQuery;
  require('bootstrap');
} catch (e) {}

jQuery(() => {
  jQuery(document).ready(() => {
    jQuery('.loading').hide(0, () => {
      jQuery('body').removeAttr('style');
      jQuery('.body-wrapper').removeAttr('style');
    });
  });
  
  if (jQuery('#page-grabber').length) {
    const boxsBaseTemplate = jQuery('#grab-box-template.d-none'),
      boxs = new Boxs(boxsBaseTemplate);
    
    boxs.add();
    boxs.add();
  }
});