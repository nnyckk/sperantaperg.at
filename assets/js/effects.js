document.addEventListener("DOMContentLoaded", function () {
  // FadeIn effect normal
  function fadeInOnScroll() {
    $(".fadeIn").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 100 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 50); // Delay for the images
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScroll);
    fadeInOnScroll();
  });

  // FadeIn effect delay
  function fadeInOnScrollDelay() {
    $(".fadeInDelay").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 200 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 500); // Delay for the images
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScrollDelay);
    fadeInOnScrollDelay();
  });
});

//Ce-Credem Page, tap on card to show overlay on mobile
document.addEventListener("DOMContentLoaded", function () {
  window.toggleOverlay = function (card) {
    document.querySelectorAll(".vision-card").forEach((el) => {
      if (el !== card) el.classList.remove("active");
    });
    card.classList.toggle("active");
  };
});

//Accordion
const accordionItems = document.querySelectorAll(".accordion-item");
accordionItems.forEach((item) => {
  const title = item.querySelector(".accordion-title");
  const content = item.querySelector(".accordion-content");

  title.addEventListener("click", () => {
    const isOpen = item.classList.contains("active");

    // Close
    accordionItems.forEach((i) => {
      i.classList.remove("active");
      i.querySelector(".accordion-content").style.maxHeight = null;
    });

    // Open if it is closed
    if (!isOpen) {
      item.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accordion-item.active").forEach((item) => {
    const content = item.querySelector(".accordion-content");
    content.style.maxHeight = content.scrollHeight + "px";
  });
});
