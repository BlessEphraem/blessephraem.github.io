import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

CONFIG_FILE = "portfolio-config.json"
OUTPUT_FILE = "Portfolio/videos.json"

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Erreur: {CONFIG_FILE} introuvable.")
        sys.exit(1)
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def fetch_rss(url):
    try:
        # User-Agent to avoid basic blocks
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            return response.read()
    except Exception as e:
        print(f"Erreur lors de la récupération du flux RSS {url}: {e}")
        return None

def update_portfolio():
    config = load_config()
    
    date_limit_str = config.get("date_limit", "2025-01-01")
    try:
        date_limit = datetime.strptime(date_limit_str, "%Y-%m-%d")
    except ValueError:
        print("Format de date invalide dans config. Utilisez YYYY-MM-DD.")
        sys.exit(1)
        
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])
    
    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    found_videos = []
    print(f"Recherche de vidéos depuis {date_limit_str} via RSS...")

    # We use yt-dlp JUST to resolve the @Handle to a Channel ID very quickly without scraping video pages
    import yt_dlp
    ydl_opts = {'quiet': True, 'extract_flat': True}

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for channel_url in channel_urls:
            print(f"\nAnalyse de la chaîne : {channel_url}")
            try:
                # Get the channel ID
                info = ydl.extract_info(channel_url, download=False)
                channel_id = info.get('channel_id') or info.get('id')
                
                if not channel_id:
                    print(f"Impossible de trouver l'ID de chaîne pour {channel_url}")
                    continue

                print(f"ID de chaîne trouvé : {channel_id}")
                
                # Fetch the official YouTube RSS feed for this channel
                rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
                rss_data = fetch_rss(rss_url)
                
                if not rss_data:
                    continue

                # Parse the XML feed
                root = ET.fromstring(rss_data)
                
                # XML Namespaces used by YouTube RSS
                ns = {
                    'atom': 'http://www.w3.org/2005/Atom',
                    'yt': 'http://www.youtube.com/xml/schemas/2015',
                    'media': 'http://search.yahoo.com/mrss/'
                }

                # Iterate through all <entry> tags (videos)
                for entry in root.findall('atom:entry', ns):
                    # Get upload date
                    published_str = entry.find('atom:published', ns).text
                    # Format: 2025-01-15T18:00:00+00:00
                    published_date = datetime.strptime(published_str[:10], "%Y-%m-%d")
                    
                    if published_date < date_limit:
                        continue # Skip older videos

                    # Get description from media:group/media:description
                    media_group = entry.find('media:group', ns)
                    description_elem = media_group.find('media:description', ns) if media_group is not None else None
                    description = description_elem.text if description_elem is not None and description_elem.text else ""
                    
                    desc_lower = description.lower()

                    matched = False
                    for kw in keywords:
                        if kw in desc_lower:
                            matched = True
                            break

                    if matched:
                        video_id = entry.find('yt:videoId', ns).text
                        title = entry.find('atom:title', ns).text
                        video_url = f"https://www.youtube.com/watch?v={video_id}"
                        
                        print(f"[TROUVÉ] {title} ({published_str[:10]})")
                        
                        found_videos.append({
                            "url": video_url,
                            "upload_date": published_str[:10] # YYYY-MM-DD
                        })
                        
            except Exception as e:
                print(f"Erreur lors de l'analyse de {channel_url}: {e}")

    print("\nRecherche terminée.")
    
    # Sort videos by upload_date descending (newest first)
    found_videos.sort(key=lambda x: x["upload_date"], reverse=True)
    
    # Format the output JSON
    output_data = {
        "videos": [{"url": v["url"]} for v in found_videos]
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"\nFichier {OUTPUT_FILE} mis à jour avec {len(found_videos)} vidéos.")

if __name__ == "__main__":
    update_portfolio()