// PostHog project API key
const PH_PROJECT_API_KEY = 'phc_oEMOxaQpUpSsiQMkUb0pSZAYOicVbsyBKVOOdULdBeM';
const PH_COOKIE_KEY = `ph_${PH_PROJECT_API_KEY}_posthog`;
const REDIRECT_PREFERENCE_KEY = 'landing_page_preference';

// Function to get or create a user ID
function getOrCreateUserId() {
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

// Function to check if this is a direct navigation to index.html
function isDirectNavigation() {
    // Get the referrer
    const referrer = document.referrer;
    
    // If there's no referrer, it's not a direct navigation
    if (!referrer) return false;
    
    // Parse the referrer URL
    try {
        const referrerUrl = new URL(referrer);
        const currentUrl = new URL(window.location.href);
        
        // If they're from the same domain, it's a direct navigation
        return referrerUrl.hostname === currentUrl.hostname;
    } catch (e) {
        return false;
    }
}

// Function to save redirect preference
function saveRedirectPreference(preference) {
    try {
        localStorage.setItem(REDIRECT_PREFERENCE_KEY, preference);
    } catch (e) {
        console.error('Error saving redirect preference:', e);
    }
}

// Function to get redirect preference
function getRedirectPreference() {
    try {
        return localStorage.getItem(REDIRECT_PREFERENCE_KEY);
    } catch (e) {
        console.error('Error getting redirect preference:', e);
        return null;
    }
}