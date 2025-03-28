// Collaboration Network Visualization
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the right page
    const networkContainer = document.getElementById('collaboration-network');
    if (!networkContainer) return;
    
    // Load D3.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
    script.integrity = 'sha512-M7nHCiNUOwFt6Us3r8alutZLm9qMt4s9951TWgALROR/eDNjLUlAoOwP+9/R5UYg1bRPZa3HRj8I5NEiYuRng==';
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    
    script.onload = function() {
        initializeNetwork();
    };
    
    document.head.appendChild(script);

    // Sample data - in a real implementation, this would come from your database
    const researcherData = [
        {
            id: 1,
            name: "Prof. Emma Wilson",
            title: "Professor of Environmental Engineering",
            group: "indoor-air",
            image: "images/people/prof-wilson.jpg",
            publications: 87,
            projects: 12,
            profileUrl: "people/emma-wilson.html"
        },
        {
            id: 2,
            name: "Dr. Michael Wong",
            title: "Associate Professor",
            group: "bioresources",
            image: "images/people/dr-wong.jpg",
            publications: 64,
            projects: 9,
            profileUrl: "people/michael-wong.html"
        },
        {
            id: 3,
            name: "Dr. Elena Rodriguez",
            title: "Senior Lecturer",
            group: "public-health",
            image: "images/people/dr-rodriguez.jpg",
            publications: 52,
            projects: 7,
            profileUrl: "people/elena-rodriguez.html"
        },
        {
            id: 4,
            name: "Prof. James Park",
            title: "Professor of Sanitation Engineering",
            group: "sanitation",
            image: "images/people/prof-park.jpg",
            publications: 79,
            projects: 11,
            profileUrl: "people/james-park.html"
        },
        {
            id: 5,
            name: "Dr. Thomas Lee",
            title: "Lecturer",
            group: "indoor-air",
            image: "images/people/dr-lee.jpg",
            publications: 38,
            projects: 6,
            profileUrl: "people/thomas-lee.html"
        },
        {
            id: 6,
            name: "Dr. Lisa Zhang",
            title: "Lecturer",
            group: "public-health",
            image: "images/people/dr-zhang.jpg",
            publications: 35,
            projects: 5,
            profileUrl: "people/lisa-zhang.html"
        },
        {
            id: 7,
            name: "Dr. Ahmed Hassan",
            title: "Research Fellow",
            group: "bioresources",
            image: "images/people/dr-hassan.jpg",
            publications: 29,
            projects: 4,
            profileUrl: "people/ahmed-hassan.html"
        },
        {
            id: 8,
            name: "Dr. Maria Garcia",
            title: "Postdoctoral Researcher",
            group: "sanitation",
            image: "images/people/dr-garcia.jpg",
            publications: 24,
            projects: 3,
            profileUrl: "people/maria-garcia.html"
        },
        {
            id: 9,
            name: "Sarah Johnson",
            title: "PhD Candidate",
            group: "indoor-air",
            image: "images/people/sarah-johnson.jpg",
            publications: 12,
            projects: 2,
            profileUrl: "people/sarah-johnson.html"
        },
        {
            id: 10,
            name: "Raj Patel",
            title: "PhD Candidate",
            group: "sanitation",
            image: "images/people/raj-patel.jpg",
            publications: 8,
            projects: 2,
            profileUrl: "people/raj-patel.html"
        },
        {
            id: 11,
            name: "Alex Wong",
            title: "PhD Candidate",
            group: "indoor-air",
            image: "images/people/alex-wong.jpg",
            publications: 6,
            projects: 1,
            profileUrl: "people/alex-wong.html"
        },
        {
            id: 12,
            name: "Maya Patel",
            title: "PhD Candidate",
            group: "bioresources",
            image: "images/people/maya-patel.jpg",
            publications: 5,
            projects: 1,
            profileUrl: "people/maya-patel.html"
        }
    ];
    
    // Collaboration links between researchers
    // Value represents strength of collaboration (number of joint projects/papers)
    const collaborationLinks = [
        { source: 1, target: 2, value: 8 },
        { source: 1, target: 3, value: 5 },
        { source: 1, target: 5, value: 12 },
        { source: 1, target: 9, value: 7 },
        { source: 1, target: 11, value: 4 },
        { source: 2, target: 3, value: 6 },
        { source: 2, target: 7, value: 10 },
        { source: 2, target: 12, value: 9 },
        { source: 3, target: 4, value: 7 },
        { source: 3, target: 6, value: 11 },
        { source: 4, target: 8, value: 9 },
        { source: 4, target: 10, value: 5 },
        { source: 5, target: 9, value: 8 },
        { source: 5, target: 11, value: 6 },
        { source: 6, target: 7, value: 4 },
        { source: 6, target: 8, value: 7 },
        { source: 7, target: 12, value: 6 },
        { source: 8, target: 10, value: 5 },
        { source: 9, target: 11, value: 3 },
        { source: 2, target: 4, value: 4 },
        { source: 1, target: 4, value: 3 },
        { source: 1, target: 6, value: 2 },
        { source: 2, target: 5, value: 3 },
        { source: 3, target: 5, value: 4 },
        { source: 7, target: 8, value: 2 },
        { source: 9, target: 12, value: 1 },
        { source: 10, target: 11, value: 2 }
    ];
    
    function initializeNetwork() {
        const width = networkContainer.clientWidth;
        const height = networkContainer.clientHeight;
        
        // Clear any existing SVG
        d3.select(networkContainer).selectAll("*").remove();
        
        // Create SVG
        const svg = d3.select(networkContainer)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
            
        // Create a group for the network
        const g = svg.append("g");
        
        // Add zoom functionality
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
            
        svg.call(zoom);
        
        // Define colors by group
        const colorMap = {
            "indoor-air": getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim(),
            "bioresources": getComputedStyle(document.documentElement).getPropertyValue('--secondary-blue').trim(),
            "public-health": getComputedStyle(document.documentElement).getPropertyValue('--purple').trim(),
            "sanitation": getComputedStyle(document.documentElement).getPropertyValue('--teal').trim()
        };
        
        // Create force simulation
        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(d => 100 / (d.value * 0.1)))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(30));
            
        // Create links
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(collaborationLinks)
            .enter().append("line")
            .attr("class", "link")
            .attr("stroke-width", d => Math.sqrt(d.value));
            
        // Create nodes
        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(researcherData)
            .enter().append("g")
            .attr("class", "node")
            .attr("data-group", d => d.group)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
                
        // Add circles to nodes
        node.append("circle")
            .attr("r", 8)
            .attr("fill", d => colorMap[d.group])
            .on("click", clicked);
            
        // Add labels to nodes
        node.append("text")
            .attr("dx", 12)
            .attr("dy", 4)
            .text(d => d.name);
            
        // Update positions on tick
        simulation
            .nodes(researcherData)
            .on("tick", ticked);
            
        simulation.force("link")
            .links(collaborationLinks);
            
        // Set up group filters
        const groupFilters = document.querySelectorAll('.group-filter');
        groupFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                groupFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                const group = this.getAttribute('data-group');
                filterByGroup(group);
            });
        });
        
        // Functions for the simulation
        function ticked() {
            link
                .attr("x1", d => Math.max(10, Math.min(width - 10, d.source.x)))
                .attr("y1", d => Math.max(10, Math.min(height - 10, d.source.y)))
                .attr("x2", d => Math.max(10, Math.min(width - 10, d.target.x)))
                .attr("y2", d => Math.max(10, Math.min(height - 10, d.target.y)));
                
            node
                .attr("transform", d => `translate(${Math.max(10, Math.min(width - 10, d.x))}, ${Math.max(10, Math.min(height - 10, d.y))})`);
        }
        
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        function clicked(event, d) {
            // Find the researcher details container
            const detailsPlaceholder = document.querySelector('.details-placeholder');
            const researcherDetails = document.querySelector('.researcher-details');
            
            // Hide placeholder, show details
            detailsPlaceholder.style.display = 'none';
            researcherDetails.style.display = 'block';
            
            // Update researcher details
            const detailsImage = researcherDetails.querySelector('.details-image');
            const detailsName = researcherDetails.querySelector('h3');
            const detailsTitle = researcherDetails.querySelector('.details-title');
            const detailsGroup = researcherDetails.querySelector('.details-group');
            const publicationsCount = researcherDetails.querySelector('.publications-count');
            const collaboratorsCount = researcherDetails.querySelector('.collaborators-count');
            const projectsCount = researcherDetails.querySelector('.projects-count');
            const collaboratorsList = researcherDetails.querySelector('.collaborators-list');
            const viewProfileLink = researcherDetails.querySelector('.view-profile');
            
            detailsImage.src = d.image;
            detailsImage.alt = d.name;
            detailsName.textContent = d.name;
            detailsTitle.textContent = d.title;
            
            // Set group class and text
            detailsGroup.className = 'details-group ' + d.group;
            const groupNames = {
                'indoor-air': 'Indoor Air Group',
                'bioresources': 'BioResources Group',
                'public-health': 'Public Health Group',
                'sanitation': 'Sanitation Group'
            };
            detailsGroup.textContent = groupNames[d.group];
            
            // Set statistics
            publicationsCount.textContent = d.publications;
            
            // Count collaborators from links
            const collaborators = collaborationLinks
                .filter(link => link.source.id === d.id || link.target.id === d.id)
                .map(link => link.source.id === d.id ? link.target.id : link.source.id);
                
            collaboratorsCount.textContent = new Set(collaborators).size;
            projectsCount.textContent = d.projects;
            
            // Show top collaborators
            collaboratorsList.innerHTML = '';
            
            // Get top collaborators by link value
            const topCollaborators = collaborationLinks
                .filter(link => link.source.id === d.id || link.target.id === d.id)
                .map(link => {
                    const collaboratorId = link.source.id === d.id ? link.target.id : link.source.id;
                    const collaborator = researcherData.find(r => r.id === collaboratorId);
                    return {
                        ...collaborator,
                        strength: link.value
                    };
                })
                .sort((a, b) => b.strength - a.strength)
                .slice(0, 5);
                
            topCollaborators.forEach(collaborator => {
                const li = document.createElement('li');
                li.textContent = `${collaborator.name} (${collaborator.strength} collaborations)`;
                collaboratorsList.appendChild(li);
            });
            
            // Set profile link
            viewProfileLink.href = d.profileUrl;
        }
        
        // Filter nodes by research group
        function filterByGroup(group) {
            if (group === 'all') {
                // Show all nodes and links
                node.style('opacity', 1);
                link.style('opacity', 0.6);
                return;
            }
            
            // Filter nodes by selected group
            node.style('opacity', d => d.group === group ? 1 : 0.2);
            
            // Filter links - only show links that connect to at least one node in the selected group
            link.style('opacity', d => {
                const sourceGroup = researcherData.find(r => r.id === d.source.id).group;
                const targetGroup = researcherData.find(r => r.id === d.target.id).group;
                
                return sourceGroup === group || targetGroup === group ? 0.6 : 0.1;
            });
        }
        
        // Initial layout adjustments
        simulation.alpha(1).restart();
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (typeof d3 !== 'undefined') {
            initializeNetwork();
        }
    });
});