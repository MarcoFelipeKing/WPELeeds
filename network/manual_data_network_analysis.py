import os
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
import re
from collections import defaultdict
import plotly.graph_objects as go
import plotly.express as px
import numpy as np
from datetime import datetime

# Define UKRI priority areas with relevant keywords
UKRI_PRIORITIES = {
    "AI and Robotics": ["artificial intelligence", "machine learning", "robotics", "automation", "neural network", "ai ", "algorithm"],
    "Climate Resilience": ["climate", "resilience", "adaptation", "sustainability", "net zero", "carbon", "environment", "flood", "drought", "climate change"],
    "Advanced Materials": ["materials", "composites", "nanomaterials", "concrete", "steel", "polymer", "alloy"],
    "Infrastructure Systems": ["infrastructure", "construction", "building", "transport", "water", "urban", "city", "pipe", "road", "bridge"],
    "Energy Systems": ["energy", "renewable", "power", "grid", "efficiency", "electricity", "solar", "wind", "battery"]
}

class ManualCoauthorNetwork:
    def __init__(self, data_folder="./data"):
        """Initialize with the folder containing CSV files."""
        self.data_folder = data_folder
        self.papers_data = {}
        self.grants_data = {}
        self.staff_names = []
        self.coauthor_network = nx.Graph()
        self.ukri_focus = defaultdict(lambda: defaultdict(int))
        self.grants_by_area = defaultdict(list)
        
    def load_data(self):
        """Load all CSV files from the data folder."""
        print("Loading data files...")
        
        # Create data folder if it doesn't exist
        if not os.path.exists(self.data_folder):
            os.makedirs(self.data_folder)
            print(f"Created data folder at {self.data_folder}")
            print("Please place your CSV files in this folder and run again")
            return False
        
        # Get all CSV files
        files = [f for f in os.listdir(self.data_folder) if f.endswith('.csv')]
        
        if not files:
            print("No CSV files found in the data folder")
            return False
        
        # Process each CSV file
        for file in files:
            try:
                file_path = os.path.join(self.data_folder, file)
                
                # Determine if it's papers or grants
                if file.startswith('papers_'):
                    staff_name = file.replace('papers_', '').replace('.csv', '')
                    self.papers_data[staff_name] = pd.read_csv(file_path, encoding='utf-8')
                    if staff_name not in self.staff_names:
                        self.staff_names.append(staff_name)
                        
                elif file.startswith('grants_'):
                    staff_name = file.replace('grants_', '').replace('.csv', '')
                    self.grants_data[staff_name] = pd.read_csv(file_path, encoding='utf-8')
                    if staff_name not in self.staff_names:
                        self.staff_names.append(staff_name)
            except Exception as e:
                print(f"Error loading file {file}: {e}")
        
        print(f"Loaded data for {len(self.staff_names)} staff members")
        return len(self.staff_names) > 0
    
    def build_network(self):
        """Build co-author network from papers data."""
        print("Building co-author network...")
        
        # Add staff nodes
        for staff_name in self.staff_names:
            self.coauthor_network.add_node(staff_name, staff=True)
            
            # Process papers if available
            if staff_name in self.papers_data:
                papers_df = self.papers_data[staff_name]
                
                # Update node with publication count
                paper_count = len(papers_df)
                self.coauthor_network.nodes[staff_name]['publications'] = paper_count
                
                # Process each paper
                for _, paper in papers_df.iterrows():
                    # Get paper title for UKRI classification
                    title = str(paper.get('Title', ''))
                    
                    # Classify by UKRI area
                    ukri_areas = self.classify_ukri(title)
                    
                    # Update staff member's UKRI focus
                    for area in ukri_areas:
                        self.ukri_focus[staff_name][area] += 1
                    
                    # Process co-authors if available
                    authors_col = None
                    for col in ['Authors', 'Author full names']:
                        if col in paper and not pd.isna(paper[col]):
                            authors_col = col
                            break
                    
                    if authors_col is not None:
                        # Split authors based on common separators
                        author_text = str(paper[authors_col])
                        
                        # Detect the separator (semicolon, comma, or other)
                        if ';' in author_text:
                            authors = [a.strip() for a in author_text.split(';')]
                        elif ',' in author_text and author_text.count(',') > 2:  # Likely a list of authors
                            authors = [a.strip() for a in author_text.split(',')]
                        else:
                            # Try to extract names with regex
                            authors = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', author_text)
                        
                        # Add co-authorship relationships
                        for i in range(len(authors)):
                            author1 = authors[i]
                            
                            # Skip if this is not the staff member
                            if not any(staff in author1 for staff in self.staff_names):
                                # Add as non-staff node
                                if author1 not in self.coauthor_network:
                                    self.coauthor_network.add_node(author1, staff=False)
                            
                            for j in range(i+1, len(authors)):
                                author2 = authors[j]
                                
                                # Add edge with weight
                                if self.coauthor_network.has_edge(author1, author2):
                                    self.coauthor_network[author1][author2]['weight'] += 1
                                else:
                                    self.coauthor_network.add_edge(author1, author2, weight=1)
        
        # Process grants data
        for staff_name in self.staff_names:
            if staff_name in self.grants_data:
                grants_df = self.grants_data[staff_name]
                
                # Update node with grant count
                grant_count = len(grants_df)
                self.coauthor_network.nodes[staff_name]['grants'] = grant_count
                
                # Process each grant
                for _, grant in grants_df.iterrows():
                    # Get grant details
                    title = str(grant.get('Title', ''))
                    funder = str(grant.get('Funder', ''))
                    
                    # Only process UKRI grants
                    if 'UKRI' in funder or 'UK Research' in funder:
                        # Classify by UKRI area
                        ukri_areas = self.classify_ukri(title)
                        
                        # Update grant tracking
                        for area in ukri_areas:
                            self.grants_by_area[area].append({
                                'title': title,
                                'staff': staff_name,
                                'year': grant.get('Start year', 'Unknown')
                            })
                            
                            # Give double weight to grants in the UKRI focus
                            self.ukri_focus[staff_name][area] += 2
        
        print(f"Network built with {self.coauthor_network.number_of_nodes()} nodes and {self.coauthor_network.number_of_edges()} edges")
        return True
    
    def classify_ukri(self, text):
        """Classify text into UKRI priority areas based on keywords."""
        text = text.lower()
        relevant_areas = []
        
        # Check for keyword matches
        for area, keywords in UKRI_PRIORITIES.items():
            for keyword in keywords:
                if keyword.lower() in text:
                    relevant_areas.append(area)
                    break
        
        # If no match found, classify as "Other"
        if not relevant_areas:
            relevant_areas = ["Other"]
            
        return relevant_areas
    
    def analyze_network(self):
        """Analyze the co-author network and return key metrics."""
        print("Analyzing network...")
        
        results = {}
        
        # Basic network metrics
        results['num_nodes'] = self.coauthor_network.number_of_nodes()
        results['num_edges'] = self.coauthor_network.number_of_edges()
        results['density'] = nx.density(self.coauthor_network)
        
        # Connected components
        components = list(nx.connected_components(self.coauthor_network))
        results['num_components'] = len(components)
        results['largest_component_size'] = len(max(components, key=len))
        
        # Centrality measures (for staff only)
        staff_subgraph = self.coauthor_network.subgraph([node for node, attrs in 
                              self.coauthor_network.nodes(data=True) if attrs.get('staff', False)])
        
        try:
            results['degree_centrality'] = nx.degree_centrality(staff_subgraph)
            results['betweenness_centrality'] = nx.betweenness_centrality(staff_subgraph)
            results['eigenvector_centrality'] = nx.eigenvector_centrality(staff_subgraph, max_iter=1000)
        except:
            print("Warning: Could not compute all centrality measures, network may be too small or disconnected")
            # Fallback to just degree centrality
            results['degree_centrality'] = {node: staff_subgraph.degree(node) / max(1, len(staff_subgraph)-1) 
                                         for node in staff_subgraph.nodes()}
        
        # UKRI coverage analysis
        results['ukri_coverage'] = self.analyze_ukri_coverage()
        
        return results
    
    def analyze_ukri_coverage(self):
        """Analyze the coverage of UKRI priority areas in the network."""
        coverage = {area: 0 for area in UKRI_PRIORITIES.keys()}
        coverage["Other"] = 0
        
        # Count staff with expertise in each area
        for staff_name, areas in self.ukri_focus.items():
            for area, count in areas.items():
                coverage[area] += 1
                
        return coverage
    
    def identify_collaboration_opportunities(self):
        """Identify potential collaboration opportunities based on UKRI areas."""
        opportunities = []
        
        # Find pairs of researchers who work in complementary UKRI areas but don't collaborate
        staff_nodes = [node for node, attrs in self.coauthor_network.nodes(data=True) if attrs.get('staff', False)]
        
        for i in range(len(staff_nodes)):
            for j in range(i+1, len(staff_nodes)):
                researcher1 = staff_nodes[i]
                researcher2 = staff_nodes[j]
                
                # Skip if they already collaborate
                if self.coauthor_network.has_edge(researcher1, researcher2):
                    continue
                
                # Get their UKRI areas
                areas1 = set(self.ukri_focus.get(researcher1, {}).keys())
                areas2 = set(self.ukri_focus.get(researcher2, {}).keys())
                
                # Check if they have complementary expertise
                if areas1 and areas2 and areas1 != areas2 and (areas1.intersection(areas2) or 
                                                           len(areas1.union(areas2)) >= 3):
                    opportunities.append({
                        'researcher1': researcher1,
                        'researcher2': researcher2,
                        'areas1': list(areas1),
                        'areas2': list(areas2),
                        'potential_areas': list(areas1.symmetric_difference(areas2))
                    })
        
        return opportunities
    
    def visualize_network(self, output_file="coauthor_network.html", max_nodes=500):
        """Create an interactive network visualization using Plotly with node limiting for large networks."""
        print(f"Creating network visualization: {output_file}")
        
        # For very large networks, limit to important nodes
        G = self.coauthor_network
        if G.number_of_nodes() > max_nodes:
            print(f"Network is very large ({G.number_of_nodes()} nodes). Limiting visualization to {max_nodes} important nodes.")
            
            # Prioritize staff nodes and nodes with high degree
            staff_nodes = [node for node, attrs in G.nodes(data=True) if attrs.get('staff', False)]
            
            # Get non-staff nodes by degree
            other_nodes = [node for node, attrs in G.nodes(data=True) if not attrs.get('staff', False)]
            other_nodes.sort(key=lambda x: G.degree(x), reverse=True)
            
            # Select top nodes
            selected_nodes = staff_nodes + other_nodes[:max_nodes - len(staff_nodes)]
            
            # Create subgraph
            G = G.subgraph(selected_nodes)
            print(f"Reduced to {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
        
        # Create nodes and edges for visualization without using spring_layout
        nodes = []
        for node in G.nodes():
            nodes.append({
                'id': node,
                'label': node,
                'staff': G.nodes[node].get('staff', False),
                'publications': G.nodes[node].get('publications', 0),
                'grants': G.nodes[node].get('grants', 0),
                'ukri_areas': list(self.ukri_focus.get(node, {}).keys())
            })
        
        edges = []
        for u, v, data in G.edges(data=True):
            edges.append({
                'source': u,
                'target': v,
                'weight': data.get('weight', 1)
            })
        
        # Create a Plotly Figure using a force-directed layout in JavaScript
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Co-author Network Visualization</title>
            <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
            <style>
                body { margin: 0; font-family: Arial, sans-serif; }
                #chart { width: 100%; height: 100vh; }
                .tooltip {
                    position: absolute;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    font-size: 12px;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
            </style>
        </head>
        <body>
            <div id="chart"></div>
            <div class="tooltip"></div>
            
            <script>
            // Network data
            const nodes = """ + str(nodes).replace("'", '"') + """;
            const links = """ + str(edges).replace("'", '"') + """;
            
            // Create a D3 force simulation
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
                
            const tooltip = d3.select(".tooltip");
                
            // Add zoom behavior
            const g = svg.append("g");
            svg.call(d3.zoom().on("zoom", (event) => {
                g.attr("transform", event.transform);
            }));
            
            // Create the simulation
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(50))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("center", d3.forceCenter(width / 2, height / 2));
                
            // Add links
            const link = g.append("g")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", d => Math.sqrt(d.weight));
                
            // Add nodes
            const node = g.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", d => d.staff ? 8 : 4)
                .attr("fill", d => d.staff ? "#1f77b4" : "#dddddd")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("mouseover", function(event, d) {
                    tooltip.style("opacity", 1);
                    let html = `<strong>${d.label}</strong><br>`;
                    html += `Staff: ${d.staff ? "Yes" : "No"}<br>`;
                    if (d.publications) html += `Publications: ${d.publications}<br>`;
                    if (d.grants) html += `Grants: ${d.grants}<br>`;
                    if (d.ukri_areas && d.ukri_areas.length) {
                        html += `UKRI Areas: ${d.ukri_areas.join(", ")}<br>`;
                    }
                    tooltip.html(html)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });
                
            // Add labels for staff
            const labels = g.append("g")
                .selectAll("text")
                .data(nodes.filter(d => d.staff))
                .enter()
                .append("text")
                .text(d => d.label)
                .attr("font-size", 10)
                .attr("dx", 12)
                .attr("dy", 4);
                
            // Update positions
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                    
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                    
                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });
            
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
            </script>
        </body>
        </html>
        """
        
        # Save to HTML file
        with open(output_file, "w") as f:
            f.write(html)
            
        print(f"Network visualization saved to {output_file}")
    
    def create_ukri_heatmap(self, output_file="ukri_heatmap.html"):
        """Create a heatmap of staff expertise in UKRI priority areas."""
        print(f"Creating UKRI heatmap: {output_file}")
        
        # Skip if no UKRI data
        if not self.ukri_focus:
            print("No UKRI data available for heatmap")
            return
        
        # Prepare data
        staff_names = list(self.ukri_focus.keys())
        ukri_areas = list(UKRI_PRIORITIES.keys()) + ["Other"]
        heatmap_data = []
        
        for staff_name in staff_names:
            row = []
            for area in ukri_areas:
                row.append(self.ukri_focus[staff_name].get(area, 0))
            heatmap_data.append(row)
        
        # Create heatmap
        fig = go.Figure(data=go.Heatmap(
                z=heatmap_data,
                x=ukri_areas,
                y=staff_names,
                colorscale='Blues',
                hoverongaps=False))
        
        fig.update_layout(
            title='Staff Expertise in UKRI Priority Areas',
            xaxis_title='UKRI Priority Area',
            yaxis_title='Staff Member',
            height=max(600, len(staff_names) * 20))
        
        # Save to HTML file
        fig.write_html(output_file)
        print(f"UKRI heatmap saved to {output_file}")
    
    def generate_report(self, output_file="report.html"):
        """Generate a comprehensive HTML report of the analysis."""
        print(f"Generating analysis report: {output_file}")
        
        # Perform analysis
        analysis = self.analyze_network()
        opportunities = self.identify_collaboration_opportunities()
        
        # Create report HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Co-author Network Analysis Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1, h2, h3 {{ color: #333366; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                tr:nth-child(even) {{ background-color: #f9f9f9; }}
                .metric {{ font-weight: bold; }}
                .section {{ margin-bottom: 30px; }}
            </style>
        </head>
        <body>
            <h1>Co-author Network Analysis Report</h1>
            <h2>School of Civil Engineering, University of Leeds</h2>
            <p>Generated on {datetime.now().strftime("%Y-%m-%d")}</p>
            
            <div class="section">
                <h2>Network Overview</h2>
                <p><span class="metric">Number of nodes:</span> {analysis['num_nodes']}</p>
                <p><span class="metric">Number of edges:</span> {analysis['num_edges']}</p>
                <p><span class="metric">Network density:</span> {analysis['density']:.4f}</p>
                <p><span class="metric">Number of connected components:</span> {analysis['num_components']}</p>
                <p><span class="metric">Largest component size:</span> {analysis['largest_component_size']}</p>
            </div>
            
            <div class="section">
                <h2>Staff Centrality Measures</h2>
                <table>
                    <tr>
                        <th>Staff Member</th>
                        <th>Degree Centrality</th>
                        <th>Betweenness Centrality</th>
                        <th>Eigenvector Centrality</th>
                    </tr>
        """
        
        # Add centrality measures
        if 'degree_centrality' in analysis:
            for staff in sorted(analysis['degree_centrality'], 
                              key=lambda x: analysis['degree_centrality'][x], 
                              reverse=True):
                betweenness = analysis.get('betweenness_centrality', {}).get(staff, 0)
                eigenvector = analysis.get('eigenvector_centrality', {}).get(staff, 0)
                
                html += f"""
                        <tr>
                            <td>{staff}</td>
                            <td>{analysis['degree_centrality'][staff]:.4f}</td>
                            <td>{betweenness:.4f}</td>
                            <td>{eigenvector:.4f}</td>
                        </tr>
                """
        
        html += """
                </table>
            </div>
            
            <div class="section">
                <h2>UKRI Priority Areas Coverage</h2>
                <table>
                    <tr>
                        <th>UKRI Priority Area</th>
                        <th>Number of Staff with Expertise</th>
                    </tr>
        """
        
        # Add UKRI coverage
        for area, count in sorted(analysis['ukri_coverage'].items(), 
                                key=lambda x: x[1], 
                                reverse=True):
            html += f"""
                    <tr>
                        <td>{area}</td>
                        <td>{count}</td>
                    </tr>
            """
        
        html += """
                </table>
            </div>
            
            <div class="section">
                <h2>Collaboration Opportunities</h2>
        """
        
        # Add collaboration opportunities
        if opportunities:
            html += """
                <table>
                    <tr>
                        <th>Researcher 1</th>
                        <th>Researcher 2</th>
                        <th>Researcher 1 Areas</th>
                        <th>Researcher 2 Areas</th>
                        <th>Potential Collaboration Areas</th>the
                    </tr>
            """
            
            for opp in sorted(opportunities, 
                            key=lambda x: len(x['potential_areas']), 
                            reverse=True)[:20]:  # Show top 20 opportunities
                html += f"""
                        <tr>
                            <td>{opp['researcher1']}</td>
                            <td>{opp['researcher2']}</td>
                            <td>{', '.join(opp['areas1'])}</td>
                            <td>{', '.join(opp['areas2'])}</td>
                            <td>{', '.join(opp['potential_areas'])}</td>
                        </tr>
                """
            
            html += """
                </table>
            """
        else:
            html += "<p>No significant collaboration opportunities identified.</p>"
        
        html += """
            </div>
            
            <div class="section">
                <h2>UKRI Grants Distribution</h2>
                <table>
                    <tr>
                        <th>UKRI Priority Area</th>
                        <th>Number of Grants</th>
                        <th>Recent Examples</th>
                    </tr>
        """
        
        # Add grants by UKRI area
        for area, grants in sorted(self.grants_by_area.items(), 
                                 key=lambda x: len(x[1]), 
                                 reverse=True):
            # Take up to 3 recent examples
            example_grants = sorted(grants, key=lambda x: str(x.get('year', '')), reverse=True)[:3]
            example_text = "<br>".join([f"{g['title']} ({g['year']})" for g in example_grants])
            
            html += f"""
                    <tr>
                        <td>{area}</td>
                        <td>{len(grants)}</td>
                        <td>{example_text}</td>
                    </tr>
            """
        
        html += """
                </table>
            </div>
            
            <div class="section">
                <h2>Recommendations</h2>
                <ol>
                    <li>Organize workshops focusing on the UKRI priority areas with lowest coverage to stimulate research in these directions.</li>
                    <li>Facilitate meetings between researchers identified in the collaboration opportunities section.</li>
                    <li>Consider strategic hires in UKRI priority areas with limited coverage.</li>
                    <li>Develop incentives for cross-disciplinary collaborations aligning with UKRI priorities.</li>
                    <li>Monitor the evolution of the co-author network over time to assess the impact of interventions.</li>
                </ol>
            </div>
            
            <div class="section">
                <h2>Visualizations</h2>
                <p>Please refer to the following files for interactive visualizations:</p>
                <ul>
                    <li><a href="coauthor_network.html">Co-author Network Visualization</a></li>
                    <li><a href="ukri_heatmap.html">UKRI Priority Areas Heatmap</a></li>
                </ul>
            </div>
        </body>
        </html>
        """
        
        # Write report to file
        with open(output_file, "w") as f:
            f.write(html)
            
        print(f"Analysis report saved to {output_file}")
    
    def create_ukri_bar_chart(self, output_file="ukri_bar_chart.html"):
        """Create a bar chart showing UKRI area distribution."""
        print(f"Creating UKRI bar chart: {output_file}")
        
        # Skip if no UKRI data
        if not self.ukri_focus:
            print("No UKRI data available for bar chart")
            return
        
        # Aggregate data by UKRI area
        area_counts = defaultdict(int)
        for staff, areas in self.ukri_focus.items():
            for area, count in areas.items():
                area_counts[area] += count
        
        # Prepare data for visualization
        areas = list(area_counts.keys())
        counts = list(area_counts.values())
        
        # Sort by count
        sorted_indices = np.argsort(counts)[::-1]
        areas = [areas[i] for i in sorted_indices]
        counts = [counts[i] for i in sorted_indices]
        
        # Create bar chart
        fig = go.Figure(data=[
            go.Bar(
                x=areas,
                y=counts,
                marker_color=['#1f77b4' if area != 'Other' else '#7f7f7f' for area in areas]
            )
        ])
        
        fig.update_layout(
            title='UKRI Priority Areas Distribution',
            xaxis_title='UKRI Priority Area',
            yaxis_title='Publication + Grant Count',
            height=500
        )
        
        # Save to HTML file
        fig.write_html(output_file)
        print(f"UKRI bar chart saved to {output_file}")
    
    def run_analysis(self):
        """Run the complete analysis pipeline."""
        # Load data
        if not self.load_data():
            return False
        
        # Build network
        if not self.build_network():
            return False
        
        # Generate visualizations
        self.visualize_network()
        self.visualize_focused_network()  # Add this line
        self.create_ukri_heatmap()
        self.create_ukri_bar_chart()
        
        # Generate report
        self.generate_report()
        
        print("Analysis complete!")
        return True
    
    def build_focused_network(self):
        """Build a focused co-author network that emphasizes connections between Leeds Civil Engineering staff."""
        print("Building Leeds Civil Engineering focused network...")
        
        # Create a new graph for the focused network
        focused_network = nx.Graph()
        
        # Add staff nodes - these are the Leeds Civil Engineering staff
        for staff_name in self.staff_names:
            focused_network.add_node(staff_name, staff=True)
            
            # Copy node attributes from main network if available
            if staff_name in self.coauthor_network.nodes():
                for key, value in self.coauthor_network.nodes[staff_name].items():
                    focused_network.nodes[staff_name][key] = value
                    
        # Add direct connections between staff members
        for i in range(len(self.staff_names)):
            for j in range(i+1, len(self.staff_names)):
                staff1 = self.staff_names[i]
                staff2 = self.staff_names[j]
                
                # Check if they collaborate in the main network
                if self.coauthor_network.has_edge(staff1, staff2):
                    # Copy the edge with its attributes
                    focused_network.add_edge(
                        staff1, staff2, 
                        weight=self.coauthor_network[staff1][staff2].get('weight', 1)
                    )
        
        # Calculate shortest paths between staff members through other collaborators
        # This helps identify potential "bridge" collaborators
        bridge_collaborators = defaultdict(int)
        
        for i in range(len(self.staff_names)):
            for j in range(i+1, len(self.staff_names)):
                staff1 = self.staff_names[i]
                staff2 = self.staff_names[j]
                
                # Skip if they already collaborate directly
                if focused_network.has_edge(staff1, staff2):
                    continue
                    
                # Try to find paths between them in the main network
                try:
                    # Get shortest path
                    path = nx.shortest_path(self.coauthor_network, staff1, staff2)
                    
                    # Increment bridge value for intermediaries
                    for node in path[1:-1]:  # Exclude start and end nodes
                        bridge_collaborators[node] += 1
                except:
                    # No path exists
                    pass
        
        # Add top bridge collaborators
        top_bridges = sorted(bridge_collaborators.items(), key=lambda x: x[1], reverse=True)[:50]
        for collaborator, bridge_value in top_bridges:
            # Add node
            focused_network.add_node(collaborator, staff=False, bridge_value=bridge_value)
            
            # Add connections to staff
            for staff in self.staff_names:
                if self.coauthor_network.has_edge(staff, collaborator):
                    focused_network.add_edge(
                        staff, collaborator,
                        weight=self.coauthor_network[staff][collaborator].get('weight', 1)
                    )
        
        print(f"Focused network built with {focused_network.number_of_nodes()} nodes and {focused_network.number_of_edges()} edges")
        return focused_network

    def visualize_focused_network(self, output_file="leeds_network.html"):
        """Create a visualization focused on Leeds Civil Engineering staff connections."""
        print(f"Creating Leeds-focused network visualization: {output_file}")
        
        # Build the focused network
        focused_network = self.build_focused_network()
        
        # Create node and edge data for visualization
        nodes_data = []
        for node in focused_network.nodes():
            # Convert node name to string and escape any quotes
            node_name = str(node).replace('"', '\\"')
            
            # Get UKRI areas as a list of strings
            ukri_areas = list(self.ukri_focus.get(node, {}).keys())
            ukri_areas_str = '[' + ', '.join(f'"{area}"' for area in ukri_areas) + ']'
            
            # Determine node type and color
            is_staff = focused_network.nodes[node].get('staff', False)
            is_bridge = 'bridge_value' in focused_network.nodes[node]
            
            if is_staff:
                node_type = '"staff"'
                node_color = '"#1f77b4"'  # Blue for staff
            elif is_bridge:
                node_type = '"bridge"'
                node_color = '"#ff7f0e"'  # Orange for bridge collaborators
            else:
                node_type = '"other"'
                node_color = '"#dddddd"'  # Gray for other collaborators
                
            # Create node data
            nodes_data.append(
                f'{{"id": "{node_name}", '
                f'"label": "{node_name}", '
                f'"type": {node_type}, '
                f'"color": {node_color}, '
                f'"publications": {focused_network.nodes[node].get("publications", 0)}, '
                f'"grants": {focused_network.nodes[node].get("grants", 0)}, '
                f'"bridge_value": {focused_network.nodes[node].get("bridge_value", 0)}, '
                f'"ukri_areas": {ukri_areas_str}}}'
            )
        
        edges_data = []
        for u, v, data in focused_network.edges(data=True):
            # Convert node names to strings and escape any quotes
            source = str(u).replace('"', '\\"')
            target = str(v).replace('"', '\\"')
            
            # Create edge data
            edges_data.append(
                f'{{"source": "{source}", '
                f'"target": "{target}", '
                f'"weight": {data.get("weight", 1)}}}'
            )
        
        # Create a force-directed visualization using D3.js
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Leeds Civil Engineering Co-author Network</title>
            <script src="https://d3js.org/d3.v7.min.js"></script>
            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                }
                #chart {
                    width: 100vw;
                    height: 100vh;
                    background-color: #f9f9f9;
                }
                .tooltip {
                    position: absolute;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    font-size: 12px;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                    max-width: 300px;
                }
                .controls {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                }
                .controls div {
                    margin-bottom: 10px;
                }
                .legend {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                }
                .legend-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                }
                .legend-color {
                    width: 15px;
                    height: 15px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .title {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    padding: 10px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div id="chart"></div>
            <div class="tooltip"></div>
            <div class="title">Leeds Civil Engineering Co-author Network</div>
            <div class="controls">
                <div>
                    <label for="charge-slider">Force strength: </label>
                    <input type="range" id="charge-slider" min="-500" max="-10" value="-120">
                </div>
                <div>
                    <label for="link-distance-slider">Link distance: </label>
                    <input type="range" id="link-distance-slider" min="10" max="300" value="100">
                </div>
                <div>
                    <label for="show-labels">Show labels: </label>
                    <input type="checkbox" id="show-labels" checked>
                </div>
                <div>
                    <label for="node-filter">Show nodes: </label>
                    <select id="node-filter">
                        <option value="all">All</option>
                        <option value="staff">Staff only</option>
                        <option value="staff-bridge">Staff + bridge collaborators</option>
                    </select>
                </div>
            </div>
            <div class="legend">
                <div class="legend-title">Legend</div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #1f77b4;"></div>
                    <div>Leeds Civil Engineering Staff</div>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #ff7f0e;"></div>
                    <div>Bridge Collaborators</div>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #dddddd;"></div>
                    <div>Other Collaborators</div>
                </div>
            </div>
            
            <script>
            // Network data
            const nodes = [""" + ",\n".join(nodes_data) + """];
            const links = [""" + ",\n".join(edges_data) + """];
            
            // Create a mapping of node IDs to indices
            const nodeIdToIndex = {};
            nodes.forEach((node, index) => {
                nodeIdToIndex[node.id] = index;
            });
            
            // Convert link source/target from IDs to indices
            const formattedLinks = links.map(link => ({
                source: nodeIdToIndex[link.source],
                target: nodeIdToIndex[link.target],
                weight: link.weight
            }));
            
            // Create a D3 force simulation
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            const svg = d3.select("#chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height);
                
            const tooltip = d3.select(".tooltip");
            
            // Add zoom behavior
            const g = svg.append("g");
            svg.call(d3.zoom()
                .extent([[0, 0], [width, height]])
                .scaleExtent([0.1, 8])
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                }));
            
            // Create the simulation
            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(formattedLinks).distance(100))
                .force("charge", d3.forceManyBody().strength(-120))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("x", d3.forceX(width / 2).strength(0.01))
                .force("y", d3.forceY(height / 2).strength(0.01));
                
            // Add links
            const link = g.append("g")
                .selectAll("line")
                .data(formattedLinks)
                .enter()
                .append("line")
                .attr("stroke", "#aaa")
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", d => Math.sqrt(d.weight) * 0.7);
                
            // Node size based on type
            function getNodeSize(d) {
                if (d.type === "staff") return 10;
                if (d.type === "bridge") return 7;
                return 4;
            }
            
            // Add nodes
            const node = g.append("g")
                .selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", getNodeSize)
                .attr("fill", d => d.color)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("mouseover", function(event, d) {
                    tooltip.style("opacity", 1);
                    let html = `<strong>${d.label}</strong><br>`;
                    html += `Type: ${d.type === "staff" ? "Leeds Staff" : (d.type === "bridge" ? "Bridge Collaborator" : "Collaborator")}<br>`;
                    
                    if (d.publications) html += `Publications: ${d.publications}<br>`;
                    if (d.grants) html += `Grants: ${d.grants}<br>`;
                    if (d.bridge_value > 0) html += `Bridge value: ${d.bridge_value}<br>`;
                    
                    if (d.ukri_areas && d.ukri_areas.length) {
                        html += `UKRI Areas: ${d.ukri_areas.join(", ")}<br>`;
                    }
                    
                    tooltip.html(html)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });
                
            // Add labels for staff and bridges
            const labels = g.append("g")
                .selectAll("text")
                .data(nodes.filter(d => d.type !== "other"))
                .enter()
                .append("text")
                .text(d => d.label)
                .attr("font-size", d => d.type === "staff" ? 10 : 8)
                .attr("dx", 12)
                .attr("dy", 4);
                
            // Update positions
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                    
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                    
                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });
            
            // UI controls
            d3.select("#charge-slider").on("input", function() {
                const value = +this.value;
                simulation.force("charge").strength(value);
                simulation.alpha(0.3).restart();
            });
            
            d3.select("#link-distance-slider").on("input", function() {
                const value = +this.value;
                simulation.force("link").distance(value);
                simulation.alpha(0.3).restart();
            });
            
            d3.select("#show-labels").on("change", function() {
                const checked = this.checked;
                labels.style("display", checked ? "block" : "none");
            });
            
            d3.select("#node-filter").on("change", function() {
                const value = this.value;
                
                if (value === "all") {
                    node.style("visibility", "visible");
                    link.style("visibility", "visible");
                } else if (value === "staff") {
                    // Show only staff nodes and their links
                    node.style("visibility", d => d.type === "staff" ? "visible" : "hidden");
                    link.style("visibility", d => {
                        const sourceType = nodes[d.source.index].type;
                        const targetType = nodes[d.target.index].type;
                        return sourceType === "staff" && targetType === "staff" ? "visible" : "hidden";
                    });
                } else if (value === "staff-bridge") {
                    // Show staff and bridge nodes
                    node.style("visibility", d => d.type === "other" ? "hidden" : "visible");
                    link.style("visibility", d => {
                        const sourceType = nodes[d.source.index].type;
                        const targetType = nodes[d.target.index].type;
                        return sourceType !== "other" || targetType !== "other" ? "visible" : "hidden";
                    });
                }
                
                // Restart simulation
                simulation.alpha(0.3).restart();
            });
            
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
            </script>
        </body>
        </html>
        """
        
        # Save to HTML file
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(html)
            
        print(f"Leeds-focused network visualization saved to {output_file}")

def main():
    analyzer = ManualCoauthorNetwork()
    analyzer.run_analysis()

if __name__ == "__main__":
    main()