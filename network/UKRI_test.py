import requests
import json
import pandas as pd
from collections import defaultdict

# Your Scopus API key
API_KEY = "6cd1b3e9bd28cd81b99fd1bdd92bcf09"

# Headers for API requests
HEADERS = {
    "X-ELS-APIKey": API_KEY,
    "Accept": "application/json"
}

# Define UKRI priority areas with relevant keywords
UKRI_PRIORITIES = {
    "AI and Robotics": ["artificial intelligence", "machine learning", "robotics", "automation", "neural network", "deep learning"],
    "Climate Resilience": ["climate", "resilience", "adaptation", "sustainability", "net zero", "carbon", "environment"],
    "Advanced Materials": ["materials", "composites", "nanomaterials", "concrete", "steel", "polymer", "alloy"],
    "Infrastructure Systems": ["infrastructure", "construction", "building", "transport", "water", "urban", "city"],
    "Energy Systems": ["energy", "renewable", "power", "grid", "efficiency", "electricity", "solar", "wind"]
}

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

def get_author_publications(author_id, max_pubs=10):
    """Get publications for a specific author with abstracts and keywords."""
    params = {
        "query": f"AU-ID({author_id})",
        "field": "dc:title,dc:creator,prism:coverDate,prism:publicationName,authkeywords,dc:description",
        "count": max_pubs,
        "sort": "-prism:coverDate"
    }
    
    try:
        response = requests.get(
            "https://api.elsevier.com/content/search/scopus",
            headers=HEADERS,
            params=params
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if "search-results" in data and "entry" in data["search-results"]:
                return data["search-results"]["entry"]
            else:
                print("Unexpected API response format")
                return []
        else:
            print(f"API request failed with status code: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def test_ukri_classification():
    """Test the UKRI classification system with real publications."""
    print("=== UKRI CLASSIFICATION TEST ===")
    
    # Test with a specific research area - change to any Leeds staff member
    # Civil Engineering, Water, or Materials are good test cases
    test_author = "Duncan Borman"  # Replace with actual staff member
    
    # First get the author ID
    query = f"AUTHNAME({test_author})"
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
            print(f"Author search failed with status code: {response.status_code}")
            return
        
        data = response.json()
        if "search-results" not in data or "entry" not in data["search-results"] or not data["search-results"]["entry"]:
            print(f"No author found with name: {test_author}")
            return
        
        author_id = data["search-results"]["entry"][0]["dc:identifier"].split(":")[-1]
        name = data["search-results"]["entry"][0]["preferred-name"]
        full_name = f"{name.get('given-name', '')} {name.get('surname', '')}"
        
        print(f"Found author: {full_name} (ID: {author_id})")
        
        # Get publications for this author
        publications = get_author_publications(author_id)
        
        if not publications:
            print("No publications found for this author")
            return
        
        print(f"Retrieved {len(publications)} publications")
        
        # Classify each publication and track UKRI area coverage
        ukri_counts = defaultdict(int)
        
        results = []
        for i, pub in enumerate(publications):
            title = pub.get("dc:title", "No title")
            journal = pub.get("prism:publicationName", "Unknown")
            date = pub.get("prism:coverDate", "Unknown")
            
            # Try to get abstracts and keywords
            abstract = pub.get("dc:description", "")
            keywords = pub.get("authkeywords", "")
            
            # Classify the publication
            ukri_areas = classify_publication_ukri(pub)
            
            # Update counts
            for area in ukri_areas:
                ukri_counts[area] += 1
            
            results.append({
                "Title": title,
                "Journal": journal,
                "Date": date,
                "UKRI Areas": ", ".join(ukri_areas),
                "Has Abstract": "Yes" if abstract else "No",
                "Has Keywords": "Yes" if keywords else "No"
            })
            
            # Print detail for a few examples
            if i < 3:  # Show details for first 3 publications
                print(f"\nPublication {i+1}:")
                print(f"Title: {title}")
                print(f"Journal: {journal}")
                print(f"Date: {date}")
                print(f"UKRI Areas: {', '.join(ukri_areas)}")
                
                if abstract:
                    print(f"Abstract snippet: {abstract[:150]}...")
                else:
                    print("No abstract available")
                    
                if keywords:
                    print(f"Keywords: {keywords}")
                else:
                    print("No keywords available")
        
        # Show overall UKRI distribution
        print("\nUKRI Priority Area Distribution:")
        for area, count in sorted(ukri_counts.items(), key=lambda x: x[1], reverse=True):
            percentage = (count / len(publications)) * 100
            print(f"  {area}: {count} papers ({percentage:.1f}%)")
        
        # Create a DataFrame for better visualization
        df = pd.DataFrame(results)
        print("\nPublications overview:")
        print(df[["Title", "Journal", "Date", "UKRI Areas"]])
        
    except Exception as e:
        print(f"Error during test: {e}")
    
    print("\n=== TEST COMPLETE ===")

if __name__ == "__main__":
    test_ukri_classification()