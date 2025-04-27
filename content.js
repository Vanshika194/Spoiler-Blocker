// Load Tesseract.js script (if needed for OCR support)
const script = document.createElement('script');
script.src = chrome.runtime.getURL('libs/tesseract.min.js');
document.head.appendChild(script);


let keywords = [];
let extensionEnabled = true;


chrome.storage.sync.get({ enabled: true, keywords: [] }, function (data) {
    extensionEnabled = data.enabled;
    keywords = data.keywords.map(item => item.keyword.toLowerCase());

    // Check if there are no keywords set
    if (keywords.length === 0) {
        console.warn("No keywords defined for spoiler blocking.");
    }

    // Trigger spoiler blocking if the extension is enabled
    if (extensionEnabled) {
        blockSpoilersInText();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "enable") {
        extensionEnabled = true;
        blockSpoilersInText();
    } else if (message.action === "disable") {
        extensionEnabled = false;
        clearAllBlur();
    }
});

// Function to clear all blurred content when disabling the extension
function clearAllBlur() {
    const blurredElements = document.querySelectorAll("[data-blurred='true']");
    blurredElements.forEach(element => {
        element.style.filter = "none";
        element.setAttribute("data-blurred", "false");
    });
}

// Block spoilers in text content
function blockSpoilersInText() {
    if (!extensionEnabled) return;

    const elements = document.body.querySelectorAll('p, span, h1, h2, h3');

    elements.forEach(element => {
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent.toLowerCase();
                keywords.forEach(keyword => {
                    if (textContent.includes(keyword) && !element.hasAttribute('data-blurred')) {
                        blurElement(element, "Keyword-based spoiler detected");
                    }
                });

                chrome.runtime.sendMessage({
                    action: "checkSpoiler",
                    text: node.textContent
                }, (response) => {
                    if (response && response.success && response.isSpoiler) {
                        blurElement(element, "ML-based spoiler detected");
                    }
                });
            }
        });
    });
}

function blurElement(element, title) {
    if (element.hasAttribute("data-blurred")) return;

    element.style.filter = "blur(5px)";
    element.title = title;
    element.style.cursor = "pointer";
    element.setAttribute("data-blurred", "true");
    addHoverEvents(element);
}
function addHoverEvents(element) {
    element.addEventListener('mouseenter', debounce(() => showViewOption(element), 300));
    element.addEventListener('mouseleave', debounce(hideViewOption, 300));
}

function showViewOption(element) {
    hideViewOption();
    const viewButton = document.createElement('button');
    viewButton.innerText = "View";
    viewButton.style.position = "absolute";
    viewButton.style.zIndex = 1000;
    viewButton.style.padding = "5px 10px";
    viewButton.style.backgroundColor = "#FF5722";
    viewButton.style.color = "#ffffff";
    viewButton.style.border = "2px solid #ffffff";
    viewButton.style.cursor = "pointer";
    viewButton.style.borderRadius = "5px";
    viewButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    viewButton.style.fontSize = "12px";
    viewButton.style.fontWeight = "bold";
    viewButton.style.opacity = "0.9";

    const rect = element.getBoundingClientRect();
    viewButton.style.top = `${rect.top + window.scrollY + 5}px`;
    viewButton.style.left = `${rect.left + window.scrollX + rect.width - 70}px`;
    document.body.appendChild(viewButton);

    viewButton.onclick = function () {
        element.style.filter = "none";
        element.setAttribute("data-blurred", "false");
        hideViewOption();
    };
}

function hideViewOption() {
    const existingButton = document.querySelector('button');
    if (existingButton && existingButton.parentNode) {
        existingButton.parentNode.removeChild(existingButton);
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

