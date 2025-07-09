
// Navigation Wrapper background colored on scroll;
const navbar = document.getElementById("navigationWrapper");
  const mediaQuery = window.matchMedia("(min-width: 980px)");

  function handleScroll() {
    if (mediaQuery.matches) {
      if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    } else {
      // On small screens: always remove the class
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);
  mediaQuery.addEventListener("change", handleScroll); // re-check if resized




// Navigation Burger Menu;

var navLinks = document.getElementById("navLinks");

function showMenu(){
    navLinks.style.opacity = "1";
    navLinks.style.pointerEvents = "auto"
}
function hideMenu(){
    navLinks.style.opacity = "0";
    navLinks.style.pointerEvents = "none"
}


