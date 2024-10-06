chrome.storage.sync.get({ keywords: [] }, function(data) {
  const keywords = data.keywords;

  // Function to show the "View" button on hover
  function showViewOption(element) {
    hideViewOption(); // Ensure any existing button is removed

    // Create the "View" button
    let viewButton = document.createElement('button');
    viewButton.style.position = "absolute"; // Keep it relative to the element position
    viewButton.style.zIndex = 1000;
    viewButton.style.padding = "10px 15px"; // More padding for a larger button
    viewButton.style.backgroundColor = "#FF5722"; // Bright orange background for high visibility
    viewButton.style.color = "#ffffff"; // White text
    viewButton.style.border = "2px solid #ffffff"; // White border for contrast
    viewButton.style.cursor = "pointer"; // Pointer cursor
    viewButton.style.borderRadius = "5px"; // Slightly rounded corners
    viewButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Add a subtle shadow
    viewButton.style.fontSize = "16px"; // Slightly larger font size for better visibility
    viewButton.style.fontWeight = "bold"; // Bold text for better visibility
    viewButton.style.opacity = "0.9"; // Slight transparency for a softer look

    // Position the button closer to the element
    let rect = element.getBoundingClientRect();
    viewButton.style.top = `${rect.top + window.scrollY + 5}px`; // Slightly closer to the element
    viewButton.style.left = `${rect.left + window.scrollX + rect.width - 70}px`; // Closer to the edge of the element

    // Append the button to the document body
    document.body.appendChild(viewButton);

    // Add hover effect for the button
    viewButton.addEventListener('mouseenter', function() {
      viewButton.style.backgroundColor = "#FF7043"; // Darker orange on hover
      viewButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
    });

    viewButton.addEventListener('mouseleave', function() {
      viewButton.style.backgroundColor = "#FF5722"; // Reset background color
      viewButton.style.transform = "scale(1)"; // Reset size
    });

    // Add click event to unblur the content and remove the button
    viewButton.onclick = function() {
      element.style.filter = "none"; // Unblur the content
      element.setAttribute("data-blurred", "false"); // Mark as unblurred
      hideViewOption(); // Remove the button after unblurring
    };
  }

  // Function to hide the "View" button
  function hideViewOption() {
    const existingButton = document.querySelector('button'); // Select any existing button
    if (existingButton && existingButton.parentNode) {
      existingButton.parentNode.removeChild(existingButton); // Remove the button if it exists
    }
  }

  function blockSpoilers() {
    let elements = document.body.getElementsByTagName('*');

    for (let element of elements) {
      for (let node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          let textContent = node.textContent.toLowerCase();
          
          keywords.forEach(keyword => {
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
