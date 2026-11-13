// Milestones grid initialization (responsive CSS grid in css/style.css)
document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => item.classList.add('active'));
});
