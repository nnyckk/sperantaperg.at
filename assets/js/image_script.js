
// IMAGE FADE IN EFFECT
function fadeInPeScroll() {
    $('.image-cell').each(function(index) {
      const $this = $(this);
      const topImg = $this.offset().top;
      const bottomWindow = $(window).scrollTop() + $(window).height();

      if (bottomWindow > topImg + 150 && !$this.hasClass('vizibila')) {
        setTimeout(() => {
          $this.addClass('vizibila');
        }, index * 300); // întârziere între imagini
      }
    });
  }

  $(document).ready(function() {
    $(window).on('scroll', fadeInPeScroll);
    fadeInPeScroll(); // apel și la încărcare
  });