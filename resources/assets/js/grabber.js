const jQuery = require('jquery'),
  Boxs = require('./boxs');

jQuery(document).ready(() => {
  
  const boxsBaseTemplate = jQuery('#grab-box-template.d-none'),
    boxs = new Boxs(boxsBaseTemplate);
  
  boxs.add();
  boxs.add();
  
});