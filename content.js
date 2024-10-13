let lastCopiedText = '';
let isMouseDown = false;

document.addEventListener('mousedown', function () {
    isMouseDown = true;
});

document.addEventListener('mouseup', function () {
    isMouseDown = false;
});

document.addEventListener('mouseup', async function (event) {
    try {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // Prevent copying from elements where text can be written
        const targetElement = event.target;

        if (isEditableElement(targetElement)) {
            return;  // Skip copying if the target element is editable
        }

        if (selectedText && selectedText !== lastCopiedText && selectedText.length > 0) {
            const formatResult = await chrome.storage.local.get('copyFormat');
            const format = formatResult.copyFormat || 'original';

            let textToCopy = selectedText;

            switch (format) {
                case 'lowercase':
                    textToCopy = selectedText.toLowerCase();
                    break;
                case 'uppercase':
                    textToCopy = selectedText.toUpperCase();
                    break;
                case 'trimmed':
                    textToCopy = selectedText.trim();
                    break;
                case 'noSpaces':
                    textToCopy = selectedText.replace(/\s+/g, '');
                    break;
            }

            await copyToClipboard(textToCopy);
            lastCopiedText = selectedText;
            showNotification();
        }
    } catch (error) {
        console.error(error);
    }
});

// Function to check if an element is an editable field (input, textarea, or contenteditable)
function isEditableElement(element) {
    return (
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.isContentEditable
    );
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand('copy');
        textarea.remove();

        if (!successful) {
            throw new Error('execCommand copy failed');
        }
    } catch (error) {
        throw error;
    }
}

function showNotification() {
    try {
        const notification = document.createElement('div');
        notification.textContent = 'Copied!';
        notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 1500);
    } catch (error) {
        console.log(`Error showing notification: ${error.message}`);
    }
}
