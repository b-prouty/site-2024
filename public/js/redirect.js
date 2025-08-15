// Execute immediately
(async function() {
    // Only run on the root path or index.html
    const isIndexPage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html';
    
    if (!isIndexPage) {
        return;
    }

    // Hide body content immediately
    document.documentElement.style.visibility = 'hidden';

    // Get or create user ID
    const distinctId = getOrCreateUserId();
    
    // Evaluate feature flag
    const flagValue = await evaluateFeatureFlag(distinctId);
    
    // Capture the exposure
    await captureExposure(distinctId, flagValue);
    
    // Redirect based on flag value
    if (flagValue === 'work') {
        window.location.replace('/work.html');
    } else {
        // If we're staying on index, show the content
        document.documentElement.style.visibility = 'visible';
    }
})();
