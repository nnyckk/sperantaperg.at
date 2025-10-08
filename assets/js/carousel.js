// Carousel Functionality
document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector(".carousel-track");
    const slides = document.querySelectorAll(".carousel-slide");
    const prevButton = document.querySelector(".carousel-btn-prev");
    const nextButton = document.querySelector(".carousel-btn-next");
    const dots = document.querySelectorAll(".carousel-dot");
  
    // Configuration
    const CLONES_COUNT = 3;
    const TOTAL_REAL_SLIDES = slides.length - (CLONES_COUNT * 2);
    
    let currentIndex = 0;
    let isTransitioning = false;
  
    // Get slide width based on screen size
    function getSlideWidth() {
      const width = window.innerWidth;
      if (width <= 600) return 90;
      if (width <= 1024) return 90;
      return 48; // Desktop: 2 full slides + small hint of 3rd
    }
  
    // Move to position (with or without animation)
    function moveToPosition(index, animate = true) {
      const slideWidth = getSlideWidth();
      const position = (index + CLONES_COUNT) * slideWidth;
      
      track.style.transition = animate ? "transform 0.5s ease-in-out" : "none";
      track.style.transform = `translateX(-${position}%)`;
      
      // Force reflow if no animation
      if (!animate) {
        void track.offsetHeight;
      }
    }
  
    // Update active dot
    function updateDots() {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }
  
    // Handle infinite loop wrap-around
    function handleLoopWrap() {
      if (currentIndex >= TOTAL_REAL_SLIDES) {
        currentIndex = 0;
        moveToPosition(currentIndex, false);
        updateDots();
      } else if (currentIndex < 0) {
        currentIndex = TOTAL_REAL_SLIDES - 1;
        moveToPosition(currentIndex, false);
        updateDots();
      }
      isTransitioning = false;
    }
  
    // Safety timeout to reset isTransitioning in case transitionend doesn't fire
    let transitionTimeout;
    function safeTransition() {
      clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
        isTransitioning = false;
      }, 600); // Slightly longer than transition duration (500ms)
    }
  
    // Initialize position
    moveToPosition(currentIndex, false);
    updateDots();
  
    // Navigation functions
    function goToSlide(index) {
      if (isTransitioning || index === currentIndex) {
        return; // Don't do anything if already on this slide
      }
      isTransitioning = true;
      currentIndex = index;
      moveToPosition(currentIndex, true);
      updateDots();
      safeTransition(); // Safety fallback
    }
  
    function nextSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex++;
      moveToPosition(currentIndex, true);
      updateDots();
      safeTransition(); // Safety fallback
    }
  
    function prevSlide() {
      if (isTransitioning) return;
      isTransitioning = true;
      currentIndex--;
      moveToPosition(currentIndex, true);
      updateDots();
      safeTransition(); // Safety fallback
    }
  
    // Event listeners
    track.addEventListener("transitionend", handleLoopWrap);
    
    nextButton.addEventListener("click", nextSlide);
    prevButton.addEventListener("click", prevSlide);
  
    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        const slideIndex = parseInt(this.getAttribute("data-slide"));
        goToSlide(slideIndex);
      });
    });
  
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
  
    track.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
    });
  
    track.addEventListener("touchmove", (e) => {
      touchEndX = e.touches[0].clientX;
    });
  
    track.addEventListener("touchend", () => {
      const swipeDistance = touchStartX - touchEndX;
      
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });
  
    // Handle window resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        moveToPosition(currentIndex, false);
      }, 100);
    });
  });