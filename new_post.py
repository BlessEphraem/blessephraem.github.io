import os
import re
from datetime import datetime, timezone
from pathlib import Path

def create_slug(title):
    """
    Generates a URL-friendly slug from a title.
    Example: "My New Post!" -> "my-new-post"
    """
    # Convert to lowercase
    slug = title.lower()
    
    # Remove any character that is not a letter, number, space, or hyphen
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    
    # Replace one or more spaces or hyphens with a single hyphen
    slug = re.sub(r"[\s-]+", "-", slug).strip('-')
    
    return slug

def find_posts_directory():
    """
    Checks for a '_posts' directory in the script's location.
    If not found, it asks the user to provide the path.
    """
    # Get the directory where the script is running
    # .resolve() makes it an absolute path
    script_dir = Path(__file__).resolve().parent
    posts_dir = script_dir / "_posts"
    
    # Check if it exists
    if posts_dir.is_dir():
        print(f"Found directory: {posts_dir}")
        return posts_dir

    print(f"Warning: '_posts' directory not found at: {script_dir}")
    print("Please provide the path to your posts directory.")

    while True:
        user_path = input("Path to '_posts' directory: ").strip()
        
        # Create a Path object from the user's input
        posts_dir = Path(user_path)
        
        if posts_dir.is_dir():
            print(f"Using directory: {posts_dir}")
            return posts_dir
        else:
            print(f"Error: '{user_path}' is not a valid directory.")
            print("Please try again.")

def main():
    try:
        # 1. Find the _posts directory
        posts_dir = find_posts_directory()

        # 2. Get the post title from the user
        title = input("Enter the post title (default: 'New Post'): ").strip()
        if not title:
            title = "New Post"

        # 3. Generate dates and slug
        
        # Get the current time in UTC
        now_utc = datetime.now(timezone.utc)
        
        # Format for the YAML front matter (ISO 8601 with 'Z')
        # Example: 2025-11-14T15:30:05.123Z
        date_yaml_format = now_utc.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
        
        # Format for the filename (YYYY-MM-DD)
        date_file_format = now_utc.strftime("%Y-%m-%d")
        
        # Create the file-friendly slug
        slug = create_slug(title)
        
        # Handle case where title was only special characters (e.g., "!!!")
        if not slug:
            slug = "post"

        # 4. Determine the final file path and handle collisions
        base_file_name = f"{date_file_format}-{slug}"
        file_name = f"{base_file_name}.md"
        file_path = posts_dir / file_name
        
        counter = 1
        # Loop to find a unique filename if it already exists
        while file_path.exists():
            print(f"Warning: '{file_name}' already exists.")
            # Append a number, e.g., 2025-11-14-my-post-1.md
            file_name = f"{base_file_name}-{counter}.md"
            file_path = posts_dir / file_name
            counter += 1

        # 5. Create the file content
        content = f"""---
title: {title}
date: {date_yaml_format}
thumbnail: 
---

Start writing your post here...
"""

        # 6. Write the file
        file_path.write_text(content, encoding='utf-8')
        
        print(f"\nSuccessfully created new post:")
        print(str(file_path))

    except Exception as e:
        print(f"\nAn error occurred: {e}")
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")

if __name__ == "__main__":
    main()