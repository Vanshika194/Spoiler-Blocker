chrome.runtime.onInstalled.addListener(() => {
    console.log('Spoiler Blocker Extension Installed');
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "navigateBackToOriginalTab") {
        // Find the tab that opened the extension's options page
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const currentTab = tabs[0];

            // Check if the original opener tab exists
            if (currentTab && currentTab.openerTabId) {
                // Switch to the original tab
                chrome.tabs.update(currentTab.openerTabId, { active: true });
            } else {
                console.error("Original tab not found.");
            }
        });
    }
});
