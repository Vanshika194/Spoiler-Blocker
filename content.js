// Example keywords to block (can be made dynamic from storage)
chrome.storage.sync.get({ keywords: [] }, function(data) {
  const keywords = data.keywords; // Get user-defined keywords

  function blockSpoilers() {
    let elements = document.body.getElementsByTagName('*');
  
    for (let element of elements) {
      for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          let textContent = node.textContent.toLowerCase();
          
          keywords.forEach(keyword => {
            if (textContent.includes(keyword)) {
              // Apply blur effect and make text clickable
              element.style.filter = "blur(5px)";
              element.title = "Spoiler blocked";
              element.style.cursor = "pointer";
              
              // Add an event listener to unblur when clicked
              element.addEventListener('click', function() {
                element.style.filter = "none";
              });
            }
          });
        }
      }
    }
  }

  window.onload = blockSpoilers;
});
