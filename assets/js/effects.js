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
