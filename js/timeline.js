// Timeline functionality
document.addEventListener('DOMContentLoaded', function() {
    const timelineTrack = document.querySelector('.timeline-track');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const prevBtn = document.querySelector('.timeline-arrow.prev');
    const nextBtn = document.querySelector('.timeline-arrow.next');
    const progressBar = document.querySelector('.timeline-progress-bar');
    
    if (!timelineTrack || !timelineItems.length) return;
    
    let currentIndex = 0;
    const itemWidth = timelineItems[0].offsetWidth;
    const trackWidth = itemWidth * timelineItems.length;
    const containerWidth = document.querySelector('.timeline-wrapper').offsetWidth;
    
    // Set initial state
    timelineTrack.style.width = `${trackWidth}px`;
    updateActiveItem();
    updateArrowState();
    updateProgressBar();
    
    // Set up click events for dots
    timelineItems.forEach((item, index) => {
        const dot = item.querySelector('.timeline-dot');
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateTrackPosition();
            updateActiveItem();
            updateArrowState();
            updateProgressBar();
        });
    });
    
    // Previous button functionality
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateTrackPosition();
            updateActiveItem();
            updateArrowState();
            updateProgressBar();
        }
    });
    
    // Next button functionality
    nextBtn.addEventListener('click', () => {
        if (currentIndex < timelineItems.length - 1) {
            currentIndex++;
            updateTrackPosition();
            updateActiveItem();
            updateArrowState();
            updateProgressBar();
        }
    });
    
    // Update track position
    function updateTrackPosition() {
        const translateX = Math.min(
            currentIndex * itemWidth, 
            trackWidth - containerWidth
        );
        timelineTrack.style.transform = `translateX(-${translateX}px)`;
    }
    
    // Update active item
    function updateActiveItem() {
        timelineItems.forEach(item => item.classList.remove('active'));
        timelineItems[currentIndex].classList.add('active');
    }
    
    // Update arrow state
    function updateArrowState() {
        prevBtn.classList.toggle('disabled', currentIndex === 0);
        nextBtn.classList.toggle('disabled', currentIndex === timelineItems.length - 1);
    }
    
    // Update progress bar
    function updateProgressBar() {
        const progress = ((currentIndex + 1) / timelineItems.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newItemWidth = timelineItems[0].offsetWidth;
        const newContainerWidth = document.querySelector('.timeline-wrapper').offsetWidth;
        
        // Update track width
        const newTrackWidth = newItemWidth * timelineItems.length;
        timelineTrack.style.width = `${newTrackWidth}px`;
        
        // Update position
        updateTrackPosition();
    });
});