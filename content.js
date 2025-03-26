// content.js

// MutationObserver to detect dynamically added nodes (including images)
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        // Check if the added node is an image
        if (node.tagName === 'IMG') {
          console.log('New image added:', node.src);
        } else if (node.querySelectorAll) {
          // Or if the node contains images
          const imgs = node.querySelectorAll('img');
          imgs.forEach(img => {
            console.log('New image added from subtree:', img.src);
          });
        }
      });
    }
  });
});

// Start observing the document body for changes.
observer.observe(document.body, { childList: true, subtree: true });