// Execute immediately
(async function() {
    // Only run on the root path or index.html
    const isIndexPage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html';
    
    if (!isIndexPage) {
        return;
    }

    // Check if this is a direct navigation from within the site
    if (isDirectNavigation()) {
        // If it's a direct navigation, show the page as is
        document.documentElement.style.visibility = 'visible';
        return;
    }

    // Hide body content immediately
    document.documentElement.style.visibility = 'hidden';

    // Check for existing preference
    const existingPreference = getRedirectPreference();
    if (existingPreference === 'work') {
        window.location.replace('/work.html');
        return;
    }

    // If no preference exists, run the A/B test
    const distinctId = getOrCreateUserId();
    const flagValue = await evaluateFeatureFlag(distinctId);
    
    // Capture the exposure
    await captureExposure(distinctId, flagValue);
    
    // Save and act on the preference
    if (flagValue === 'work') {
        saveRedirectPreference('work');
        window.location.replace('/work.html');
    } else {
        saveRedirectPreference('index');
        document.documentElement.style.visibility = 'visible';
    }
})();