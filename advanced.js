// Event listener for adding a new keyword with optional expiration
document.getElementById('addKeyword').addEventListener('click', function() {
  let newKeyword = document.getElementById('keywordInput').value.trim();
  let hours = parseInt(document.getElementById('blockHours').value.trim()) || 0;
  let minutes = parseInt(document.getElementById('blockMinutes').value.trim()) || 0;
  let seconds = parseInt(document.getElementById('blockSeconds').value.trim()) || 0;

  if (newKeyword) {
      chrome.storage.sync.get({ keywords: [] }, function(data) {
          let keywords = data.keywords;

          // Check for duplicates
          if (!keywords.some(item => item.keyword === newKeyword)) {
              let expirationTime = null;

              // Calculate expiration time if any time is given
              if (hours || minutes || seconds) {
                  let currentTime = new Date().getTime();
                  let expirationDuration = (hours * 3600 + minutes * 60 + seconds) * 1000;
                  expirationTime = currentTime + expirationDuration;
              }

              // Push the keyword and expiration time into the array
              keywords.push({ 
                  keyword: newKeyword, 
                  expirationTime: expirationTime 
              });

              // Save to storage
              chrome.storage.sync.set({ keywords: keywords }, function() {
                  displayKeywords(keywords);
                  document.getElementById('keywordInput').value = ''; // Clear input
                  document.getElementById('blockHours').value = ''; // Clear hours
                  document.getElementById('blockMinutes').value = ''; // Clear minutes
                  document.getElementById('blockSeconds').value = ''; // Clear seconds
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

  let currentTime = Date.now(); // Get the current time

  keywords.forEach((item, index) => {
      // Check if the keyword has expired
      if (item.expirationTime && currentTime > item.expirationTime) {
          removeKeyword(index); // Remove expired keyword
      } else {
          let keywordItem = document.createElement('li');
          let keywordText = document.createElement('span');
          keywordText.textContent = item.keyword; // Access the keyword property

          // Show expiration time if it exists
          if (item.expirationTime) {
              let timeRemaining = item.expirationTime - currentTime;
              let hours = Math.floor(timeRemaining / (1000 * 60 * 60));
              let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

              keywordText.textContent += ` (Expires in ${hours}h ${minutes}m ${seconds}s)`;
          }

          // Remove button for each keyword
          let removeBtn = document.createElement('button');
          removeBtn.classList.add('remove-btn');
          removeBtn.innerHTML = '&times;';
          removeBtn.addEventListener('click', function() {
              removeKeyword(index);
          });

          keywordItem.appendChild(keywordText);
          keywordItem.appendChild(removeBtn);
          keywordList.appendChild(keywordItem);
      }
  });
}

// Function to remove keyword from storage and display
function removeKeyword(index) {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
      let keywords = data.keywords;
      keywords.splice(index, 1); // Remove the keyword at the given index

      chrome.storage.sync.set({ keywords: keywords }, function() {
          displayKeywords(keywords); // Refresh the display
      });
  });
}

// Load the keyword list when the advanced settings page is opened
chrome.storage.sync.get({ keywords: [] }, function(data) {
  displayKeywords(data.keywords);
});

// Function to open basic settings page
document.querySelector('.back-link').addEventListener('click', function() {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
});

// Set interval to refresh the keyword list every minute
setInterval(function() {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
      displayKeywords(data.keywords); // Refresh the list
  });
}, 60000); // Check every minute
