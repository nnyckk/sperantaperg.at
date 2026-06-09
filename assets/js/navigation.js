document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("nav-icon-hamburger");
  const navMenu = document.getElementById("nav-menu");
  const navDesktop = document.getElementById("navigationWrapper");
  const mobileBar = document.getElementById("nav-mobile-bar");
  const hamburgerSlot = document.getElementById("nav-hamburger-slot");
  const backdrop = document.getElementById("nav-backdrop");

  // Dual nav: use mobileBar for active state if present (index.html),
  // otherwise fall back to navDesktop (all other pages)
  const activeTarget = mobileBar || navDesktop;

  function closeMenu() {
    hamburger.classList.remove("open");
    navMenu.classList.remove("active");
    activeTarget.classList.remove("active");
    backdrop.classList.remove("active");
    document.documentElement.classList.remove("no-scroll");
  }

  hamburger.addEventListener("click", function () {
    const isOpen = navMenu.classList.contains("active");
    if (isOpen) {
      closeMenu();
    } else {
      this.classList.add("open");
      navMenu.classList.add("active");
      activeTarget.classList.add("active");
      backdrop.classList.add("active");
      document.documentElement.classList.add("no-scroll");
    }
  });

  backdrop.addEventListener("click", closeMenu);

  // Old nav structure only: close when clicking navBar area outside hamburger/drawer/logo
  if (!mobileBar) {
    const logoLink = navDesktop.querySelector(".logo a");
    activeTarget.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("active") &&
        !hamburger.contains(e.target) &&
        !navMenu.contains(e.target) &&
        !(logoLink && logoLink.contains(e.target))
      ) {
        closeMenu();
      }
    });
    if (logoLink) {
      logoLink.addEventListener("click", function (e) {
        if (navMenu.classList.contains("active")) {
          e.preventDefault();
          closeMenu();
        }
      });
    }
  }

  // Nav shrinks + gets background on scroll
  window.addEventListener("scroll", function () {
    const scrolled = window.scrollY > 80;
    if (navDesktop) navDesktop.classList.toggle("scrolled", scrolled);
    if (mobileBar) mobileBar.classList.toggle("scrolled", scrolled);
    if (hamburgerSlot) hamburgerSlot.classList.toggle("scrolled", scrolled);
  });

  // Inject chevron SVG into dropdown titles
  document.querySelectorAll(".dropdown-title").forEach((title) => {
    const arrow = document.createElement("span");
    arrow.className = "nav-dropdown-arrow";
    arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M480-344 240-584l56.35-56.35L480-457.35l183.65-183 56.35 56.35L480-344Z"/></svg>`;
    title.appendChild(arrow);
  });

  // Active link highlighting
  const links = document.querySelectorAll("nav a");
  const currentPath = window.location.pathname;
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && (href === "/" ? currentPath === "/" : currentPath.includes(href))) {
      link.classList.add("active");
    }
  });
});
