/**
 * Co-authorship Network Visualization
 * 
 * This script creates an interactive network visualization of co-authors
 * with clustering by research themes and mapping to UKRI priority areas.
 * 
 * Dependencies:
 * - D3.js (for visualization)
 * - PapaParse (for CSV parsing)
 */

class CoauthorNetwork {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      container: '#network-container',
      width: options.width || 900,
      height: options.height || 700,
      nodeSize: options.nodeSize || 5,
      linkDistance: options.linkDistance || 100,
      chargeStrength: options.chargeStrength || -300,
      centerForce: options.centerForce || 0.1,
      ukriPriorityAreas: options.ukriPriorityAreas || [
        "AI and Data Economy",
        "Clean Growth",
        "Future of Mobility",
        "Ageing Society",
        "Biotechnology and Biological Sciences",
        "Net Zero",
        "Environmental Sustainability",
        "Medical Research",
        "Digital Innovation",
        "Advanced Materials",
        "Manufacturing"
      ],
      // Color scale for UKRI priority areas
      colorScheme: options.colorScheme || d3.schemeTableau10,
      // Keywords mapping to UKRI priority areas
      keywordMap: options.keywordMap || this.defaultKeywordMap()
    };

    // Initialize data structures
    this.authors = new Map(); // Map of author names to author objects
    this.links = [];          // Links between co-authors
    this.papers = [];         // Publication data
    this.clusters = [];       // Detected research clusters
    this.networkData = null;  // Processed network data ready for visualization
    
    // Initialize the simulation
    this.simulation = null;
  }

  // Default mapping of keywords to UKRI priority areas
  defaultKeywordMap() {
    return {
      // AI and Data Economy
      "ai": "AI and Data Economy",
      "artificial intelligence": "AI and Data Economy",
      "machine learning": "AI and Data Economy",
      "deep learning": "AI and Data Economy",
      "data science": "AI and Data Economy",
      "neural network": "AI and Data Economy",
      "big data": "AI and Data Economy",
      
      // Clean Growth
      "renewable": "Clean Growth",
      "sustainability": "Clean Growth",
      "energy efficiency": "Clean Growth",
      "carbon": "Clean Growth",
      "climate": "Clean Growth",
      "green": "Clean Growth",
      "emission": "Clean Growth",
      
      // Environmental Sustainability
      "environment": "Environmental Sustainability",
      "ecology": "Environmental Sustainability",
      "biodiversity": "Environmental Sustainability",
      "conservation": "Environmental Sustainability",
      "sustainable": "Environmental Sustainability",
      "pollution": "Environmental Sustainability",
      
      // Net Zero
      "net zero": "Net Zero",
      "carbon neutral": "Net Zero",
      "decarbonisation": "Net Zero",
      "greenhouse gas": "Net Zero",
      "carbon capture": "Net Zero",
      
      // Future of Mobility
      "transport": "Future of Mobility",
      "mobility": "Future of Mobility",
      "automotive": "Future of Mobility",
      "electric vehicle": "Future of Mobility",
      "autonomous": "Future of Mobility",
      
      // Ageing Society
      "ageing": "Ageing Society",
      "elderly": "Ageing Society",
      "dementia": "Ageing Society",
      "gerontology": "Ageing Society",
      "care": "Ageing Society",
      
      // Medical Research
      "medical": "Medical Research",
      "clinical": "Medical Research",
      "health": "Medical Research",
      "disease": "Medical Research",
      "patient": "Medical Research",
      "hospital": "Medical Research",
      "biomedical": "Medical Research",
      "infection": "Medical Research",
      "microbial": "Medical Research",
      "microorganism": "Medical Research",
      "bacteria": "Medical Research",
      "virus": "Medical Research",
      "transmission": "Medical Research",
      "bioaerosol": "Medical Research",
      
      // Digital Innovation
      "digital": "Digital Innovation",
      "internet": "Digital Innovation",
      "iot": "Digital Innovation",
      "blockchain": "Digital Innovation",
      "cyber": "Digital Innovation",
      "computing": "Digital Innovation",
      
      // Advanced Materials
      "material": "Advanced Materials",
      "composite": "Advanced Materials",
      "polymer": "Advanced Materials",
      "nanotechnology": "Advanced Materials",
      "manufacturing": "Manufacturing",
      "fabrication": "Manufacturing",
      "industrial": "Manufacturing",
      "production": "Manufacturing"
    };
  }

  /**
   * Fetches staff profile page HTML
   * @param {string} url - URL of the staff profile page
   * @returns {Promise<string>} - HTML content
   */
  async fetchProfilePage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Extracts publication data from HTML
   * @param {string} html - HTML content of the profile page
   * @returns {Array} - Array of publication objects
   */
  extractPublications(html) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find the publications section
    const symplecticDiv = doc.getElementById('symplectic');
    if (!symplecticDiv) {
      console.error('Publications section not found');
      return [];
    }

    // Extract journal articles
    const publications = [];
    this.extractPublicationType(symplecticDiv, 'journal_article_div', publications);
    this.extractPublicationType(symplecticDiv, 'conference_paper_div', publications);
    this.extractPublicationType(symplecticDiv, 'preprint_div', publications);
    
    return publications;
  }

  /**
   * Extracts publications of a specific type
   * @param {Element} container - The container element
   * @param {string} divId - The ID of the publication type div
   * @param {Array} publications - Array to store publication objects
   */
  extractPublicationType(container, divId, publications) {
    const pubDiv = container.querySelector(`#${divId}`);
    if (!pubDiv) return;

    const pubItems = pubDiv.querySelectorAll('p');
    pubItems.forEach(item => {
      const pub = this.parsePublicationItem(item);
      if (pub) {
        publications.push(pub);
      }
    });
  }

  /**
   * Parses a single publication item
   * @param {Element} item - The publication item element
   * @returns {Object|null} - The parsed publication data or null if parsing failed
   */
  parsePublicationItem(item) {
    try {
      const authorText = item.querySelector('.authors')?.textContent.trim() || '';
      const year = item.querySelector('.year')?.textContent.replace('.', '').trim() || '';
      const title = item.querySelector('.title-with-parent')?.textContent.trim() || '';
      const journal = item.querySelector('.journal')?.textContent.trim() || '';
      
      // Extract author names
      const authorNames = authorText.split(',').map(name => name.replace(/\s+/g, ' ').trim());
      
      // Get DOI link if available
      const doiLink = Array.from(item.querySelectorAll('a')).find(a => 
        a.getAttribute('href')?.includes('dx.doi.org')
      )?.getAttribute('href') || '';

      return {
        id: item.id,
        authors: authorNames,
        year: year,
        title: title,
        journal: journal,
        doi: doiLink
      };
    } catch (error) {
      console.error('Error parsing publication item:', error);
      return null;
    }
  }

  /**
   * Adds a staff member's publications to the network
   * @param {string} url - URL of the staff profile page
   */
  async addStaffMember(url) {
    try {
      const html = await this.fetchProfilePage(url);
      const publications = this.extractPublications(html);
      this.papers = this.papers.concat(publications);
      console.log(`Added ${publications.length} publications from ${url}`);
    } catch (error) {
      console.error(`Failed to add staff member from ${url}:`, error);
    }
  }

  /**
   * Alternatively, you can directly add publication data
   * @param {Array} publications - Array of publication objects
   */
  addPublications(publications) {
    this.papers = this.papers.concat(publications);
    console.log(`Added ${publications.length} publications`);
  }

  /**
   * Builds the co-authorship network from the publication data
   */
  buildNetwork() {
    // Reset data structures
    this.authors = new Map();
    this.links = [];
    
    // Process each paper
    this.papers.forEach(paper => {
      const authorList = paper.authors;
      const title = paper.title;
      const year = paper.year;
      const journal = paper.journal;
      
      // Add or update each author
      authorList.forEach(authorName => {
        if (!this.authors.has(authorName)) {
          this.authors.set(authorName, {
            id: authorName,
            name: authorName,
            publications: [],
            coauthors: new Set(),
            keywords: {},
            priorityAreas: {}
          });
        }
        
        const author = this.authors.get(authorName);
        author.publications.push({
          title: title,
          year: year,
          journal: journal,
          authors: authorList
        });
        
        // Extract keywords from title and add to author's keywords
        this.extractKeywords(title).forEach(keyword => {
          author.keywords[keyword] = (author.keywords[keyword] || 0) + 1;
          
          // Map to UKRI priority areas
          const priorityArea = this.mapToPriorityArea(keyword);
          if (priorityArea) {
            author.priorityAreas[priorityArea] = (author.priorityAreas[priorityArea] || 0) + 1;
          }
        });
      });
      
      // Create links between co-authors
      for (let i = 0; i < authorList.length; i++) {
        for (let j = i + 1; j < authorList.length; j++) {
          const author1 = this.authors.get(authorList[i]);
          const author2 = this.authors.get(authorList[j]);
          
          author1.coauthors.add(authorList[j]);
          author2.coauthors.add(authorList[i]);
          
          // Check if this link already exists
          const existingLink = this.links.find(link => 
            (link.source === authorList[i] && link.target === authorList[j]) || 
            (link.source === authorList[j] && link.target === authorList[i])
          );
          
          if (existingLink) {
            existingLink.strength += 1;
            existingLink.papers.push(title);
          } else {
            this.links.push({
              source: authorList[i],
              target: authorList[j],
              strength: 1,
              papers: [title]
            });
          }
        }
      }
    });
    
    // Identify the main research area for each author
    this.authors.forEach(author => {
      // Find the priority area with the highest count
      let maxCount = 0;
      let mainArea = null;
      
      Object.entries(author.priorityAreas).forEach(([area, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mainArea = area;
        }
      });
      
      author.mainPriorityArea = mainArea || "Uncategorized";
    });
    
    console.log(`Built network with ${this.authors.size} authors and ${this.links.length} co-authorship links`);
    
    // Prepare network data for visualization
    this.networkData = {
      nodes: Array.from(this.authors.values()).map(author => ({
        id: author.id,
        name: author.name,
        publications: author.publications.length,
        numCoauthors: author.coauthors.size,
        mainPriorityArea: author.mainPriorityArea,
        priorityAreas: author.priorityAreas
      })),
      links: this.links.map(link => ({
        source: link.source,
        target: link.target,
        strength: link.strength,
        papers: link.papers
      }))
    };
    
    return this.networkData;
  }

  /**
   * Extracts keywords from text
   * @param {string} text - Text to extract keywords from
   * @returns {Array} - Array of keywords
   */
  extractKeywords(text) {
    if (!text) return [];
    
    // Convert to lowercase
    const lowercaseText = text.toLowerCase();
    
    // Find all keywords from our keyword map that are in the text
    return Object.keys(this.config.keywordMap).filter(keyword => 
      lowercaseText.includes(keyword)
    );
  }

  /**
   * Maps a keyword to a UKRI priority area
   * @param {string} keyword - Keyword to map
   * @returns {string|null} - UKRI priority area or null if no mapping found
   */
  mapToPriorityArea(keyword) {
    return this.config.keywordMap[keyword] || null;
  }

  /**
   * Identifies research clusters in the co-authorship network
   * using a simple community detection algorithm
   */
  identifyClusters() {
    // TODO: Implement more sophisticated community detection
    // For now, we'll use a simple approach based on priority areas
    
    const clusters = {};
    
    // Group nodes by their main priority area
    this.networkData.nodes.forEach(node => {
      const area = node.mainPriorityArea;
      if (!clusters[area]) {
        clusters[area] = [];
      }
      clusters[area].push(node);
    });
    
    this.clusters = Object.entries(clusters).map(([name, nodes]) => ({
      name: name,
      nodes: nodes,
      size: nodes.length
    }));
    
    console.log(`Identified ${this.clusters.length} research clusters`);
    return this.clusters;
  }

  /**
   * Creates an interactive visualization of the co-authorship network
   * @param {string} containerId - ID of the container element
   */
  visualize(containerId = this.config.container) {
    const container = document.querySelector(containerId);
    if (!container) {
      console.error(`Container element '${containerId}' not found`);
      return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Create SVG element
    const svg = d3.select(container)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('class', 'coauthor-network');
    
    // Create a color scale for priority areas
    const priorityAreas = this.config.ukriPriorityAreas.concat(['Uncategorized']);
    const colorScale = d3.scaleOrdinal()
      .domain(priorityAreas)
      .range(this.config.colorScheme);
    
    // Create a force simulation
    this.simulation = d3.forceSimulation(this.networkData.nodes)
      .force('link', d3.forceLink(this.networkData.links)
        .id(d => d.id)
        .distance(this.config.linkDistance)
        .strength(link => Math.min(0.7, link.strength / 10))
      )
      .force('charge', d3.forceManyBody().strength(this.config.chargeStrength))
      .force('center', d3.forceCenter(this.config.width / 2, this.config.height / 2).strength(this.config.centerForce))
      .force('collision', d3.forceCollide().radius(d => this.getNodeRadius(d) + 5));

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.networkData.links)
      .enter()
      .append('line')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 0.5)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(this.networkData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', this.dragstarted.bind(this))
        .on('drag', this.dragged.bind(this))
        .on('end', this.dragended.bind(this))
      );

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => this.getNodeRadius(d))
      .attr('fill', d => colorScale(d.mainPriorityArea))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add labels to nodes
    node.append('text')
      .attr('dy', -10)
      .attr('text-anchor', 'middle')
      .text(d => this.shortenName(d.name))
      .style('font-size', '10px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .style('display', d => (d.publications > 2) ? 'block' : 'none');

    // Add tooltips on hover
    node.append('title')
      .text(d => `${d.name}\nPublications: ${d.publications}\nCo-authors: ${d.numCoauthors}\nMain Area: ${d.mainPriorityArea}`);

    // Create a legend
    this.createLegend(svg, colorScale, priorityAreas);

    // Update positions on each simulation tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Add search functionality
    this.addSearchBox(container);
    
    // Add filter controls for UKRI priority areas
    this.addFilters(container, colorScale, priorityAreas);
  }

  /**
   * Creates a legend for the visualization
   * @param {Object} svg - D3 selection of the SVG element
   * @param {Function} colorScale - D3 color scale
   * @param {Array} priorityAreas - Array of priority areas
   */
  createLegend(svg, colorScale, priorityAreas) {
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, 20)`);
    
    // Title
    legend.append('text')
      .attr('class', 'legend-title')
      .attr('x', 0)
      .attr('y', 0)
      .text('UKRI Priority Areas')
      .style('font-weight', 'bold')
      .style('font-size', '12px');
    
    // Legend items
    const legendItems = legend.selectAll('.legend-item')
      .data(priorityAreas)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20 + 20})`);
    
    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => colorScale(d));
    
    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(d => d)
      .style('font-size', '10px');
  }

  /**
   * Adds a search box to the visualization
   * @param {Element} container - Container element
   */
  addSearchBox(container) {
    // Create a container for the search box
    const searchContainer = document.createElement('div');
    searchContainer.className = 'network-search';
    searchContainer.style.position = 'absolute';
    searchContainer.style.top = '10px';
    searchContainer.style.right = '10px';
    searchContainer.style.zIndex = '100';
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search authors...';
    searchInput.style.padding = '5px';
    searchInput.style.width = '200px';
    
    // Handle search
    searchInput.addEventListener('input', (event) => {
      const searchTerm = event.target.value.toLowerCase();
      
      d3.select(container).selectAll('.node')
        .style('opacity', d => {
          if (!searchTerm) return 1;
          return d.name.toLowerCase().includes(searchTerm) ? 1 : 0.1;
        });
      
      d3.select(container).selectAll('line')
        .style('opacity', d => {
          if (!searchTerm) return 0.6;
          return (d.source.name.toLowerCase().includes(searchTerm) || 
                  d.target.name.toLowerCase().includes(searchTerm)) ? 1 : 0.1;
        });
    });
    
    searchContainer.appendChild(searchInput);
    container.appendChild(searchContainer);
  }

  /**
   * Adds filters for UKRI priority areas
   * @param {Element} container - Container element
   * @param {Function} colorScale - D3 color scale
   * @param {Array} priorityAreas - Array of priority areas
   */
  addFilters(container, colorScale, priorityAreas) {
    // Create a container for the filters
    const filterContainer = document.createElement('div');
    filterContainer.className = 'network-filters';
    filterContainer.style.position = 'absolute';
    filterContainer.style.bottom = '10px';
    filterContainer.style.left = '10px';
    filterContainer.style.zIndex = '100';
    filterContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    filterContainer.style.padding = '10px';
    filterContainer.style.borderRadius = '5px';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Filter by Priority Area';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    filterContainer.appendChild(title);
    
    // Add filters for each priority area
    priorityAreas.forEach(area => {
      const filter = document.createElement('div');
      filter.style.display = 'flex';
      filter.style.alignItems = 'center';
      filter.style.marginBottom = '5px';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `filter-${area.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = area;
      checkbox.checked = true;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = area;
      label.style.marginLeft = '5px';
      label.style.fontSize = '12px';
      
      const colorBox = document.createElement('span');
      colorBox.style.display = 'inline-block';
      colorBox.style.width = '12px';
      colorBox.style.height = '12px';
      colorBox.style.backgroundColor = colorScale(area);
      colorBox.style.marginLeft = '5px';
      
      filter.appendChild(checkbox);
      filter.appendChild(label);
      filter.appendChild(colorBox);
      filterContainer.appendChild(filter);
      
      // Handle filter change
      checkbox.addEventListener('change', () => {
        this.updateFilters(container);
      });
    });
    
    // Add a button to reset all filters
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Filters';
    resetButton.style.marginTop = '10px';
    resetButton.style.padding = '5px';
    resetButton.addEventListener('click', () => {
      // Check all checkboxes
      filterContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = true;
      });
      this.updateFilters(container);
    });
    
    filterContainer.appendChild(resetButton);
    container.appendChild(filterContainer);
  }

  /**
   * Updates the visualization based on the selected filters
   * @param {Element} container - Container element
   */
  updateFilters(container) {
    // Get all checked filter values
    const checkedFilters = Array.from(
      container.querySelectorAll('.network-filters input[type="checkbox"]:checked')
    ).map(checkbox => checkbox.value);
    
    // Update node visibility
    d3.select(container).selectAll('.node')
      .style('opacity', d => {
        return checkedFilters.includes(d.mainPriorityArea) ? 1 : 0.1;
      });
    
    // Update link visibility
    d3.select(container).selectAll('line')
      .style('opacity', d => {
        return (checkedFilters.includes(d.source.mainPriorityArea) && 
                checkedFilters.includes(d.target.mainPriorityArea)) ? 0.6 : 0.1;
      });
  }

  /**
   * Calculates the radius of a node based on its properties
   * @param {Object} node - Node data
   * @returns {number} - Node radius
   */
  getNodeRadius(node) {
    // Scale node size based on number of publications
    return this.config.nodeSize + Math.sqrt(node.publications) * 2;
  }

  /**
   * Shortens a name for display
   * @param {string} name - Full name
   * @returns {string} - Shortened name
   */
  shortenName(name) {
    // Split the name into parts
    const parts = name.split(' ');
    
    // If only one part, return it
    if (parts.length === 1) return parts[0];
    
    // Otherwise, use first initial + last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    
    return `${firstName.charAt(0)}. ${lastName}`;
  }

  /**
   * Event handler for drag start
   * @param {Event} event - D3 drag event
   */
  dragstarted(event) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  /**
   * Event handler for drag
   * @param {Event} event - D3 drag event
   */
  dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  /**
   * Event handler for drag end
   * @param {Event} event - D3 drag event
   */
  dragended(event) {
    if (!event.active) this.simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  /**
   * Creates a CSV file with co-authorship data for download
   * @returns {string} - CSV data URL
   */
  exportNetworkCSV() {
    // Create CSV header
    let csv = 'Source,Target,Weight,Papers\n';
    
    // Add rows for each link
    this.links.forEach(link => {
      csv += `"${link.source}","${link.target}",${link.strength},"${link.papers.join('; ')}"\n`;
    });
    
    // Create data URL
    const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    
    return dataUrl;
  }

  /**
   * Creates a JSON file with network data for download
   * @returns {string} - JSON data URL
   */
  exportNetworkJSON() {
    const data = {
      nodes: Array.from(this.authors.values()).map(author => ({
        id: author.id,
        name: author.name,
        publications: author.publications.length,
        coauthors: Array.from(author.coauthors),
        mainPriorityArea: author.mainPriorityArea,
        priorityAreas: author.priorityAreas
      })),
      links: this.links.map(link => ({
        source: link.source,
        target: link.target,
        strength: link.strength,
        papers: link.papers
      })),
      clusters: this.clusters
    };
    
    // Create data URL
    const dataUrl = 'data:application/json;charset=utf-8,' + 
      encodeURIComponent(JSON.stringify(data, null, 2));
    
    return dataUrl;
  }
}

// Standalone function to generate co-authorship network from profile URLs
async function createCoauthorNetwork(profileUrls, containerId, options = {}) {
  const network = new CoauthorNetwork(options);
  
  // Fetch data from all profile URLs
  for (const url of profileUrls) {
    await network.addStaffMember(url);
  }
  
  // Build the network
  network.buildNetwork();
  
  // Identify clusters
  network.identifyClusters();
  
  // Visualize the network
  network.visualize(containerId);
  
  return network;
}

// Export for use in other scripts
window.CoauthorNetwork = CoauthorNetwork;
window.createCoauthorNetwork = createCoauthorNetwork;