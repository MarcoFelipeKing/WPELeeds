// Collaboration Network Visualization
// D3 is loaded as a static <script> tag in people.html before this file.
document.addEventListener('DOMContentLoaded', function() {
    const networkContainer = document.getElementById('collaboration-network');
    if (!networkContainer) return;

    function initializeNetwork() {
        const researcherData = [
            {
                id: 1,
                name: "Prof. Catherine Noakes",
                title: "Professor of Environmental Engineering for Buildings",
                group: "indoor-air",
                image: "images/people/cath_noakes.jpg",
                publications: 120,
                projects: 18,
                profileUrl: "people.html"
            },
            {
                id: 2,
                name: "Dr. Marco-Felipe King",
                title: "Director of WPE",
                group: "indoor-air",
                image: "images/people/profile_marco-felipe_king.png",
                publications: 65,
                projects: 12,
                profileUrl: "people.html"
            },
            {
                id: 3,
                name: "Dr. Amirul Khan",
                title: "Associate Professor of Environmental Fluid Mechanics",
                group: "indoor-air",
                image: "images/people/amir.jpeg",
                publications: 55,
                projects: 9,
                profileUrl: "people.html"
            },
            {
                id: 4,
                name: "Dr. Katharine Booker",
                title: "University Academic Fellow",
                group: "indoor-air",
                image: "images/people/katharine_booker.jpg",
                publications: 30,
                projects: 6,
                profileUrl: "people.html"
            },
            {
                id: 5,
                name: "Prof. Barbara Evans",
                title: "Professor of Public Health Engineering",
                group: "public-health",
                image: "images/people/barbara_evans.jpg",
                publications: 110,
                projects: 20,
                profileUrl: "people.html"
            },
            {
                id: 6,
                name: "Dr. Paul Hutchings",
                title: "Associate Professor in Water, Sanitation & Health",
                group: "sanitation",
                image: "images/people/paul_hutchings.jpg",
                publications: 60,
                projects: 11,
                profileUrl: "people.html"
            },
            {
                id: 7,
                name: "Dr. Cynthia Okoro-Shekwaga",
                title: "Associate Professor",
                group: "bioresources",
                image: "images/people/Cynthia-700x467.jpg",
                publications: 45,
                projects: 8,
                profileUrl: "people.html"
            },
            {
                id: 8,
                name: "Prof. Joby Boxall",
                title: "Professor of Water Systems Engineering",
                group: "water",
                image: "images/people/joby_boxall.jpg",
                publications: 130,
                projects: 22,
                profileUrl: "people.html"
            },
            {
                id: 9,
                name: "Dr. Martin Crapper",
                title: "Associate Professor in Environmental Fluid Mechanics",
                group: "water",
                image: "images/people/martin_crapper.jpg",
                publications: 50,
                projects: 9,
                profileUrl: "people.html"
            },
            {
                id: 10,
                name: "Dr. Franja Prosenc",
                title: "University Academic Fellow",
                group: "bioresources",
                image: "images/people/franja_prosenc.jpg",
                publications: 28,
                projects: 5,
                profileUrl: "people.html"
            },
            {
                id: 11,
                name: "Dr. Peter Martin",
                title: "Associate Professor",
                group: "sanitation",
                image: "images/people/peter_martin.jpg",
                publications: 42,
                projects: 7,
                profileUrl: "people.html"
            },
            {
                id: 12,
                name: "Dr. Felix Mietzel",
                title: "University Academic Fellow",
                group: "bioresources",
                image: "images/people/felix_mietzel.jpg",
                publications: 22,
                projects: 4,
                profileUrl: "people.html"
            }
        ];

        // Collaboration links — value = approximate number of joint publications/projects
        const collaborationLinks = [
            { source: 1, target: 2, value: 14 },
            { source: 1, target: 3, value: 10 },
            { source: 1, target: 4, value: 8 },
            { source: 2, target: 3, value: 9 },
            { source: 2, target: 4, value: 6 },
            { source: 1, target: 5, value: 5 },
            { source: 5, target: 6, value: 12 },
            { source: 5, target: 11, value: 9 },
            { source: 6, target: 11, value: 10 },
            { source: 6, target: 8, value: 4 },
            { source: 7, target: 10, value: 8 },
            { source: 7, target: 12, value: 7 },
            { source: 10, target: 12, value: 5 },
            { source: 8, target: 9, value: 11 },
            { source: 8, target: 2, value: 3 },
            { source: 9, target: 3, value: 6 },
            { source: 1, target: 6, value: 4 },
            { source: 2, target: 5, value: 3 },
            { source: 3, target: 9, value: 7 },
            { source: 7, target: 5, value: 5 },
            { source: 4, target: 2, value: 5 },
            { source: 11, target: 7, value: 3 },
            { source: 6, target: 5, value: 8 }
        ];

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

        // Define colours by group
        const colorMap = {
            "indoor-air": getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim() || "#1a6b9e",
            "bioresources": getComputedStyle(document.documentElement).getPropertyValue('--secondary-blue').trim() || "#2e9e5b",
            "public-health": getComputedStyle(document.documentElement).getPropertyValue('--purple').trim() || "#7b3fa8",
            "sanitation": getComputedStyle(document.documentElement).getPropertyValue('--teal').trim() || "#1a9e8f",
            "water": getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || "#1a5aaa"
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
            .attr("fill", d => colorMap[d.group] || "#999")
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
                filterByGroup(this.getAttribute('data-group'));
            });
        });

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
            const detailsPlaceholder = document.querySelector('.details-placeholder');
            const researcherDetails = document.querySelector('.researcher-details');
            if (!detailsPlaceholder || !researcherDetails) return;

            detailsPlaceholder.style.display = 'none';
            researcherDetails.style.display = 'block';

            researcherDetails.querySelector('.details-image').src = d.image;
            researcherDetails.querySelector('.details-image').alt = d.name;
            researcherDetails.querySelector('h3').textContent = d.name;
            researcherDetails.querySelector('.details-title').textContent = d.title;

            const detailsGroup = researcherDetails.querySelector('.details-group');
            detailsGroup.className = 'details-group ' + d.group;
            const groupNames = {
                'indoor-air': 'Indoor Air Group',
                'bioresources': 'BioResources Group',
                'public-health': 'Public Health Group',
                'sanitation': 'Sanitation Group',
                'water': 'Water Group'
            };
            detailsGroup.textContent = groupNames[d.group] || d.group;

            researcherDetails.querySelector('.publications-count').textContent = d.publications;
            researcherDetails.querySelector('.projects-count').textContent = d.projects;

            const collaborators = collaborationLinks
                .filter(l => l.source.id === d.id || l.target.id === d.id)
                .map(l => l.source.id === d.id ? l.target.id : l.source.id);
            researcherDetails.querySelector('.collaborators-count').textContent = new Set(collaborators).size;

            const collaboratorsList = researcherDetails.querySelector('.collaborators-list');
            collaboratorsList.innerHTML = '';
            collaborationLinks
                .filter(l => l.source.id === d.id || l.target.id === d.id)
                .map(l => {
                    const cid = l.source.id === d.id ? l.target.id : l.source.id;
                    return { ...researcherData.find(r => r.id === cid), strength: l.value };
                })
                .sort((a, b) => b.strength - a.strength)
                .slice(0, 5)
                .forEach(c => {
                    const li = document.createElement('li');
                    li.textContent = `${c.name} (${c.strength} collaborations)`;
                    collaboratorsList.appendChild(li);
                });

            researcherDetails.querySelector('.view-profile').href = d.profileUrl;
        }

        function filterByGroup(group) {
            if (group === 'all') {
                node.style('opacity', 1);
                link.style('opacity', 0.6);
                return;
            }
            node.style('opacity', d => d.group === group ? 1 : 0.2);
            link.style('opacity', d => {
                const sg = researcherData.find(r => r.id === d.source.id)?.group;
                const tg = researcherData.find(r => r.id === d.target.id)?.group;
                return sg === group || tg === group ? 0.6 : 0.1;
            });
        }

        simulation.alpha(1).restart();
    }

    initializeNetwork();

    window.addEventListener('resize', () => {
        initializeNetwork();
    });
});
