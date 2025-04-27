// Function to interact with the FastAPI backend for spoiler detection
async function detectSpoilers(text) {
    try {
        let response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: text })
        });

        const result = await response.json();

        // Assuming the API returns a "prediction" field where 1 = spoiler and 0 = no spoiler
        return result.prediction === 1; 
    } catch (error) {
        console.error("Error in detecting spoilers: ", error);
        return false; 
    }
}


chrome.runtime.onInstalled.addListener(() => {
    console.log('Spoiler Blocker Extension Installed');
    chrome.storage.local.set({ isEnabled: true });
});

// Function to check if a URL is a valid website (not a chrome:// or chrome-extension:// URL)
function isValidUrl(url) {
    return url && (url.startsWith("http://") || url.startsWith("https://"));
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && isValidUrl(tab.url)) {
        chrome.storage.local.get("isEnabled", (data) => {
            if (data.isEnabled) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["content.js"]
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "navigateBackToOriginalTab") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.openerTabId) {
                chrome.tabs.update(currentTab.openerTabId, { active: true }, () => {
                    sendResponse({ success: true, message: "Navigated back to the original tab." });
                });
            } else {
                console.error("Original tab not found.");
                sendResponse({ success: false, message: "Original tab not found." });
            }
        });
        return true; 
    }
    if (message.action === "checkSpoiler") {
        detectSpoilers(message.text).then((isSpoiler) => {
            sendResponse({ success: true, isSpoiler: isSpoiler });
        }).catch((error) => {
            console.error("Error checking for spoilers: ", error);
            sendResponse({ success: false, message: "Error checking for spoilers" });
        });
        return true;
    }

    // Handle toggle enable/disable action from popup
    if (message.action === "toggleExtension") {
        chrome.storage.local.get("isEnabled", (data) => {
            const newStatus = !data.isEnabled;
            chrome.storage.local.set({ isEnabled: newStatus }, () => {
                sendResponse({ success: true, isEnabled: newStatus });
                console.log(`Extension status changed: ${newStatus ? 'Enabled' : 'Disabled'}`);
            });
        });
        return true;
    }
});
