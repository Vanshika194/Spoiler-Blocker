// Add a new keyword to the list
document.getElementById('addKeyword').addEventListener('click', function() {
  let newKeyword = document.getElementById('keywordInput').value.trim().toLowerCase();

  if (newKeyword) {
    chrome.storage.sync.get({ keywords: [] }, function(data) {
      let keywords = data.keywords;
      // Check if the keyword already exists
      if (!keywords.some(item => item.keyword === newKeyword)) {
        keywords.push({ keyword: newKeyword });
        chrome.storage.sync.set({ keywords: keywords }, function() {
          displayKeywords(keywords);
          document.getElementById('keywordInput').value = ''; // Clear input
        });
      } else {
        alert('Keyword already exists.');
      }
    });
  } else {
    alert('Please enter a keyword.'); // Alert if the input is empty
  }
});

// Display the list of keywords
function displayKeywords(keywords) {
  let keywordList = document.getElementById('keywordList');
  keywordList.innerHTML = ''; // Clear existing list

  keywords.forEach((item, index) => {
    let keywordItem = document.createElement('li');
    keywordItem.textContent = item.keyword;

    let removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', function() {
      removeKeyword(index);
    });

    keywordItem.appendChild(removeBtn);
    keywordList.appendChild(keywordItem);
  });
}

// Remove a keyword from storage and display
function removeKeyword(index) {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
    let keywords = data.keywords;
    keywords.splice(index, 1);

    chrome.storage.sync.set({ keywords: keywords }, function() {
      displayKeywords(keywords);
    });
  });
}

// Load keywords on popup open
chrome.storage.sync.get({ keywords: [] }, function(data) {
  displayKeywords(data.keywords);
});

document.getElementById('advancedOptions').addEventListener('click', function() {
  // Query the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const originUrl = tabs[0].url;
      // Store the origin URL in chrome.storage.local
      chrome.storage.local.set({ originUrl: originUrl }, function() {
          // After storing, open the advanced settings page
          window.open('chrome-extension://kkpndpemofogdmijambgbllfcmppdaec/advanced.html');
      });
  });
});


