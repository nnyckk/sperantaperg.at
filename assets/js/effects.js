document.addEventListener("DOMContentLoaded", function () {
  // FADEIN EFFECT;
  function fadeInOnScroll() {
    $(".fadeIn").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 130 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 130); // DELAY;
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

      if (bottomWindow > topImg + 75 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 200); // DELAY;
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScrollDelay);
    fadeInOnScrollDelay();
  });
});
