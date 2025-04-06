import os
import shutil
import pandas as pd
import re

def organize_csv_files(source_folder='.', data_folder='./data'):
    """
    Organize CSV files by identifying papers and grants files,
    standardizing filenames, and moving them to the data folder.
    """
    print(f"Organizing CSV files from {source_folder} to {data_folder}")
    
    # Create data folder if it doesn't exist
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
        print(f"Created data folder: {data_folder}")
    
    # Get all CSV files in the source folder
    csv_files = [f for f in os.listdir(source_folder) if f.endswith('.csv')]
    
    if not csv_files:
        print("No CSV files found in the source folder")
        return
    
    print(f"Found {len(csv_files)} CSV files")
    
    for file in csv_files:
        try:
            file_path = os.path.join(source_folder, file)
            
            # Try to detect file type and staff name from filename
            file_type = None
            staff_name = None
            
            # Check if already in the correct format
            if file.startswith('papers_') or file.startswith('grants_'):
                if file.startswith('papers_'):
                    file_type = 'papers'
                else:
                    file_type = 'grants'
                
                staff_name = file.replace(f'{file_type}_', '').replace('.csv', '')
            else:
                # Try to infer from filename
                if 'paper' in file.lower() or 'publication' in file.lower():
                    file_type = 'papers'
                elif 'grant' in file.lower() or 'funding' in file.lower():
                    file_type = 'grants'
                
                # Try to extract name from filename
                name_match = re.search(r'[-_]([a-zA-Z]+)\.csv$', file)
                if name_match:
                    staff_name = name_match.group(1).lower()
            
            # If still couldn't determine type, try to infer from content
            if file_type is None:
                try:
                    # Read first few lines to check headers
                    df = pd.read_csv(file_path, nrows=1)
                    columns = [col.lower() for col in df.columns]
                    
                    if any(col in columns for col in ['title', 'year', 'author']):
                        file_type = 'papers'
                    elif any(col in columns for col in ['funder', 'start year', 'amount']):
                        file_type = 'grants'
                except:
                    print(f"Could not read {file} to determine type")
            
            # If staff name not determined, ask user
            if staff_name is None:
                print(f"\nCould not determine staff name for file: {file}")
                staff_name = input(f"Please enter staff name for {file} (without spaces): ")
                
                # Skip if no name provided
                if not staff_name:
                    print(f"Skipping {file} (no staff name provided)")
                    continue
            
            # If file type not determined, ask user
            if file_type is None:
                print(f"\nCould not determine file type for: {file}")
                file_type = input(f"Is this a 'papers' or 'grants' file? ")
                
                if file_type not in ['papers', 'grants']:
                    print(f"Invalid file type. Skipping {file}")
                    continue
            
            # Create standardized filename
            new_filename = f"{file_type}_{staff_name}.csv"
            new_file_path = os.path.join(data_folder, new_filename)
            
            # Copy file to data folder with new name
            shutil.copy2(file_path, new_file_path)
            print(f"Copied {file} to {new_file_path}")
                
        except Exception as e:
            print(f"Error processing {file}: {e}")
    
    print("\nFile organization complete!")
    print(f"Organized files are in the '{data_folder}' folder")
    
if __name__ == "__main__":
    organize_csv_files()