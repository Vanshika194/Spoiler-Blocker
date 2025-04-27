// Get keywords from storage and analyze images for spoilers
function analyzeImagesForSpoilers() {
    chrome.storage.sync.get({ keywords: [] }, function(data) {
        const keywords = data.keywords.map(item => item.keyword.toLowerCase());
  
        const images = document.getElementsByTagName('img');
        Array.from(images).forEach(image => {
            const altText = image.alt.toLowerCase();
            keywords.forEach(keyword => {
                if (altText.includes(keyword)) {
                    image.style.filter = "blur(5px)";
                    image.setAttribute("data-blurred", "true");
  
                    chrome.storage.local.set({ blurredText: altText });

                    // Add click event to gather feedback from the user
                    image.addEventListener('click', function() {
                        // Ask the user if the content is a spoiler
                        const isSpoiler = confirm(`Is this a spoiler? \n\n${altText}`);

                        fetch('http://127.0.0.1:8000/feedback', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                text: altText,
                                label: isSpoiler ? 1 : 0, 
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            console.log('Feedback submitted:', data);
                        })
                        .catch(error => {
                            console.error('Error in submitting feedback:', error);
                        });
                    });
                }
            });
        });
    });
}
document.querySelectorAll('img[data-blurred="true"]').forEach(image => {
    image.addEventListener('click', function() {
      const blurredText = image.alt;
      
      // Ask the user if the content is a spoiler
      const isSpoiler = confirm(`Is this a spoiler? \n\n${blurredText}`);
  
      // Send feedback to the FastAPI server
      fetch('http://127.0.0.1:8000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: blurredText,
          label: isSpoiler ? 1 : 0, // 1 for spoiler, 0 for non-spoiler
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Feedback submitted:', data);
      })
      .catch(error => {
        console.error('Error in submitting feedback:', error);
      });
    });
  });
  
// Analyze videos for spoilers and skip if keywords are found
function analyzeVideosForSpoilers() {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
      const keywords = data.keywords.map(item => item.keyword.toLowerCase());
      const skipDuration = 10; 

      const videos = document.getElementsByTagName('video');
      Array.from(videos).forEach(video => {
          video.addEventListener('loadedmetadata', () => {
              const track = video.textTracks[0]; // Assuming first text track for subtitles
              if (track && track.cues) {
                  Array.from(track.cues).forEach(cue => {
                      const subtitleText = cue.text.toLowerCase();
                      keywords.forEach(keyword => {
                          if (subtitleText.includes(keyword)) {
                              video.style.filter = "blur(5px)";
                              video.setAttribute("data-blurred", "true");
                              
                              if (video.currentTime + skipDuration < video.duration) {
                                  video.currentTime += skipDuration;
                              } else {
                                  video.currentTime = video.duration; 
                              }
                          }
                      });
                  });
              }
          });
      });
  });
}

// Clear blurs on images and videos
function clearBlurs() {
  const images = document.querySelectorAll('img[data-blurred="true"]');
  images.forEach(image => {
      image.style.filter = 'none';
      image.removeAttribute('data-blurred');
  });

  const videos = document.querySelectorAll('video[data-blurred="true"]');
  videos.forEach(video => {
      video.style.filter = 'none';
      video.removeAttribute('data-blurred');
  });
}


function checkAndApplyBlur() {
  chrome.storage.sync.get(['blockImages', 'blockVideos'], (data) => {
      if (data.blockImages) {
          analyzeImagesForSpoilers();
      }
      if (data.blockVideos) {
          analyzeVideosForSpoilers();
      }
      if (!data.blockImages && !data.blockVideos) {
          clearBlurs();
      }
  });
}

// Listen for storage changes to dynamically apply or clear blur/skip
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && ('blockImages' in changes || 'blockVideos' in changes)) {
      checkAndApplyBlur();
  }
});

checkAndApplyBlur();
