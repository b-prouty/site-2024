const pageTransition = document.getElementById("pageTransition");
const pageEnter = document.getElementById("pageEnter");
const blue = "#45C5EB";
const purple = "#CB8BD0";
const yellow = "#E2C541";
const red = "#ED6262";

// Function to include HTML components
async function includeHTML() {
    const elements = document.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const file = element.getAttribute("include-html");
        if (file) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const html = await response.text();
                    element.innerHTML = html;
                } else {
                    element.innerHTML = "Page not found.";
                }
            } catch (error) {
                console.error("Error loading the HTML file:", error);
                element.innerHTML = "Error loading the page.";
            }
            element.removeAttribute("include-html");
        }
    }
}

// function enterPage() {
//     pageEnter.classList.add('trans-down');
    
// }

// function pageTrans(color, href) {
//     pageTransition.style.backgroundColor = color;
//     pageTransition.classList.add('trans-up');

//     setTimeout(() => {
//         window.location.href = href.toLowerCase() + ".html";
//     }, 1000);

// }

window.onpageshow = function () {
    includeHTML();
    AOS.init();
    window.scrollTo(0, 0);

    // if(pageTransition.classList.contains('trans-up')){
    //     // console.log('should be working')
    //     pageTransition.classList.remove('trans-up');
    // } else {
    //     // console.log('nope')
    // }

    // setTimeout(() => {
    //     enterPage();
    //     const body = document.body;
    //     body.style.height = 'initial';
    //     body.style.overflowX = 'hidden';
    //     body.style.overflowY = 'scroll';
    // }, 1000);
};

// Function to initialize hamburger menu functionality
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
            // Prevent scrolling when menu is open
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
    }
}

// Function to set the active nav item based on current page
function setActiveNavItem() {
    const path = (window.location.pathname || '').toLowerCase();
    const file = path.split('/').pop() || 'index.html';

    let activeKey = '';
    if (file === 'index.html' || file === '') {
        activeKey = 'work';
    } else if (file === 'ai.html') {
        activeKey = 'ai';
    } else if (file === 'resume.html') {
        activeKey = 'resume';
    }

    if (!activeKey) return;

    const navLinks = document.querySelectorAll('.ai-nav-group a.nav-item');
    navLinks.forEach((link) => {
        if (link.classList.contains(activeKey)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Create a MutationObserver to watch for the navigation being added to the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            // Check if the navigation has been added
            if (document.querySelector('.ai-nav')) {
                initializeHamburgerMenu();
                setActiveNavItem();
                // Once we've initialized the menu, we can disconnect the observer
                observer.disconnect();
            }
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });

// Also try to initialize immediately in case the nav is already loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeHamburgerMenu();
    setActiveNavItem();
});


// Custom hover cursor for work cards: "See case study"
document.addEventListener('DOMContentLoaded', () => {
    const cursorEl = document.createElement('div');
    cursorEl.className = 'custom-card-cursor';
    cursorEl.textContent = 'View Work +';
    document.body.appendChild(cursorEl);

    let active = false;
    let currentCard = null;

    function getCardTitle(card) {
        if (!card) return '';
        const titleEl = card.querySelector('h2');
        const title = titleEl ? titleEl.textContent.trim() : '';
        return title || '';
    }

    function showCursor() {
        active = true;
        cursorEl.classList.add('visible');
    }

    function hideCursor() {
        active = false;
        cursorEl.classList.remove('visible');
    }

    function moveCursor(event) {
        if (!active) return;
        const x = event.clientX;
        const y = event.clientY;
        cursorEl.style.left = x + 'px';
        cursorEl.style.top = y + 'px';
    }

    // Delegate events for all current/future .card elements
    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.work-cards .card');
        if (card) {
            currentCard = card;
            const name = getCardTitle(card);
            cursorEl.textContent = name ? `${name} - View Work +` : 'View Work +';
            showCursor();
        }
    });

    document.addEventListener('mouseout', (e) => {
        const leaving = e.target.closest('.work-cards .card');
        const movingTo = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.work-cards .card') : null;
        if (leaving && !movingTo) {
            currentCard = null;
            hideCursor();
        }
    });

    document.addEventListener('mousemove', (event) => {
        // Keep updating position
        moveCursor(event);
        // If moving across different cards, update title accordingly
        const card = event.target.closest && event.target.closest('.work-cards .card');
        if (card && card !== currentCard) {
            currentCard = card;
            const name = getCardTitle(card);
            cursorEl.textContent = name ? `${name} - View Work +` : 'View Work +';
            showCursor();
        }
    });

    // Hide on page blur just in case
    window.addEventListener('blur', hideCursor);
});


// Lightbox for project cards (images and videos)
document.addEventListener('DOMContentLoaded', () => {
    // Create lightbox overlay once
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-prev" aria-label="Previous" tabindex="0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
        <div class="lightbox-stage" role="dialog" aria-modal="true"></div>
        <button class="lightbox-next" aria-label="Next" tabindex="0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;

    document.body.appendChild(overlay);

    const stage = overlay.querySelector('.lightbox-stage');
    const btnClose = overlay.querySelector('.lightbox-close');
    const btnPrev = overlay.querySelector('.lightbox-prev');
    const btnNext = overlay.querySelector('.lightbox-next');

    let currentItems = [];
    let currentIndex = 0;

    function extractItemFromCard(card) {
        if (!card) return null;
        // Prefer explicit image tag if present
        const img = card.querySelector('img');
        if (img && img.getAttribute('src')) {
            return { type: 'image', src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' };
        }
        // Otherwise check for a video
        const video = card.querySelector('video');
        if (video) {
            // Try <source>, else use video src
            const sourceEl = video.querySelector('source');
            const src = (sourceEl && sourceEl.getAttribute('src')) || video.getAttribute('src');
            if (src) {
                return { type: 'video', src };
            }
        }
        return null;
    }

    function buildGroupFromContainer(container) {
        const cards = Array.from(container.querySelectorAll('.card.project-card'));
        const items = cards
            .map(card => extractItemFromCard(card))
            .map((item, idx) => item ? { ...item, _cardIndex: idx } : null)
            .filter(Boolean);
        return { cards, items };
    }

    function renderItem(item) {
        stage.innerHTML = '';
        if (!item) return;
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.className = 'lightbox-media';
            img.src = item.src;
            if (item.alt) img.alt = item.alt;
            stage.appendChild(img);
        } else if (item.type === 'video') {
            const video = document.createElement('video');
            video.className = 'lightbox-media';
            video.src = item.src;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            video.playsInline = true;
            stage.appendChild(video);
        }
    }

    function openLightbox(items, startIndex) {
        if (!items || items.length === 0) return;
        currentItems = items;
        currentIndex = Math.max(0, Math.min(startIndex, items.length - 1));
        renderItem(currentItems[currentIndex]);
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        overlay.classList.remove('open');
        stage.innerHTML = '';
        document.body.style.overflow = '';
    }

    function showNext(delta) {
        if (!currentItems.length) return;
        const len = currentItems.length;
        currentIndex = (currentIndex + delta + len) % len;
        renderItem(currentItems[currentIndex]);
    }

    btnClose.addEventListener('click', closeLightbox);
    btnNext.addEventListener('click', () => showNext(1));
    btnPrev.addEventListener('click', () => showNext(-1));

    // Close on backdrop click only (not when clicking the stage content)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeLightbox();
        }
    });

    // Delegate clicks from any .project-cards container
    document.addEventListener('click', (e) => {
        const card = e.target.closest && e.target.closest('.project-cards .card.project-card');
        if (!card) return;

        // Find the parent .project-cards
        const container = card.closest('.project-cards');
        if (!container) return;

        // Build the grouped media list
        const { cards, items } = buildGroupFromContainer(container);

        // Determine clicked index among valid items
        const clickedCardIndex = Array.from(cards).indexOf(card);
        const clickedItemIndex = items.findIndex(it => it._cardIndex === clickedCardIndex);
        if (clickedItemIndex === -1) return; // no media in this card

        openLightbox(items, clickedItemIndex);
    });
});

