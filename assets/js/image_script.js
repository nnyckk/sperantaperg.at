
// Image fade in effect
function fadeInOnScroll() {
    $('.image-cell-fadeIn').each(function(index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 150 && !$this.hasClass('visible')) {
        setTimeout(() => {
          $this.addClass('visible');
        }, index * 300); // Deley for the images
      }
    });
  }

  $(document).ready(function() {
    $(window).on('scroll', fadeInOnScroll);
    fadeInOnScroll();
  });