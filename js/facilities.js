// Facilities page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Lab navigation
    const navItems = document.querySelectorAll('.facility-nav-item');
    const labDetails = document.querySelectorAll('.lab-detail');
    
    // Set first lab as active initially
    if (navItems.length > 0) {
        navItems[0].classList.add('active');
    }
    
    // Add click event listeners
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get target lab
            const targetLab = this.getAttribute('data-target');
            
            // Update active class on nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target lab, hide others
            labDetails.forEach(lab => {
                if (lab.id === targetLab) {
                    lab.style.display = 'block';
                    // Smooth scroll to lab details
                    lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    lab.style.display = 'none';
                }
            });
        });
    });
    
    // Gallery image change functionality
    window.changeImage = function(labId, imageSrc) {
        // Update main image
        const mainImage = document.getElementById(`${labId}-main-image`);
        if (mainImage) {
            mainImage.src = `images/facilities/${imageSrc}`;
        }
        
        // Update active thumbnail
        const thumbnails = document.querySelectorAll(`#${labId} .gallery-thumbs img`);
        thumbnails.forEach(thumb => {
            if (thumb.getAttribute('onclick').includes(imageSrc)) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    };
    
});