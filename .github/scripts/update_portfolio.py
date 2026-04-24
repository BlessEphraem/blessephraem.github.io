import json
import os
import sys
from datetime import datetime

import yt_dlp

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
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])
    
    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    found_videos = []
    print(f"Recherche de vidéos depuis {date_limit_str} via yt-dlp...")

    ydl_opts = {
        'quiet': True,
        'extract_flat': False,
        'dateafter': date_limit_str,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for channel_url in channel_urls:
            print(f"\nAnalyse de la chaîne : {channel_url}")
            try:
                info = ydl.extract_info(channel_url, download=False)
                
                channel_id = info.get('channel_id') or info.get('id')
                if not channel_id:
                    print(f"Impossible de trouver l'ID de chaîne pour {channel_url}")
                    continue

                print(f"ID de chaîne : {channel_id}")

                for entry in info.get('entries', []) or []:
                    if entry is None:
                        continue

                    video_id = entry.get('id')
                    title = entry.get('title', 'Sans titre')
                    description = entry.get('description', '').lower()
                    upload_date = entry.get('upload_date')
                    
                    if upload_date:
                        upload_date_formatted = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"
                    else:
                        upload_date_formatted = 'unknown'

                    matched = any(kw in description for kw in keywords)

                    if matched:
                        video_url = f"https://www.youtube.com/watch?v={video_id}"
                        print(f"[TROUVÉ] {title} ({upload_date_formatted})")
                        
                        found_videos.append({
                            "url": video_url,
                            "upload_date": upload_date_formatted
                        })

            except Exception as e:
                print(f"Erreur lors de l'analyse de {channel_url}: {e}")

    print("\nRecherche terminée.")
    
    found_videos.sort(key=lambda x: x["upload_date"], reverse=True)
    
    output_data = {
        "videos": [{"url": v["url"]} for v in found_videos]
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print(f"\nFichier {OUTPUT_FILE} mis à jour avec {len(found_videos)} vidéos.")

if __name__ == "__main__":
    update_portfolio()