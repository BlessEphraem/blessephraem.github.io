import json
import os
import sys
import yt_dlp
from datetime import datetime

CONFIG_FILE = "portfolio-config.json"
OUTPUT_FILE = "Portfolio/videos.json"

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Erreur: {CONFIG_FILE} introuvable.")
        sys.exit(1)
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_portfolio():
    config = load_config()
    
    date_limit_str = config.get("date_limit", "2025-01-01")
    try:
        # Convert YYYY-MM-DD to YYYYMMDD for yt-dlp comparison
        date_limit = datetime.strptime(date_limit_str, "%Y-%m-%d").strftime("%Y%m%d")
    except ValueError:
        print("Format de date invalide dans config. Utilisez YYYY-MM-DD.")
        sys.exit(1)
        
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])
    
    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
        'dateafter': date_limit # yt-dlp will stop fetching older videos automatically
    }

    found_videos = []

    print(f"Recherche de vidéos depuis {date_limit_str}...")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for channel_url in channel_urls:
            print(f"\nAnalyse de la chaîne : {channel_url}")
            
            try:
                # Append /videos to ensure we get the video tab
                if not channel_url.endswith('/videos'):
                    target_url = f"{channel_url.rstrip('/')}/videos"
                else:
                    target_url = channel_url

                playlist_dict = ydl.extract_info(target_url, download=False)
                
                if not playlist_dict or 'entries' not in playlist_dict:
                    print(f"Impossible de récupérer les vidéos pour {channel_url}")
                    continue

                for entry in playlist_dict['entries']:
                    if not entry:
                        continue
                        
                    # Some extractors might not fully respect dateafter depending on the channel structure
                    # We double check the upload date here.
                    upload_date = entry.get('upload_date')
                    if upload_date and upload_date < date_limit:
                        # Reached videos older than the limit
                        continue

                    description = entry.get('description', '')
                    desc_lower = description.lower() if description else ""
                    
                    matched = False
                    for kw in keywords:
                        if kw in desc_lower:
                            matched = True
                            break
                            
                    if matched:
                        video_url = entry.get('url') or entry.get('webpage_url')
                        if not video_url and entry.get('id'):
                            video_url = f"https://www.youtube.com/watch?v={entry.get('id')}"
                            
                        if video_url:
                            print(f"\n[TROUVÉ] {entry.get('title', 'Sans titre')} ({upload_date})")
                            found_videos.append({
                                "url": video_url,
                                "upload_date": upload_date or "00000000" # Default low sort value
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