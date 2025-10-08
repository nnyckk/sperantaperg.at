// Carousel Functionality
document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".carousel-track");
    const slides = document.querySelectorAll(".carousel-slide");
    const prevButton = document.querySelector(".carousel-btn-prev");
    const nextButton = document.querySelector(".carousel-btn-next");
    const dots = document.querySelectorAll(".carousel-dot");
  
    // We have 3 clones at start and 3 at end
    const clonesAtStart = 3;
    const clonesAtEnd = 3;
    const totalSlides = slides.length - clonesAtStart - clonesAtEnd; // Real slides only
    let currentIndex = 0;
    let isTransitioning = false;
  
    // Get slide width percentage based on screen size
    function getSlideWidth() {
      if (window.innerWidth <= 600) return 90; // Mobile: 90% = shows full image + 5% peek of next
      if (window.innerWidth <= 1024) return 85; // Tablet: 85% = shows full image + 10% peek
      return 45; // Desktop: 2 full slides (90%) + 10% of third
    }
  
    // Set initial position (start at first real slide, which is after the clones)
    function setInitialPosition() {
      const slideWidth = getSlideWidth();
      // Start at position after the 3 clones
      const position = clonesAtStart * slideWidth;
      track.style.transform = `translateX(-${position}%)`;
      track.style.transition = "none";
    }
  
    setInitialPosition();
  
    // Update carousel position
    function updateCarousel(useTransition = true) {
      const slideWidth = getSlideWidth();
  
      if (!useTransition) {
        track.style.transition = "none";
        // Force reflow to ensure the no-transition is applied
        void track.offsetHeight;
      } else {
        track.style.transition = "transform 0.5s ease-in-out";
      }
  
      // Position calculation: (currentIndex + clonesAtStart) to account for clones at the beginning
      const position = (currentIndex + clonesAtStart) * slideWidth;
      track.style.transform = `translateX(-${position}%)`;
  
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }
  
    // Handle the infinite loop jump
    track.addEventListener("transitionend", () => {
      // If we're past the last real slide (showing clones at end)
      if (currentIndex >= totalSlides) {
        track.style.transition = "none";
        currentIndex = 0;
        const slideWidth = getSlideWidth();
        const position = (currentIndex + clonesAtStart) * slideWidth;
        track.style.transform = `translateX(-${position}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
          dot.classList.toggle("active", index === currentIndex);
        });
        
        // Force reflow
        void track.offsetHeight;
      }
  
      // If we're before the first real slide (showing clones at start)
      if (currentIndex < 0) {
        track.style.transition = "none";
        currentIndex = totalSlides - 1;
        const slideWidth = getSlideWidth();
        const position = (currentIndex + clonesAtStart) * slideWidth;
        track.style.transform = `translateX(-${position}%)`;
        
        // Update dots
        dots.forEach((dot, index) => {
          dot.classList.toggle("active", index === currentIndex);
        });
        
        // Force reflow
        void track.offsetHeight;
      }
  
      isTransitioning = false;
    });
  
    // Go to specific slide (from dot click)
    function goToSlide(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex = index;
      updateCarousel(true);
    }
  
    // Next slide
    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      updateCarousel(true);
    }
  
    // Previous slide
    function prevSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex--;
      updateCarousel(true);
    }
  
    // Button event listeners
    nextButton.addEventListener("click", nextSlide);
    prevButton.addEventListener("click", prevSlide);
  
    // Dot event listeners
    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        const slideIndex = parseInt(this.getAttribute("data-slide"));
        goToSlide(slideIndex);
      });
    });
  
  
    // Handle window resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Recalculate position on resize without transition
        const slideWidth = getSlideWidth();
        const position = (currentIndex + clonesAtStart) * slideWidth;
        track.style.transition = "none";
        track.style.transform = `translateX(-${position}%)`;
        void track.offsetHeight;
      }, 250);
    });
  });