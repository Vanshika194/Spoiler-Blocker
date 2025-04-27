document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleExtension");
  const keywordInput = document.getElementById("keywordInput");
  const addKeywordBtn = document.getElementById("addKeyword");
  const keywordList = document.getElementById("keywordList");
  const advancedOptions = document.getElementById("advancedOptions");

  // === Enable/Disable Toggle Functionality ===
  // Load the current extension state
  chrome.storage.sync.get("enabled", (data) => {
    toggle.checked = data.enabled ?? true; // Default to enabled if not set
  });

  // Handle the toggle button change
  toggle.addEventListener("change", () => {
    const isEnabled = toggle.checked;
    chrome.storage.sync.set({ enabled: isEnabled });

    // Notify content script about the change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: isEnabled ? "enable" : "disable" });
      }
    });
  });

  
  // === Keyword Management Functionality ===
  // Add a new keyword to the list
  addKeywordBtn.addEventListener("click", function () {
    const newKeyword = keywordInput.value.trim().toLowerCase();

    if (newKeyword) {
      chrome.storage.sync.get({ keywords: [] }, function (data) {
        let keywords = data.keywords;
        // Check if the keyword already exists
        if (!keywords.some(item => item.keyword === newKeyword)) {
          keywords.push({ keyword: newKeyword });
          chrome.storage.sync.set({ keywords: keywords }, function () {
            displayKeywords(keywords);
            keywordInput.value = ''; // Clear input
          });
        } else {
          alert("Keyword already exists.");
        }
      });
    } else {
      alert("Please enter a keyword.");
    }
  });

  function displayKeywords(keywords) {
    keywordList.innerHTML = '';

    keywords.forEach((item, index) => {
      const keywordItem = document.createElement("li");
      keywordItem.textContent = item.keyword;

      const removeBtn = document.createElement("button");
      removeBtn.classList.add("remove-btn");
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", function () {
        removeKeyword(index);
      });

      keywordItem.appendChild(removeBtn);
      keywordList.appendChild(keywordItem);
    });
  }
  function removeKeyword(index) {
    chrome.storage.sync.get({ keywords: [] }, function (data) {
      let keywords = data.keywords;
      keywords.splice(index, 1);

      chrome.storage.sync.set({ keywords: keywords }, function () {
        displayKeywords(keywords);
      });
    });
  }
  chrome.storage.sync.get({ keywords: [] }, function (data) {
    displayKeywords(data.keywords);
  });

  advancedOptions.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const originUrl = tabs[0]?.url;
      if (originUrl) {

        chrome.storage.local.set({ originUrl: originUrl }, function () {
          window.open('chrome-extension://bikjcmhamhmclcmnlobegiecehkejndb/advanced.html');
        });
      }
    });
  });
});
