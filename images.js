// Get keywords from storage and analyze images and videos for spoilers
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
              }
          });
      });
  });
}

// Analyze videos for spoilers and skip if keywords are found
function analyzeVideosForSpoilers() {
  chrome.storage.sync.get({ keywords: [] }, function(data) {
      const keywords = data.keywords.map(item => item.keyword.toLowerCase());
      const skipDuration = 10; // Number of seconds to skip forward

      const videos = document.getElementsByTagName('video');
      Array.from(videos).forEach(video => {
          // Check video metadata or subtitles for keywords
          video.addEventListener('loadedmetadata', () => {
              const track = video.textTracks[0]; // Assuming first text track for subtitles
              if (track && track.cues) {
                  Array.from(track.cues).forEach(cue => {
                      const subtitleText = cue.text.toLowerCase();
                      keywords.forEach(keyword => {
                          if (subtitleText.includes(keyword)) {
                              // Blur and skip the video forward
                              video.style.filter = "blur(5px)";
                              video.setAttribute("data-blurred", "true");
                              
                              // Skip the video ahead by the specified duration
                              if (video.currentTime + skipDuration < video.duration) {
                                  video.currentTime += skipDuration;
                              } else {
                                  video.currentTime = video.duration; // Jump to the end if near the end
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

// Function to check storage and apply blur/skip if needed
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

// Initial check and apply blur/skip if necessary
checkAndApplyBlur();
