// Hero Image Slider
document.addEventListener('DOMContentLoaded', function() {
    const heroImages = document.querySelectorAll('.hero-image');
    if (heroImages.length <= 1) return;
    
    let currentIndex = 0;
    
    // Set the first image as active initially
    heroImages[0].classList.add('active');
    
    // Function to change the active image
    function rotateImages() {
        // Remove active class from current image
        heroImages[currentIndex].classList.remove('active');
        
        // Increment index and wrap around if needed
        currentIndex = (currentIndex + 1) % heroImages.length;
        
        // Add active class to next image
        heroImages[currentIndex].classList.add('active');
    }
    
    // Set up interval for image rotation (every 5 seconds)
    setInterval(rotateImages, 5000);
});