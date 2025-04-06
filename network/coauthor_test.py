import requests
import json
import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
from collections import defaultdict
import os

# Your Scopus API key
API_KEY = "6cd1b3e9bd28cd81b99fd1bdd92bcf09"

# Headers for API requests
HEADERS = {
    "X-ELS-APIKey": API_KEY,
    "Accept": "application/json"
}

# Define UKRI priority areas with relevant keywords
UKRI_PRIORITIES = {
    "AI and Robotics": ["artificial intelligence", "machine learning", "robotics", "automation"],
    "Climate Resilience": ["climate", "resilience", "adaptation", "sustainability", "net zero"],
    "Advanced Materials": ["materials", "composites", "nanomaterials", "concrete", "steel"],
    "Infrastructure Systems": ["infrastructure", "construction", "building", "transport", "water"],
    "Energy Systems": ["energy", "renewable", "power", "grid", "efficiency"]
}

def fetch_author_id(author_name):
    """Get Scopus Author ID for a given name."""
    query = f"AUTHNAME({author_name})"
    params = {
        "query": query, 
        "field": "dc:identifier,preferred-name",
        "count": 1
    }
    
    try:
        response = requests.get(
            "https://api.elsevier.com/content/search/author",
            headers=HEADERS,
            params=params
        )
        
        if response.status_code != 200:
            print(f"Author search failed for {author_name} with status code: {response.status_code}")
            return None
            
        data = response.json()
        
        if "search-results" in data and "entry" in data["search-results"]:
            entries = data["search-results"]["entry"]
            if entries:
                author_id = entries[0]["dc:identifier"].split(":")[-1]
                return author_id
        return None
    except Exception as e:
        print(f"Error fetching author ID for {author_name}: {e}")
        return None

def fetch_publications(author_id, max_papers=20):
    """Fetch publications for a given Scopus Author ID."""
    if not author_id:
        return []
        
    params = {
        "query": f"AU-ID({author_id})",
        "field": "dc:title,dc:creator,prism:coverDate,prism:publicationName,authkeywords,dc:description",
        "count": max_papers,
        "sort": "-prism:coverDate"
    }
    
    try:
        response = requests.get(
            "https://api.elsevier.com/content/search/scopus",
            headers=HEADERS,
            params=params
        )
        
        if response.status_code != 200:
            print(f"Publication retrieval failed for author ID {author_id} with status code: {response.status_code}")
            return []
            
        data = response.json()
        
        if "search-results" in data and "entry" in data["search-results"]:
            return data["search-results"]["entry"]
        return []
    except Exception as e:
        print(f"Error fetching publications for author ID {author_id}: {e}")
        return []

def classify_publication_ukri(publication):
    """Classify a publication into UKRI priority areas based on text content."""
    relevant_areas = []
    
    # Combine title, keywords, and abstract for classification
    text_to_analyze = ""
    if 'dc:title' in publication:
        text_to_analyze += publication['dc:title'].lower() + " "
    if 'authkeywords' in publication:
        text_to_analyze += publication['authkeywords'].lower() + " "
    if 'dc:description' in publication:
        text_to_analyze += publication['dc:description'].lower()
    
    # Check for keyword matches
    for area, keywords in UKRI_PRIORITIES.items():
        for keyword in keywords:
            if keyword.lower() in text_to_analyze:
                relevant_areas.append(area)
                break
    
    # If no match found, classify as "Other"
    if not relevant_areas:
        relevant_areas = ["Other"]
        
    return relevant_areas

def run_quick_test(staff_names):
    """Run a quick test with a small set of staff members."""
    print("=== CO-AUTHOR NETWORK QUICK TEST ===")
    print(f"Testing with {len(staff_names)} staff members")
    
    # Create network
    G = nx.Graph()
    
    # Store publications and UKRI focus
    publications = {}
    ukri_focus = defaultdict(lambda: defaultdict(int))
    
    # Process each staff member
    for staff_name in staff_names:
        print(f"\nProcessing {staff_name}...")
        
        # Get author ID
        author_id = fetch_author_id(staff_name)
        if not author_id:
            print(f"  Could not find Scopus Author ID for {staff_name}")
            continue
            
        print(f"  Found Author ID: {author_id}")
        
        # Fetch publications
        staff_pubs = fetch_publications(author_id)
        publications[staff_name] = staff_pubs
        
        print(f"  Retrieved {len(staff_pubs)} publications")
        
        # Add node to network
        G.add_node(staff_name, staff=True, publications=len(staff_pubs))
        
        # Process publications
        for pub in staff_pubs:
            # Classify by UKRI area
            ukri_areas = classify_publication_ukri(pub)
            
            # Update UKRI focus
            for area in ukri_areas:
                ukri_focus[staff_name][area] += 1
            
            # Extract co-authors if available
            if 'dc:creator' in pub:
                creator_text = pub['dc:creator']
                coauthors = [author.strip() for author in creator_text.split(',')]
                
                # Add co-authorship relationships
                for i in range(len(coauthors)):
                    author1 = coauthors[i]
                    
                    # Skip if this is not a staff member (to keep visualization cleaner)
                    if author1 != staff_name and author1 not in staff_names:
                        G.add_node(author1, staff=False)
                        
                    for j in range(i+1, len(coauthors)):
                        author2 = coauthors[j]
                        
                        # Add edge with weight
                        if G.has_edge(author1, author2):
                            G[author1][author2]['weight'] += 1
                        else:
                            G.add_edge(author1, author2, weight=1)
    
    # Print network statistics
    print("\n=== NETWORK STATISTICS ===")
    print(f"Nodes: {G.number_of_nodes()}")
    print(f"Edges: {G.number_of_edges()}")
    
    # Print UKRI focus for each staff member
    print("\n=== UKRI PRIORITY AREAS ===")
    for staff, areas in ukri_focus.items():
        print(f"\n{staff}:")
        for area, count in sorted(areas.items(), key=lambda x: x[1], reverse=True):
            print(f"  {area}: {count} publications")
    
    # Create output directory if it doesn't exist
    os.makedirs("test_output", exist_ok=True)
    
    # Save network visualization
    plt.figure(figsize=(12, 8))
    
    # Define positions
    pos = nx.spring_layout(G, k=0.3, iterations=50, seed=42)
    
    # Draw nodes
    staff_nodes = [node for node, attrs in G.nodes(data=True) if attrs.get('staff', True)]
    non_staff_nodes = [node for node, attrs in G.nodes(data=True) if not attrs.get('staff', True)]
    
    # Draw edges with thickness based on weight
    edge_weights = [G[u][v]['weight'] for u, v in G.edges()]
    
    nx.draw_networkx_edges(G, pos, width=[w/5 for w in edge_weights], alpha=0.5)
    
    # Draw staff nodes larger
    nx.draw_networkx_nodes(G, pos, nodelist=staff_nodes, node_size=500, 
                          node_color='skyblue', alpha=0.8)
    
    # Draw non-staff nodes smaller
    if non_staff_nodes:
        nx.draw_networkx_nodes(G, pos, nodelist=non_staff_nodes, node_size=100, 
                              node_color='lightgray', alpha=0.6)
    
    # Draw labels only for staff
    nx.draw_networkx_labels(G, pos, labels={node: node for node in staff_nodes}, 
                           font_size=10, font_weight='bold')
    
    plt.title("Co-author Network Test")
    plt.axis('off')
    plt.tight_layout()
    
    # Save figure
    plt.savefig("test_output/coauthor_network_test.png", dpi=300)
    print("\nNetwork visualization saved to test_output/coauthor_network_test.png")
    
    # Save UKRI heatmap
    plt.figure(figsize=(12, 6))
    
    # Convert UKRI data to matrix for heatmap
    areas = list(UKRI_PRIORITIES.keys()) + ["Other"]
    staff_list = list(ukri_focus.keys())
    
    # Create matrix
    heatmap_data = []
    for staff in staff_list:
        row = []
        for area in areas:
            row.append(ukri_focus[staff].get(area, 0))
        heatmap_data.append(row)
    
    # Plot heatmap
    plt.imshow(heatmap_data, cmap='Blues')
    plt.colorbar(label='Publication Count')
    
    # Add labels
    plt.yticks(range(len(staff_list)), staff_list)
    plt.xticks(range(len(areas)), areas, rotation=45, ha='right')
    
    plt.title("UKRI Priority Areas by Staff Member")
    plt.tight_layout()
    
    # Save heatmap
    plt.savefig("test_output/ukri_heatmap_test.png", dpi=300)
    print("UKRI heatmap saved to test_output/ukri_heatmap_test.png")
    
    # Save data as JSON for further analysis
    with open("test_output/test_results.json", "w") as f:
        # Convert defaultdict to regular dict for serialization
        ukri_focus_dict = {staff: dict(areas) for staff, areas in ukri_focus.items()}
        
        # Prepare publication data (clean non-serializable elements)
        pub_data = {}
        for staff, pubs in publications.items():
            pub_data[staff] = []
            for pub in pubs:
                clean_pub = {}
                for k, v in pub.items():
                    if isinstance(v, (str, int, float, list, dict, bool)) or v is None:
                        clean_pub[k] = v
                pub_data[staff].append(clean_pub)
        
        json.dump({
            "ukri_focus": ukri_focus_dict,
            "publications": pub_data,
            "network": {
                "nodes": G.number_of_nodes(),
                "edges": G.number_of_edges()
            }
        }, f, indent=2)
    
    print("Test results saved to test_output/test_results.json")
    print("\n=== TEST COMPLETE ===")

if __name__ == "__main__":
    # Use a small subset of staff members for testing
    # Replace with actual staff names from your department
    test_staff = [
        "Duncan Borman",  # Replace with actual staff members
        "Andy Sleigh",    # Replace with actual staff members 
        "Cath Noakes"     # Replace with actual staff members
    ]
    
    run_quick_test(test_staff)