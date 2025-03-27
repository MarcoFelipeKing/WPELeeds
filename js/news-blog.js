// News & Blog page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize post filtering
    initPostFiltering();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize load more functionality
    initLoadMore();
    
    // Initialize newsletter subscription
    initNewsletter();
    
    // Add scroll animations
    initScrollAnimations();
});

// Post filtering functionality
function initPostFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    const postCards = document.querySelectorAll('.post-card');
    
    if (!filterButtons.length || !postCards.length) return;
    
    // Add click event to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Show/hide posts based on filter
            postCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
            
            // Check if any posts are visible
            checkNoResults();
        });
    });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('content-search');
    const searchButton = document.querySelector('.search-btn');
    const postCards = document.querySelectorAll('.post-card');
    
    if (!searchInput || !searchButton || !postCards.length) return;
    
    // Search function
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Reset filter if search is empty
            document.querySelector('.filter-btn[data-filter="all"]').click();
            return;
        }
        
        // Clear active filter
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        // Filter posts based on search term
        postCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const meta = card.querySelector('.post-meta').textContent.toLowerCase();
            const searchContent = `${title} ${description} ${meta}`;
            
            if (searchContent.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Check if any posts are visible
        checkNoResults();
    }
    
    // Search on button click
    searchButton.addEventListener('click', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Reset search on empty input
    searchInput.addEventListener('input', function() {
        if (this.value === '') {
            // Reset to all posts
            document.querySelector('.filter-btn[data-filter="all"]').click();
        }
    });
}

// Check if no results are shown
function checkNoResults() {
    const postsContainer = document.getElementById('posts-container');
    const postCards = document.querySelectorAll('.post-card');
    
    if (!postsContainer) return;
    
    let visibleCards = 0;
    postCards.forEach(card => {
        if (card.style.display !== 'none') {
            visibleCards++;
        }
    });
    
    // Remove existing no-results message if it exists
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Hide/show load more button
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = visibleCards > 0 ? 'inline-block' : 'none';
    }
    
    // If no cards are visible, show a message
    if (visibleCards === 0) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>No posts match your current search or filter criteria. Try adjusting your filters or search term.</p>
                <button id="reset-filters" class="btn btn-primary">Reset All Filters</button>
            </div>
        `;
        
        postsContainer.appendChild(noResultsMessage);
        
        // Add event listener to reset button
        document.getElementById('reset-filters').addEventListener('click', function() {
            // Clear search input
            const searchInput = document.getElementById('content-search');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Reset to all posts
            document.querySelector('.filter-btn[data-filter="all"]').click();
        });
    }
}

// Load more functionality (simulated in this example)
function initLoadMore() {
    const loadMoreBtn = document.getElementById('load-more');
    
    if (!loadMoreBtn) return;
    
    // In a real implementation, this would load more posts from the server
    // For this example, we'll simulate loading additional posts
    let postsLoaded = 6; // Initial posts
    const postsPerLoad = 3; // Posts to add each time
    
    loadMoreBtn.addEventListener('click', function() {
        // Show loading state
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        this.disabled = true;
        
        // Simulate network delay
        setTimeout(() => {
            // In a real implementation, you would fetch more posts from the server
            // and append them to the posts container
            
            // For this example, we'll just simulate that we've loaded all posts
            this.innerHTML = 'No More Posts';
            this.disabled = true;
            
            // Add a class to fade the button
            this.classList.add('btn-disabled');
        }, 1500);
    });
}

// Newsletter subscription
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email) {
            // In a real implementation, you would send this to your server
            console.log('Newsletter signup:', email);
            
            // Show success message
            const formContainer = this.parentNode;
            formContainer.innerHTML = `
                <div class="newsletter-success">
                    <i class="fas fa-check-circle"></i>
                    <h4>Thank You!</h4>
                    <p>You've been successfully subscribed to our newsletter.</p>
                </div>
            `;
        }
    });
}

// Add scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.featured-post, .latest-posts, .newsletter-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        element.classList.add('animate-hidden');
        observer.observe(element);
    });
    
    // Add animation CSS
    const style = document.createElement('style');
    style.textContent = `
        .animate-hidden {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s, transform 0.8s;
        }
        
        .animate-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .no-results-message {
            text-align: center;
            padding: 3rem 2rem;
            background-color: #f9f9f9;
            border-radius: 10px;
            margin: 2rem 0;
        }
        
        .no-results-content i {
            font-size: 3rem;
            color: #ddd;
            margin-bottom: 1rem;
        }
        
        .no-results-content h3 {
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }
        
        .no-results-content p {
            max-width: 500px;
            margin: 0 auto 1.5rem;
            color: #777;
        }
        
        .newsletter-success {
            text-align: center;
            padding: 2rem 0;
        }
        
        .newsletter-success i {
            font-size: 3rem;
            color: var(--teal);
            margin-bottom: 1rem;
        }
        
        .newsletter-success h4 {
            margin-bottom: 1rem;
            color: var(--dark-gray);
        }
        
        .newsletter-success p {
            color: #666;
        }
        
        .btn-disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}