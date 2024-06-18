const pageTransition = document.getElementById("pageTransition");
const pageEnter = document.getElementById("pageEnter");
const blue = "#45C5EB";
const purple = "#CB8BD0";
const yellow = "#E2C541";
const red = "#ED6262";

function enterPage(){
    pageEnter.classList.add('trans-down');
}

function pageTrans(color, href){
    pageTransition.style.backgroundColor = color;
    pageTransition.classList.add('trans-up');

    setTimeout(() => {
        window.location.href = href + ".html";
    }, 1000);
   
}

window.onload = function() {
    setTimeout(() => {
        enterPage();
    }, 1000);
};

