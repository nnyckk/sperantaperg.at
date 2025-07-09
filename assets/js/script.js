
// Navigation Wrapper background colored on scroll;
window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navigationWrapper");
    if (window.scrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });








var navLinks = document.getElementById("navLinks");

function showMenu(){
    navLinks.style.opacity = "1";
    navLinks.style.pointerEvents = "auto"
}
function hideMenu(){
    navLinks.style.opacity = "0";
    navLinks.style.pointerEvents = "none"
}


