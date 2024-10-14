document.addEventListener('DOMContentLoaded', function() {
  const formatSelect = document.getElementById('copyFormat');
  const editableCheckbox = document.getElementById('allowEditableElements');

  // Load saved options
  chrome.storage.local.get(['copyFormat', 'allowEditableElements'], function(data) {
    if (data.copyFormat) {
      formatSelect.value = data.copyFormat;
    }
    if (data.allowEditableElements !== undefined) {
      editableCheckbox.checked = data.allowEditableElements;
    }
  });

  // Save format when changed
  formatSelect.addEventListener('change', function() {
    const newFormat = formatSelect.value;
    chrome.storage.local.set({ copyFormat: newFormat }, () => {
      console.log('Format saved successfully');
    });
  });

  // Save checkbox state when changed
  editableCheckbox.addEventListener('change', function() {
    const isChecked = editableCheckbox.checked;
    chrome.storage.local.set({ allowEditableElements: isChecked }, () => {
      console.log('Editable elements setting saved successfully');
    });
  });
});
