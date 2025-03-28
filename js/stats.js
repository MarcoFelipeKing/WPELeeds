// Animated number counters
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // Function to animate counting up
    function animateCounter(el, start, end, duration) {
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            el.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    // IntersectionObserver to start animation when element is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const countTo = parseInt(el.getAttribute('data-count'));
                animateCounter(el, 0, countTo, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all stat numbers
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
});