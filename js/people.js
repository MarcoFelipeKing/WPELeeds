// People page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const personCards = document.querySelectorAll('.person-card');
    const roleFilterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const groupFilterBtns = document.querySelectorAll('.filter-btn[data-group]');
    const searchInput = document.getElementById('people-search');
    const searchBtn = document.querySelector('.search-btn');
    
    // Current filter state
    let currentRoleFilter = 'all';
    let currentGroupFilter = 'all';
    let currentSearchQuery = '';
    
    // Role filter functionality
    roleFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all role filter buttons
            roleFilterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current role filter
            currentRoleFilter = this.getAttribute('data-filter');
            
            // Apply filters
            applyFilters();
        });
    });
    
    // Group filter functionality
    groupFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all group filter buttons
            groupFilterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current group filter
            currentGroupFilter = this.getAttribute('data-group');
            
            // Apply filters
            applyFilters();
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', function() {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        applyFilters();
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            currentSearchQuery = searchInput.value.toLowerCase().trim();
            applyFilters();
        }
    });
    
    // Clear search when input is cleared
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            currentSearchQuery = '';
            applyFilters();
        }
    });
    
    // Filter application logic
    function applyFilters() {
        personCards.forEach(card => {
            const role = card.getAttribute('data-role');
            const group = card.getAttribute('data-group');
            const name = card.querySelector('h3').textContent.toLowerCase();
            const info = card.querySelector('p').textContent.toLowerCase();
            const title = card.querySelector('.person-title').textContent.toLowerCase();
            const searchContent = `${name} ${title} ${info}`;
            
            // Check if card passes all filters
            const passesRoleFilter = currentRoleFilter === 'all' || role === currentRoleFilter;
            const passesGroupFilter = currentGroupFilter === 'all' || group === currentGroupFilter;
            const passesSearchFilter = currentSearchQuery === '' || searchContent.includes(currentSearchQuery);
            
            // Show or hide card based on filter results
            if (passesRoleFilter && passesGroupFilter && passesSearchFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Check if no results are shown
        checkNoResults();
    }
    
    // Check if no results are shown and add a message if needed
    function checkNoResults() {
        let visibleCards = 0;
        personCards.forEach(card => {
            if (card.style.display !== 'none') {
                visibleCards++;
            }
        });
        
        // Get the directory element
        const directory = document.querySelector('.people-grid');
        
        // Remove existing no-results message if it exists
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // If no cards are visible, show a message
        if (visibleCards === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>No people match your current filter criteria. Try adjusting your filters or search query.</p>
                    <button id="reset-filters" class="btn btn-primary">Reset All Filters</button>
                </div>
            `;
            directory.parentNode.insertBefore(noResultsMessage, directory.nextSibling);
            
            // Add event listener to reset button
            document.getElementById('reset-filters').addEventListener('click', resetAllFilters);
        }
    }
    
    // Reset all filters
    function resetAllFilters() {
        // Reset role filters
        roleFilterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Reset group filters
        groupFilterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-group') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // Clear search input
        searchInput.value = '';
        
        // Reset filter states
        currentRoleFilter = 'all';
        currentGroupFilter = 'all';
        currentSearchQuery = '';
        
        // Apply filters
        applyFilters();
    }
    
    // Person card hover effects
    personCards.forEach(card => {
        const image = card.querySelector('.person-image img');
        
        card.addEventListener('mouseenter', function() {
            image.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            image.style.transform = 'scale(1)';
        });
    });
    
    // Spotlight animations
    const spotlight = document.querySelector('.spotlight-container');
    if (spotlight) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    spotlight.classList.add('animate-spotlight');
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(spotlight);
    }
    
    // Add CSS for the no results message and spotlight animation
    const style = document.createElement('style');
    style.textContent = `
        .no-results-message {
            padding: 3rem;
            background-color: #f7f9fc;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .no-results-content i {
            font-size: 3rem;
            color: #ccc;
            margin-bottom: 1rem;
        }
        
        .no-results-content h3 {
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }
        
        .no-results-content p {
            margin-bottom: 1.5rem;
            color: #777;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .animate-spotlight {
            animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});
