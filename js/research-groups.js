// Research Groups page functionality
document.addEventListener('DOMContentLoaded', function() {
    initProjectSliders();
    initSmoothScrolling();
    initScrollAnimations();
});

// Initialize project sliders
function initProjectSliders() {
    const sliderSections = document.querySelectorAll('.key-projects');

    sliderSections.forEach(section => {
        const slider = section.querySelector('.projects-slider');
        const slides = section.querySelectorAll('.project-card');
        const dotsContainer = section.querySelector('.slider-dots');
        const controls = section.querySelector('.slider-controls');
        const prevBtn = section.querySelector('.slider-prev');
        const nextBtn = section.querySelector('.slider-next');

        if (!slider || !slides.length) return;

        let currentSlide = 0;
        let slidesPerView = calculateSlidesPerView();
        let maxSlide = Math.max(0, slides.length - slidesPerView);

        function calculateSlidesPerView() {
            const viewportWidth = window.innerWidth;
            if (viewportWidth > 1200) return 3;
            if (viewportWidth > 768) return 2;
            return 1;
        }

        function getStepWidth() {
            const cardRect = slides[0].getBoundingClientRect();
            const styles = window.getComputedStyle(slider);
            const gap = parseFloat(styles.columnGap || styles.gap || '32') || 32;
            return cardRect.width + gap;
        }

        function renderDots() {
            if (!dotsContainer) return;
            const totalPositions = maxSlide + 1;
            if (controls) {
                controls.style.display = totalPositions <= 1 ? 'none' : 'flex';
            }
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPositions; i++) {
                const dot = document.createElement('span');
                dot.className = 'dot' + (i === currentSlide ? ' active' : '');
                dot.setAttribute('role', 'button');
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('aria-label', `Show project slide ${i + 1} of ${totalPositions}`);
                dot.addEventListener('click', () => goToSlide(i));
                dot.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToSlide(i);
                    }
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function updateButtons() {
            if (prevBtn) {
                const atStart = currentSlide <= 0;
                prevBtn.disabled = atStart;
                prevBtn.style.opacity = atStart ? '0.4' : '1';
                prevBtn.style.cursor = atStart ? 'default' : 'pointer';
            }
            if (nextBtn) {
                const atEnd = currentSlide >= maxSlide;
                nextBtn.disabled = atEnd;
                nextBtn.style.opacity = atEnd ? '0.4' : '1';
                nextBtn.style.cursor = atEnd ? 'default' : 'pointer';
            }
        }

        function goToSlide(slideIndex) {
            currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
            const offset = currentSlide * getStepWidth();
            slider.style.transform = `translateX(-${offset}px)`;
            updateDots();
            updateButtons();
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentSlide > 0) goToSlide(currentSlide - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentSlide < maxSlide) goToSlide(currentSlide + 1);
            });
        }

        let touchStartX = 0;
        slider.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slider.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchStartX - touchEndX > swipeThreshold && currentSlide < maxSlide) {
                goToSlide(currentSlide + 1);
            } else if (touchEndX - touchStartX > swipeThreshold && currentSlide > 0) {
                goToSlide(currentSlide - 1);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            slidesPerView = calculateSlidesPerView();
            maxSlide = Math.max(0, slides.length - slidesPerView);
            currentSlide = Math.min(currentSlide, maxSlide);
            renderDots();
            goToSlide(currentSlide);
        });

        renderDots();
        goToSlide(0);
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
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, targetId);
            }
        });
    });

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
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

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
    `;
    document.head.appendChild(style);
}
