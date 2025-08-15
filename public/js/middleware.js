// PostHog project API key
const PH_PROJECT_API_KEY = 'phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM';
const PH_COOKIE_KEY = `ph_${PH_PROJECT_API_KEY}_posthog`;

// Function to get or create a user ID
async function getOrCreateUserId() {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith(PH_COOKIE_KEY + '='));
    
    if (cookie) {
        try {
            const cookieValue = decodeURIComponent(cookie.split('=')[1]);
            const cookieData = JSON.parse(cookieValue);
            return cookieData.distinct_id;
        } catch (e) {
            console.error('Error parsing cookie:', e);
        }
    }
    
    // If no valid cookie found, create new UUID
    return crypto.randomUUID();
}

// Function to evaluate feature flag
async function evaluateFeatureFlag(distinctId) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: PH_PROJECT_API_KEY,
            distinct_id: distinctId
        })
    };

    try {
        const response = await fetch('https://us.i.posthog.com/decide?v=2', requestOptions);
        const data = await response.json();
        return data.featureFlags['landing-page-test'];
    } catch (e) {
        console.error('Error evaluating feature flag:', e);
        return null;
    }
}

// Function to capture feature flag exposure
async function captureExposure(distinctId, flagValue) {
    const eventOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: PH_PROJECT_API_KEY,
            distinct_id: distinctId,
            event: '$feature_flag_called',
            properties: {
                $feature_flag: 'landing-page-test',
                $feature_flag_response: flagValue
            }
        })
    };

    try {
        await fetch('https://us.i.posthog.com/capture', eventOptions);
    } catch (e) {
        console.error('Error capturing exposure:', e);
    }
}

// Main redirect function
async function handleRedirect() {
    // Only run on the root path
    if (window.location.pathname !== '/') {
        return;
    }

    const distinctId = await getOrCreateUserId();
    const flagValue = await evaluateFeatureFlag(distinctId);

    // Capture the exposure
    await captureExposure(distinctId, flagValue);

    // Redirect based on flag value
    if (flagValue === 'work') {
        window.location.href = '/work.html';
    } else if (flagValue === 'index') {
        window.location.href = '/index.html';
    }
}

// Run the redirect logic when the page loads
window.addEventListener('load', handleRedirect);
