document.addEventListener("DOMContentLoaded", function () {
  // FadeIn effect
  function fadeInOnScroll() {
    $(".fadeIn").each(function (index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 100 && !$this.hasClass("visible")) {
        setTimeout(() => {
          $this.addClass("visible");
        }, index * 100); // Delay for the images
      }
    });
  }
  $(document).ready(function () {
    $(window).on("scroll", fadeInOnScroll);
    fadeInOnScroll();
  });
});
