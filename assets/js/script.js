var navLinks = document.getElementById("navLinks");

function showMenu(){
    navLinks.style.opacity = "1";
    navLinks.style.pointerEvents = "auto"
}
function hideMenu(){
    navLinks.style.opacity = "0";
    navLinks.style.pointerEvents = "none"
}