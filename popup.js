// Adding keywords to storage and displaying in list
document.getElementById('addKeyword').addEventListener('click', function() {
  let newKeyword = document.getElementById('keywordInput').value.trim();

  if (newKeyword) {
    chrome.storage.sync.get({ keywords: [] }, function(data) {
      let keywords = data.keywords;
      if (!keywords.some(item => item.keyword === newKeyword)) {
        // Push the keyword as an object
        keywords.push({ keyword: newKeyword });

        chrome.storage.sync.set({ keywords: keywords }, function() {
          displayKeywords(keywords);
          document.getElementById('keywordInput').value = ''; // Clear the input
        });
      } else {
        alert('Keyword already exists.');
      }
    });
  }
});

// Function to display keywords in the list
function displayKeywords(keywords) {
  let keywordList = document.getElementById('keywordList');
  keywordList.innerHTML = ''; // Clear existing list

  keywords.forEach((item, index) => {
    let keywordItem = document.createElement('li');

    let keywordText = document.createElement('span');
    keywordText.textContent = item.keyword; // Access the keyword property

    let removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.innerHTML = '&times;'; // Add cross icon
    removeBtn.addEventListener('click', function() {
      removeKeyword(index);
    });

    keywordItem.appendChild(keywordText);
    keywordItem.appendChild(removeBtn);
    keywordList.appendChild(keywordItem);
  });
}

// Remove keyword from list and storage
function removeKeyword(index) {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
    let keywords = data.keywords;
    keywords.splice(index, 1); // Remove the keyword at the given index

    chrome.storage.sync.set({ keywords: keywords }, function() {
      displayKeywords(keywords);
    });
  });
}

// Load the keyword list when the popup is opened
chrome.storage.sync.get({ keywords: [] }, function(data) {
  displayKeywords(data.keywords);
});
document.getElementById('advancedOptions').addEventListener('click', function() {
  chrome.tabs.create({ url: chrome.runtime.getURL('advanced.html') });
});