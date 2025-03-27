// Cake Meetings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Category filtering for meetings
    const categoryBtns = document.querySelectorAll('.category-btn');
    const meetingCards = document.querySelectorAll('.cake-meeting-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Show/hide cards based on filter
            meetingCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else {
                    if (card.getAttribute('data-category') === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Calendar navigation
    const prevMonthBtn = document.querySelector('.calendar-nav button:first-child');
    const nextMonthBtn = document.querySelector('.calendar-nav button:last-child');
    const monthDisplay = document.querySelector('.calendar-nav span');
    
    // Calendar data - in a real implementation, this would come from a database or API
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    let currentMonth = 3; // April (0-indexed)
    let currentYear = 2025;
    
    // Update calendar month display
    function updateMonthDisplay() {
        monthDisplay.textContent = `${months[currentMonth]} ${currentYear}`;
    }
    
    // Navigate to previous month
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateMonthDisplay();
            // In a real implementation, you would also update the calendar grid here
        });
    }
    
    // Navigate to next month
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateMonthDisplay();
            // In a real implementation, you would also update the calendar grid here
        });
    }
    
    // Calendar view options
    const viewSelector = document.querySelector('.calendar-options select');
    if (viewSelector) {
        viewSelector.addEventListener('change', function() {
            // In a real implementation, you would change the calendar view here
            console.log('Calendar view changed to:', this.value);
        });
    }
    
    // Make calendar events clickable
    const calendarEvents = document.querySelectorAll('.day-event');
    calendarEvents.forEach(event => {
        event.addEventListener('click', function() {
            // In a real implementation, this would show event details or link to the event page
            alert('Event details: ' + this.textContent);
        });
    });
});
