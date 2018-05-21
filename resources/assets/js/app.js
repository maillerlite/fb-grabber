const jQuery = require('jquery');

try {
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
  
  if (jQuery('#page_grabber').length) {
    require('./grabber');
  }
});