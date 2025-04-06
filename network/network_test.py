import requests
import json
import sys
import platform
import socket
import os
import subprocess
import urllib.request

# Your Scopus API key
API_KEY = "6cd1b3e9bd28cd81b99fd1bdd92bcf09"

# Headers for API requests
HEADERS = {
    "X-ELS-APIKey": API_KEY,
    "Accept": "application/json"
}

def get_system_info():
    """Collect system information for diagnostics."""
    info = {
        "platform": platform.platform(),
        "python_version": sys.version,
        "hostname": socket.gethostname()
    }
    
    try:
        # Check if connected through VPN
        # This is a simple check, might not detect all VPNs
        ipinfo = json.loads(urllib.request.urlopen("https://ipinfo.io/json").read())
        info["ip_address"] = ipinfo.get("ip", "Unknown")
        info["location"] = f"{ipinfo.get('city', 'Unknown')}, {ipinfo.get('region', 'Unknown')}, {ipinfo.get('country', 'Unknown')}"
        info["isp"] = ipinfo.get("org", "Unknown")
    except Exception as e:
        info["ip_address"] = "Could not detect"
        info["error_getting_ip"] = str(e)
    
    return info

def check_internet_connection():
    """Test basic internet connectivity."""
    test_urls = [
        "https://www.google.com",
        "https://www.elsevier.com",
        "https://www.scopus.com"
    ]
    
    results = {}
    for url in test_urls:
        try:
            response = requests.get(url, timeout=5)
            results[url] = {
                "accessible": response.status_code == 200,
                "status_code": response.status_code
            }
        except Exception as e:
            results[url] = {
                "accessible": False,
                "error": str(e)
            }
    
    return results

def test_api_endpoints():
    """Test various Scopus API endpoints to determine which ones are accessible."""
    endpoints = {
        "Author Search": "https://api.elsevier.com/content/search/author",
        "Scopus Search": "https://api.elsevier.com/content/search/scopus",
        "Abstract Retrieval": "https://api.elsevier.com/content/abstract/scopus_id/84872135457",
        "Serial Title": "https://api.elsevier.com/content/serial/title/issn/00191035",
        "Affiliation Retrieval": "https://api.elsevier.com/content/affiliation/affiliation_id/60028186"
    }
    
    results = {}
    for name, url in endpoints.items():
        try:
            response = requests.get(url, headers=HEADERS)
            results[name] = {
                "url": url,
                "status_code": response.status_code,
                "response": response.text[:500] + ("..." if len(response.text) > 500 else "")
            }
        except Exception as e:
            results[name] = {
                "url": url,
                "error": str(e)
            }
    
    return results

def check_api_key_format():
    """Verify if the API key has the correct format."""
    # Typical Scopus API keys are 32 characters
    if len(API_KEY) != 32:
        return {
            "valid_format": False,
            "reason": f"API key length is {len(API_KEY)}, expected 32 characters"
        }
    
    # Check if it contains only hexadecimal characters
    try:
        int(API_KEY, 16)
        return {"valid_format": True}
    except ValueError:
        return {
            "valid_format": False,
            "reason": "API key contains non-hexadecimal characters"
        }

def test_author_search(author_name):
    """Test searching for an author in Scopus with detailed error reporting."""
    print(f"Testing Author Search API with query: {author_name}")
    
    query = f"AUTHNAME({author_name})"
    params = {
        "query": query, 
        "field": "dc:identifier,preferred-name",
        "count": 3
    }
    
    try:
        # First make a HEAD request to check headers
        head_response = requests.head(
            "https://api.elsevier.com/content/search/author",
            headers=HEADERS
        )
        
        head_info = {
            "status_code": head_response.status_code,
            "headers": dict(head_response.headers)
        }
        
        # Now make the actual GET request
        response = requests.get(
            "https://api.elsevier.com/content/search/author",
            headers=HEADERS,
            params=params
        )
        
        result = {
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "head_request": head_info
        }
        
        if response.status_code == 200:
            data = response.json()
            
            if "search-results" in data and "entry" in data["search-results"]:
                entries = data["search-results"]["entry"]
                result["found_entries"] = len(entries)
                
                if entries:
                    result["sample_entry"] = entries[0]
                else:
                    result["message"] = "No authors found with that name"
            else:
                result["message"] = "Unexpected API response format"
                result["response_data"] = data
        else:
            try:
                result["error_details"] = response.json()
            except:
                result["response_text"] = response.text
        
        return result
    except Exception as e:
        return {
            "success": False,
            "exception": str(e),
            "exception_type": type(e).__name__
        }

def run_comprehensive_test():
    """Run a comprehensive diagnostic test of the Scopus API."""
    print("=== SCOPUS API DIAGNOSTIC TOOL ===")
    print("Running comprehensive diagnostics...\n")
    
    results = {}
    
    # 1. System Information
    print("Collecting system information...")
    results["system_info"] = get_system_info()
    
    # 2. Internet Connectivity
    print("Testing internet connectivity...")
    results["internet_connectivity"] = check_internet_connection()
    
    # 3. API Key Format
    print("Checking API key format...")
    results["api_key_check"] = check_api_key_format()
    
    # 4. API Endpoints
    print("Testing API endpoints...")
    results["api_endpoints"] = test_api_endpoints()
    
    # 5. Author Search Test
    print("Testing author search functionality...")
    results["author_search_test"] = test_author_search("Smith")
    
    # Save results to file
    with open("scopus_api_diagnostic.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # Print summary
    print("\n=== DIAGNOSTIC SUMMARY ===")
    print(f"System: {results['system_info']['platform']}")
    print(f"IP Address: {results['system_info']['ip_address']}")
    print(f"API Key Format: {'Valid' if results['api_key_check']['valid_format'] else 'Invalid - ' + results['api_key_check'].get('reason', '')}")
    
    # Internet connectivity summary
    all_sites_accessible = all(result["accessible"] for result in results["internet_connectivity"].values())
    print(f"Internet Connectivity: {'All sites accessible' if all_sites_accessible else 'Some sites inaccessible'}")
    
    # API endpoints summary
    successful_endpoints = sum(1 for endpoint in results["api_endpoints"].values() if endpoint.get("status_code") == 200)
    total_endpoints = len(results["api_endpoints"])
    print(f"API Endpoints: {successful_endpoints}/{total_endpoints} accessible")
    
    # Author search summary
    author_search_success = results["author_search_test"].get("success", False)
    print(f"Author Search Test: {'Successful' if author_search_success else 'Failed'}")
    
    # Most likely issue
    print("\n=== DIAGNOSIS ===")
    if not all_sites_accessible:
        print("ISSUE: Internet connectivity problems detected.")
        print("SOLUTION: Check your network connection and firewall settings.")
    elif not results["api_key_check"]["valid_format"]:
        print("ISSUE: API key format appears to be invalid.")
        print("SOLUTION: Double-check your API key for typos or missing characters.")
    elif successful_endpoints == 0:
        print("ISSUE: Unable to access any Scopus API endpoints.")
        if any("AUTHORIZATION_ERROR" in endpoint.get("response", "") for endpoint in results["api_endpoints"].values()):
            print("DIAGNOSIS: Authorization error detected. Most likely causes:")
            print("1. API key not activated yet (can take up to 24 hours)")
            print("2. IP address not registered with the API key")
            print("3. Missing institutional subscription or entitlements")
            print("\nSOLUTION:")
            print("1. Register your current IP address (" + results['system_info']['ip_address'] + ") with your API key")
            print("2. Ensure your API key has the necessary permissions enabled")
            print("3. Connect through university VPN if you have institutional access")
    elif not author_search_success:
        print("ISSUE: Author search specifically is failing.")
        if results["author_search_test"].get("status_code") == 401:
            print("DIAGNOSIS: Authorization error for author search endpoint.")
            print("SOLUTION: Your API key needs specific permission for the Author Search API.")
    else:
        print("Unknown issue. Please check the full diagnostic file for details.")
    
    print("\nComplete diagnostic results saved to scopus_api_diagnostic.json")
    print("Please include this file if seeking technical support.")

if __name__ == "__main__":
    run_comprehensive_test()