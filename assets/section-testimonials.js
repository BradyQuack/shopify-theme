  function initTestimonialCarousel(track) {
    const sectionId = track.id.replace('carousel-track-', '');
    const prevBtn = document.getElementById('prev-btn-' + sectionId);
    const nextBtn = document.getElementById('next-btn-' + sectionId);
    const dotsContainer = document.getElementById('dots-' + sectionId);

    if (!prevBtn || !nextBtn || !dotsContainer) return;
    
    const cards = track.querySelectorAll('.testimonial__card');
    const dots = dotsContainer.querySelectorAll('.testimonial__dot');
    
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function getCardsPerView() {
      const width = window.innerWidth;
      if (width > 1024) return 3;
      if (width > 768) return 2;
      return 1;
    }

    function isCarouselActive() {
      return window.innerWidth <= 1024;
    }

    function updateCarousel() {
      if (!isCarouselActive()) {
        track.style.transform = '';
        return;
      }

      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(0, cards.length - cardsPerView);
      
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      
      const cardWidth = cards[0].offsetWidth;
      const gap = cardsPerView === 1 ? 0 : 20;
      const offset = currentIndex * (cardWidth + gap);
      
      track.style.transform = `translateX(-${offset}px)`;
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('testimonial__dot--active', index === currentIndex);
      });
      
      // Update button states
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    function goToSlide(index) {
      if (!isCarouselActive()) return;
      
      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(0, cards.length - cardsPerView);
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    }

    // Button navigation
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Dot navigation
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        goToSlide(index);
      });
    });

    // Touch/swipe support
    track.addEventListener('touchstart', (e) => {
      if (!isCarouselActive()) return;
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.transition = 'none';
    });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging || !isCarouselActive()) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      currentTranslate = prevTranslate + diff;
    });

    track.addEventListener('touchend', () => {
      if (!isCarouselActive()) return;
      isDragging = false;
      track.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      
      const movedBy = currentTranslate - prevTranslate;
      
      if (movedBy < -50 && currentIndex < cards.length - getCardsPerView()) {
        goToSlide(currentIndex + 1);
      } else if (movedBy > 50 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      } else {
        updateCarousel();
      }
      
      prevTranslate = currentTranslate;
    });

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel();
      }, 250);
    });

    // Initialize
    updateCarousel();
  }

  document.querySelectorAll('[id^="carousel-track-"]').forEach(initTestimonialCarousel);
