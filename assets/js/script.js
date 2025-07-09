document.addEventListener("DOMContentLoaded", function () {
    // Hamburger Menu Effect;
    const hamburger = document.getElementById("nav-icon-hamburger");
    const navMenu = document.getElementById("nav-menu");
    const navBar = document.getElementById("navigationWrapper");

    hamburger.addEventListener("click", function () {
      this.classList.toggle("open");
      navMenu.classList.toggle("active");
      navBar.classList.toggle("active");
    });


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


// Active Link On URL Effects;
const links = document.querySelectorAll("nav a");
const currentPath = window.location.pathname;

  links.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
  });