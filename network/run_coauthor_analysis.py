import os
import sys
import webbrowser
from csv_file_organizer import organize_csv_files
from manual_data_network_analysis import ManualCoauthorNetwork

def print_header(text):
    """Print a formatted header."""
    print("\n" + "="*60)
    print(f" {text}")
    print("="*60)

def main():
    print_header("LEEDS CIVIL ENGINEERING CO-AUTHOR NETWORK ANALYSIS")
    print("\nThis script will analyze co-author networks and map them to UKRI priority areas")
    print("using your manually downloaded CSV files from Scopus.")
    
    # Check if data folder exists
    data_folder = os.path.join(os.getcwd(), 'data')
    has_data = os.path.exists(data_folder) and any(f.endswith('.csv') for f in os.listdir(data_folder))
    
    if not has_data:
        print_header("STEP 1: ORGANIZE CSV FILES")
        print("\nNo organized data files found. Let's organize your CSV files first.")
        print("This will copy your CSV files to a 'data' folder with standardized names.")
        
        proceed = input("\nProceed with organizing CSV files? (y/n): ")
        if proceed.lower() != 'y':
            print("Exiting. Please organize your CSV files manually and try again.")
            return
        
        # Organize CSV files
        source_folder = input("\nEnter the folder containing your CSV files (press Enter for current folder): ")
        if not source_folder:
            source_folder = '.'
        
        organize_csv_files(source_folder, data_folder)
    
    print_header("STEP 2: CONFIGURE UKRI PRIORITIES")
    print("\nYou can customize the keywords used to classify research into UKRI priority areas.")
    
    customize = input("Would you like to customize UKRI priority keywords? (y/n): ")
    if customize.lower() == 'y':
        # Import to access the priorities dictionary
        import manual_data_network_analysis
        
        for area, keywords in manual_data_network_analysis.UKRI_PRIORITIES.items():
            print(f"\nCurrent keywords for '{area}':")
            print(", ".join(keywords))
            
            new_keywords = input("Enter new keywords (comma-separated) or press Enter to keep current: ")
            if new_keywords:
                manual_data_network_analysis.UKRI_PRIORITIES[area] = [k.strip() for k in new_keywords.split(",")]
    
    # Create the analyzer
    print_header("STEP 3: RUN NETWORK ANALYSIS")
    print("\nThe analysis will:")
    print("1. Build a co-author network from your papers data")
    print("2. Classify publications into UKRI priority areas")
    print("3. Identify potential collaboration opportunities")
    print("4. Generate interactive visualizations and a report")
    
    proceed = input("\nProceed with analysis? (y/n): ")
    if proceed.lower() != 'y':
        print("Exiting. Run again when you're ready to proceed.")
        return
    
    # Run the analysis
    analyzer = ManualCoauthorNetwork(data_folder)
    success = analyzer.run_analysis()
    
    if success:
        print_header("ANALYSIS COMPLETE")
        print("\nThe following files were created:")
        print("- coauthor_network.html: Interactive visualization of the co-author network")
        print("- ukri_heatmap.html: Heatmap showing staff expertise in UKRI priority areas")
        print("- ukri_bar_chart.html: Bar chart of UKRI priority area distribution")
        print("- report.html: Comprehensive analysis report with recommendations")
        
        # Open the report in a web browser
        report_path = os.path.join(os.getcwd(), 'report.html')
        if os.path.exists(report_path):
            open_browser = input("\nOpen report in web browser? (y/n): ")
            if open_browser.lower() == 'y':
                webbrowser.open('file://' + report_path)
    else:
        print_header("ANALYSIS FAILED")
        print("\nPlease check the error messages above and try again.")

if __name__ == "__main__":
    main()