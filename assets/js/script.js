
// Navigation Wrapper background colored on scroll;
const navbar = document.getElementById("navigationWrapper");
  
  function handleScroll() {
      if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
  }
  window.addEventListener("scroll", handleScroll);




// Navigation Burger Menu;
const navLinks = document.getElementById("navLinks");

function showMenu(){
    navLinks.style.opacity = "1";
    navLinks.style.pointerEvents = "auto"
}
function hideMenu(){
    navLinks.style.opacity = "0";
    navLinks.style.pointerEvents = "none"
}


