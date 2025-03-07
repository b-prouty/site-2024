const pageTransition = document.getElementById("pageTransition");
const pageEnter = document.getElementById("pageEnter");
const blue = "#45C5EB";
const purple = "#CB8BD0";
const yellow = "#E2C541";
const red = "#ED6262";

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
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


