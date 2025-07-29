document.addEventListener("DOMContentLoaded", function () {
  // FADEIN EFFECT;
  function fadeInOnScroll() {
    $(".fadeIn").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 100 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 50); // DELAY;
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScroll);
    fadeInOnScroll();
  });

  // FADEIN EFFECT WITH MORE DELAY;
  function fadeInOnScrollDelay() {
    $(".fadeInDelay").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 80 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 500); // DELAY;
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScrollDelay);
    fadeInOnScrollDelay();
  });
});
