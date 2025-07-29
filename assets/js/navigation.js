document.addEventListener("DOMContentLoaded", function () {
  // HAMBURGER NAV-MENU ON OFF;
  const hamburger = document.getElementById("nav-icon-hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navBar = document.getElementById("navigationWrapper");

  hamburger.addEventListener("click", function () {
    this.classList.toggle("open");
    navMenu.classList.toggle("active");
    navBar.classList.toggle("active");
  });

  // NAVIGATION WRAPPER PADDING SHRINK AND BACKGROUND COLOR ON SCROLL;
  const navbar = document.getElementById("navigationWrapper");
  function handleScroll() {
    if (window.scrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", handleScroll);

  // NAVIGATION LINKS COLORED IF ON THE SAME PAGE AS THE LINK;
  const links = document.querySelectorAll("nav a");
  const currentPath = window.location.pathname;

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && currentPath.includes(href)) {
      link.classList.add("active");
    }
  });

  //IF PHONE MENU IS ON, THEN SCROLL OFF;
  document
    .getElementById("nav-icon-hamburger")
    .addEventListener("click", () => {
      document.body.classList.toggle("no-scroll");
    });
});
