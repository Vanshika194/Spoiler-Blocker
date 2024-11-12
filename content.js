const script = document.createElement('script');
script.src = chrome.runtime.getURL('libs/tesseract.min.js'); // Reference local file
document.head.appendChild(script);

// Load user-defined keywords for spoilers
chrome.storage.sync.get({ keywords: [] }, function(data) {
  const keywords = data.keywords.map(item => item.keyword.toLowerCase());

  // Check if there are no keywords set
  if (keywords.length === 0) {
    console.warn("No keywords defined for spoiler blocking.");
    return; // Exit if no keywords
  }

  // Block spoilers in text content
  function blockSpoilersInText() {
    const elements = document.body.querySelectorAll('p, span, h1, h2, h3'); // Target specific tags

    elements.forEach(element => {
      element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent.toLowerCase();

          keywords.forEach(keyword => {
            if (textContent.includes(keyword)) {
              element.style.filter = "blur(5px)";
              element.title = "Spoiler blocked";
              element.style.cursor = "pointer";
              element.setAttribute("data-blurred", "true");
              addHoverEvents(element);
            }
          });
        }
      });
    });
  }

  function addHoverEvents(element) {
    element.addEventListener('mouseenter', debounce(showViewOption.bind(null, element), 300));
    element.addEventListener('mouseleave', debounce(hideViewOption, 300));
  }


  // Function to show and hide "View" button
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
    viewButton.onclick = function() {
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
  

  // Debounce function to limit the rate of function execution
  function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  // Trigger the spoiler blocking functionality on page load
  window.onload = function() {
    blockSpoilersInText();

  };
}); 
