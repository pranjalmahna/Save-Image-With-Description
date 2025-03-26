// background.js

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "saveImageWithDescription",
      title: "Save Image with Description",
      contexts: ["image"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError);
      } else {
        console.log("Context menu created successfully.");
      }
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveImageWithDescription") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getImageDescription,
      args: [info.srcUrl]
    }, (results) => {
      if (results && results[0] && results[0].result) {
        let description = results[0].result;
        let filename = description.replace(/[\/\\?%*:|"<>]/g, '_').trim() || "image";
        filename += ".jpg";
        chrome.downloads.download({
          url: info.srcUrl,
          filename: filename,
          conflictAction: "uniquify"
        });
      }
    });
  }
});

// Function to extract image description from the page.
function getImageDescription(srcUrl) {
  let images = document.querySelectorAll('img');
  for (let img of images) {
    if (img.src === srcUrl || img.currentSrc === srcUrl) {
      let description = '';

      let figure = img.closest('figure');
      if (figure) {
        let figcaption = figure.querySelector('figcaption');
        if (figcaption) {
          description = figcaption.innerText.trim();
        }
      }

      if (!description && img.parentElement) {
        const siblings = Array.from(img.parentElement.children);
        for (let sibling of siblings) {
          if (sibling !== img && sibling.matches('.caption, .image-caption, .description')) {
            description = sibling.innerText.trim();
            if (description) break;
          }
        }
      }

      if (!description) {
        let next = img.nextElementSibling;
        if (next && next.matches('.caption, .image-caption, .description')) {
          description = next.innerText.trim();
        }
      }
      if (!description) {
        let prev = img.previousElementSibling;
        if (prev && prev.matches('.caption, .image-caption, .description')) {
          description = prev.innerText.trim();
        }
      }

      if (!description && img.alt) {
        description = img.alt.trim();
      }

      if (!description && img.title) {
        description = img.title.trim();
      }

      return description || "image";
    }
  }
  return "image";
}