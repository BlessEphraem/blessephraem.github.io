import json
import os
import sys
import time
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

def get_all_videos(channel_url, date_limit_str):
    try:
        videos_url = channel_url.rstrip('/') + '/videos'
        ydl_opts = {
            'quiet': True,
            'nocheckcertificate': True,
            'playlistend': 500,
            'extractor_args': {
                'youtube:player_client': ['android', 'mweb'],
            },
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(videos_url, download=False)
            if not result:
                print("Aucune donnée retournée")
                return []
            
            entries = result.get('entries', []) or []
            print(f"Nombre total de vidéos: {len(entries)}")
            
            filtered = []
            for entry in entries:
                if entry is None:
                    continue
                upload_date = entry.get('upload_date', '')
                if upload_date and upload_date >= date_limit_str.replace('-', ''):
                    filtered.append(entry)
            
            print(f"Vidéos depuis {date_limit_str}: {len(filtered)}")
            return filtered
    except Exception as e:
        print(f"Erreur yt-dlp: {e}")
        return []

def update_portfolio():
    config = load_config()
    
    date_limit_str = config.get("date_limit", "2025-01-01")
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])
    
    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    found_videos = []
    print(f"Recherche de vidéos depuis {date_limit_str}...")

    for channel_url in channel_urls:
        print(f"\nAnalyse de la chaîne : {channel_url}")
        try:
            all_videos = get_all_videos(channel_url, date_limit_str)
            print(f"Analyse des descriptions...")
            
            for i, entry in enumerate(all_videos):
                video_id = entry.get('id')
                title = entry.get('title', 'Sans titre')
                description = entry.get('description', '')
                upload_date = entry.get('upload_date', '')
                upload_date_formatted = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}" if len(upload_date) == 8 else 'unknown'
                
                try:
                    print(f"[{i+1}/{len(all_videos)}] {title[:50]}... ({upload_date_formatted})")
                except UnicodeEncodeError:
                    print(f"[{i+1}/{len(all_videos)}] (title with emoji) ({upload_date_formatted})")
                
                if any(kw in description.lower() for kw in keywords):
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    try:
                        print(f"[TROUVÉ] {title} ({upload_date_formatted})")
                    except UnicodeEncodeError:
                        print(f"[TROUVÉ] (video avec emoji) ({upload_date_formatted})")
                    
                    found_videos.append({
                        "url": video_url,
                        "upload_date": upload_date_formatted
                    })
                
                time.sleep(0.1)

        except Exception as e:
            print(f"Erreur lors de l'analyse de {channel_url}: {e}")

    print("\nRecherche terminée.")
    
    found_videos.sort(key=lambda x: x["upload_date"], reverse=True)
    
    output_data = {
        "videos": [{"url": v["url"]} for v in found_videos]
    }
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"\nFichier {OUTPUT_FILE} mis à jour avec {len(found_videos)} vidéos.")

if __name__ == "__main__":
    update_portfolio()