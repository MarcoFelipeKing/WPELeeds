// Research Groups page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Project slider functionality
    initProjectSliders();
    
    // Smooth scrolling for group navigation
    initSmoothScrolling();
    
    // Add intersection observers for animations
    initScrollAnimations();
});

// Initialize project sliders
function initProjectSliders() {
    // Get all slider sections
    const sliderSections = document.querySelectorAll('.key-projects');
    
    sliderSections.forEach(section => {
        const slider = section.querySelector('.projects-slider');
        const slides = section.querySelectorAll('.project-card');
        const dots = section.querySelectorAll('.dot');
        const prevBtn = section.querySelector('.slider-prev');
        const nextBtn = section.querySelector('.slider-next');
        
        if (!slider || !slides.length) return;
        
        let currentSlide = 0;
        let slideWidth = slides[0].offsetWidth;
        let slidesPerView = calculateSlidesPerView();
        let maxSlide = Math.max(0, slides.length - slidesPerView);
        
        // Calculate visible slides based on screen width
        function calculateSlidesPerView() {
            const viewportWidth = window.innerWidth;
            if (viewportWidth >= 1200) return 3;
            if (viewportWidth >= 768) return 2;
            return 1;
        }
        
        // Update slide width and slides per view on window resize
        window.addEventListener('resize', () => {
            slideWidth = slides[0].offsetWidth;
            slidesPerView = calculateSlidesPerView();
            maxSlide = Math.max(0, slides.length - slidesPerView);
            goToSlide(Math.min(currentSlide, maxSlide));
        });
        
        // Go to specific slide
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            slider.style.transform = `translateX(-${currentSlide * (slideWidth + 16)}px)`;
            updateDots();
            updateButtons();
        }
        
        // Update active dot
        function updateDots() {
            if (!dots.length) return;
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Update button states
        function updateButtons() {
            if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
            if (nextBtn) nextBtn.style.opacity = currentSlide === maxSlide ? '0.5' : '1';
        }
        
        // Add event listeners to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(Math.min(index, maxSlide));
            });
        });
        
        // Add event listeners to navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentSlide < maxSlide) {
                    goToSlide(currentSlide + 1);
                }
            });
        }
        
        // Initialize slider
        slider.style.transition = 'transform 0.5s ease-in-out';
        updateButtons();
        
        // Optional: Add touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        slider.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold) {
                // Swipe left
                if (currentSlide < maxSlide) {
                    goToSlide(currentSlide + 1);
                }
            } else if (touchEndX - touchStartX > swipeThreshold) {
                // Swipe right
                if (currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                }
            }
        }
    });
}

// Initialize smooth scrolling for group navigation
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.group-nav-item');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get header height for offset
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Handle direct navigation to anchors
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
}

// Initialize scroll animations
function initScrollAnimations() {
    // Animate sections when they come into view
    const sections = document.querySelectorAll('.research-group, .collaborative-research');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        // Add base animation class
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .animate-on-scroll.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .projects-slider {
            transition: transform 0.5s ease-in-out;
        }
    `;
    document.head.appendChild(style);
}
