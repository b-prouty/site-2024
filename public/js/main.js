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

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        // Prevent scrolling when menu is open
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
});


