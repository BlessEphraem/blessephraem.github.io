import json
import os
import sys
import time
import subprocess
import re

CONFIG_FILE = "portfolio-config.json"
OUTPUT_FILE = "Portfolio/videos.json"

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Erreur: {CONFIG_FILE} introuvable.")
        sys.exit(1)
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_video_ids(channel_url):
    try:
        channel = channel_url.split('@')[-1].rstrip('/')
        result = subprocess.run([
            'yt-dlp', '--flat-playlist', '--print', '%(id)s',
            f'https://www.youtube.com/@{channel}/videos',
            '--playlist-end', '500'
        ], capture_output=True, text=True, timeout=180)
        
        if result.returncode != 0:
            print(f"yt-dlp error: {result.stderr}")
            return []
        
        video_ids = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
        print(f"Nombre total de vidéos: {len(video_ids)}")
        return video_ids
    except Exception as e:
        print(f"Erreur: {e}")
        return []

def get_video_description(video_id):
    try:
        result = subprocess.run([
            'yt-dlp', '--print', '%(description)s',
            f'https://www.youtube.com/watch?v={video_id}',
            '--skip-download'
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return result.stdout.strip()
        return ''
    except Exception:
        return ''

def update_portfolio():
    config = load_config()
    
    date_limit = config.get("date_limit", "2025-01-01")
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])
    
    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    found_videos = []
    print(f"Recherche de vidéos depuis {date_limit}...")

    for channel_url in channel_urls:
        print(f"\nAnalyse de la chaîne : {channel_url}")
        try:
            all_video_ids = get_all_video_ids(channel_url)
            print(f"Analyse des descriptions...")
            
            for i, video_id in enumerate(all_video_ids):
                print(f"[{i+1}/{len(all_video_ids)}] Check video {video_id}")
                
                description = get_video_description(video_id)
                
                if any(kw in description.lower() for kw in keywords):
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    print(f"[TROUVÉ] {video_url}")
                    
                    found_videos.append({"url": video_url})
                
                time.sleep(0.3)

        except Exception as e:
            print(f"Erreur lors de l'analyse de {channel_url}: {e}")

    print("\nRecherche terminée.")
    
    output_data = {"videos": found_videos}
    
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"\nFichier {OUTPUT_FILE} mis à jour avec {len(found_videos)} vidéos.")

if __name__ == "__main__":
    update_portfolio()