function fromToObject(el) {
  let data = {};
  const dataArray = el.serializeArray();
  dataArray.forEach(val => {
    const key = val.name;
    data[key] = val.value;
  });
  return data;
}

function createDownloadText(element, unique, text, filename) {
  const a = document.createElement("a"),
    url = window.URL.createObjectURL(new window.Blob(text, {
      type: "text/plain"
    }));
  
  element.append(a);
  
  a.setAttribute('id', 'dnl-' + unique);
  a.setAttribute('style', 'display: none');
  a.href = url;
  a.download = filename;
  a.click();
  
  window.URL.revokeObjectURL(url);
  
  if (element.find('a#dnl-' + unique).length > 0) {
    element.find('a#dnl-' + unique).remove();
  }
  
  return a;
}

module.exports.fromToObject = fromToObject;
module.exports.createDownloadText = createDownloadText;
