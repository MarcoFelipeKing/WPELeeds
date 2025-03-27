/* News Archive specific styles */

/* Archive Layout */
.archive-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 3rem;
}

/* Sidebar Styles */
.archive-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.sidebar-widget {
    background-color: white;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.sidebar-widget h3 {
    margin-bottom: 1.5rem;
    color: var(--dark-gray);
    position: relative;
    padding-bottom: 0.8rem;
}

.sidebar-widget h3:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30px;
    height: 2px;
    background-color: var(--teal);
}

.filter-menu {
    list-style: none;
    margin: 0;
    padding: 0;
}

.filter-menu li {
    margin-bottom: 0.8rem;
}

.filter-menu li a {
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: var(--dark-gray);
    padding: 0.5rem;
    border-radius: 5px;
    transition: all 0.3s;
}

.filter-menu li a:hover {
    background-color: #f5f5f5;
}

.filter-menu li.active a {
    background-color: rgba(159, 144, 197, 0.1);
    color: var(--purple);
    font-weight: 600;
}

.archive-dropdown {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.archive-dropdown select {
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    font-family: var(--body-font);
    background-color: white;
}

.archive-dropdown select:disabled {
    background-color: #f5f5f5;
    color: #999;
}

.tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.tag {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0.8rem;
    background-color: #f5f5f5;
    border-radius: 5px;
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s;
}

.tag:hover {
    background-color: var(--primary-blue);
    color: white;
}

.tag:hover span {
    background-color: rgba(255, 255, 255, 0.3);
}

.tag span {
    display: inline-block;
    padding: 0 0.4rem;
    margin-left: 0.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    font-size: 0.8rem;
    transition: all 0.3s;
}

.search-widget .search-container {
    margin-top: 0;
}

/* Archive Content */
.current-filters {
    background-color: white;
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.filter-summary {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.filter-summary strong {
    color: var(--purple);
}

#result-count {
    font-weight: 600;
    color: var(--dark-gray);
}

#active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
}

.active-filter {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background-color: rgba(159, 144, 197, 0.1);
    border-radius: 5px;
    color: var(--purple);
    font-size: 0.9rem;
}

.active-filter button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--purple);
    cursor: pointer;
    padding: 0;
    font-size: 0.8rem;
}

/* Sort Options */
.sort-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    border-radius: 10px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.sort-options label {
    margin-right: 0.8rem;
    color: var(--dark-gray);
}

#sort-select {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    font-family: var(--body-font);
    background-color: white;
}

.view-options {
    display: flex;
    gap: 0.5rem;
}

.view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 5px;
    background-color: #f5f5f5;
    color: #777;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.view-btn:hover {
    background-color: #e5e5e5;
}

.view-btn.active {
    background-color: var(--primary-blue);
    color: white;
}

/* List View Styles */
.posts-list .post-card {
    display: grid;
    grid-template-columns: 200px 1fr;
    height: auto;
}

.posts-list .post-image {
    height: 100%;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
}

.page-info {
    color: #777;
    font-size: 0.9rem;
}

.page-controls {
    display: flex;
    gap: 0.5rem;
}

.page-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 5px;
    background-color: white;
    color: var(--dark-gray);
    text-decoration: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: all 0.3s;
}

.page-link:hover {
    background-color: #f5f5f5;
}

.page-link.active {
    background-color: var(--primary-blue);
    color: white;
}

.page-link.disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* Responsive Styles */
@media (max-width: 992px) {
    .archive-layout {
        grid-template-columns: 1fr;
    }
    
    .archive-sidebar {
        grid-row: 2;
        margin-top: 2rem;
    }
    
    .sidebar-widget {
        max-width: 100%;
    }
    
    .filter-menu li a {
        padding: 0.8rem;
    }
}

@media (max-width: 768px) {
    .filter-summary {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .sort-options {
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .posts-list .post-card {
        grid-template-columns: 1fr;
    }
    
    .posts-list .post-image {
        height: 200px;
    }
}

@media (max-width: 576px) {
    .page-controls {
        display: none;
    }
    
    .pagination {
        justify-content: center;
    }
}
