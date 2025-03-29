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
    
    // Booking button functionality
    const bookButtons = document.querySelectorAll('.book-btn');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lab = this.getAttribute('data-lab');
            alert(`Booking system for ${lab} lab would open here. This would typically link to your institutional booking system.`);
        });
    });
    
    // Tour request functionality
    const tourButtons = document.querySelectorAll('.tour-btn');
    tourButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Tour request form would open here. This would typically send an email to the lab manager or facilities coordinator.');
        });
    });
    
    // Contact form submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const facility = document.getElementById('facility').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, you would send this data to your server
            console.log('Form submission:', { name, email, facility, message });
            
            // Show confirmation message
            alert(`Thank you, ${name}! Your inquiry about the ${facility || 'facilities'} has been submitted. We will contact you at ${email} soon.`);
            
            // Reset form
            this.reset();
        });
    }
});