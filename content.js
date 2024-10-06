chrome.storage.sync.get({ keywords: [] }, function(data) {
  const keywords = data.keywords; // Get user-defined keywords

  function blockSpoilers() {
    let elements = document.body.getElementsByTagName('*');

    for (let element of elements) {
      for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          let textContent = node.textContent.toLowerCase();

          // Loop over each keyword object and check if the text contains the keyword
          keywords.forEach(item => {
            // Access the keyword property of the object and apply toLowerCase()
            let keyword = item.keyword.toLowerCase();

            if (textContent.includes(keyword)) {
              // Apply blur effect
              element.style.filter = "blur(5px)";
              element.title = "Spoiler blocked";
              element.style.cursor = "pointer";
              element.setAttribute("data-blurred", "true"); // Mark element as blurred

              // Show the "View" button on hover
              element.addEventListener('mouseenter', function() {
                if (element.getAttribute("data-blurred") === "true") {
                  showViewOption(element); // Only show the "View" button if the element is blurred
                }
              });

              // Keep the button available when interacting with it
              element.addEventListener('mouseleave', function() {
                setTimeout(hideViewOption, 300); // Delay to avoid flickering
              });
            }
          });
        }
      }
    }
  }

  window.onload = blockSpoilers;
});
