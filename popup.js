
document.addEventListener('DOMContentLoaded', function() {
  const formatSelect = document.getElementById('copyFormat');
  

  // Load saved format
  chrome.storage.local.get('copyFormat', function(data) {
    if (data.copyFormat) {
      formatSelect.value = data.copyFormat;
    }
  });

  // Save format when changed
  formatSelect.addEventListener('change', function() {
    const newFormat = formatSelect.value;
    chrome.storage.local.set({
      copyFormat: newFormat
    }, () => {
      console.log('Format saved successfully');
    });
  });
});