let lastCopiedText = '';
let mouseDownInsideEditable = false;
let allowCopyFromEditable = false; // New flag to track the state


document.addEventListener('mousedown', function (event) {
    chrome.storage.local.get('allowEditableElements', function(data) {
        if (data.allowEditableElements !== undefined) {
            allowCopyFromEditable = data.allowEditableElements;
        }
    });
    mouseDownInsideEditable = isEditableElement(event.target);
});

document.addEventListener('mouseup', async function (event) {
    if (mouseDownInsideEditable && !allowCopyFromEditable) {
        return;  // Skip if clicked inside editable element and copying is disabled
    }

    try {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

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
            lastCopiedText = selectedText;  // Store the last copied text
            showNotification();  // Show notification upon success
        }
    } catch (error) {
        console.error("Error in mouseup event listener:", error);
    }
});

// Function to check if an element is an editable field (input, textarea, or contenteditable)
function isEditableElement(element) {
    try {
        return (
            element.tagName === 'INPUT' ||
            element.tagName === 'TEXTAREA' ||
            element.isContentEditable
        );
    } catch (error) {
        console.error("Error checking if element is editable:", error);
        console.log("Element causing error:", element);
        return false;  // In case of error, return false so the element doesn't block copy
    }
}

// Function to copy text to clipboard
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
        console.error("Error copying text using fallback:", error);
        throw error;  // Re-throw the error to be caught by the caller
    }
}

function showNotification(txt, color) {
    try {
        const notification = document.createElement('div');
        notification.textContent = txt || 'Text Copied!';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${color || '#4CAF50'};
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
        console.error("Error showing notification:", error);
    }
}
