import json
import os
import re
import sys
import urllib.request
from datetime import datetime

CONFIG_FILE = "portfolio-config.json"
EXCLUDE_FILE = "config-exclude.json"
ARCHIVE_FILE = "portfolio-archive.json"
RECENT_FILE = "portfolio-recent.json"
OUTPUT_FILE = "Portfolio/videos.json"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

def load_json(path: str, default: dict) -> dict:
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def save_json(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def normalize_youtube_url(url: str) -> str:
    """Normalizes various YouTube URL formats to the standard watch?v= format."""
    video_id = None
    if "v=" in url:
        video_id = url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        video_id = url.split("youtu.be/")[1].split("?")[0].split("/")[0]
    
    if video_id:
        return f"https://www.youtube.com/watch?v={video_id}"
    return url

def get_video_description(video_url: str) -> str:
    """Fetches the description from the video page using lightweight scraping."""
    try:
        req = urllib.request.Request(video_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            # Read first 100KB which contains the metadata and short description
            html = resp.read(100000).decode("utf-8", errors="ignore")
            
            # Try to find the shortDescription in the JSON data inside HTML
            m = re.search(r'"shortDescription":"(.*?)"', html)
            if m:
                # Basic unescape for JSON string
                desc = m.group(1).replace('\\n', ' ').replace('\\"', '"')
                return desc
            
            # Fallback to meta tag
            m = re.search(r'<meta name="description" content="(.*?)"', html)
            if m:
                return m.group(1)
    except Exception as e:
        print(f"  [ERROR] fetch desc {video_url}: {e}")
    return ""

def update_portfolio() -> None:
    config = load_json(CONFIG_FILE, {})
    exclude_config = load_json(EXCLUDE_FILE, {"urls": []})
    excluded_urls = {normalize_youtube_url(url) for url in exclude_config.get("urls", [])}

    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channels = config.get("channels", []) # Note: user config uses "urls" in his example, I'll support both
    channel_urls = config.get("urls", []) or [c.get("url") for c in channels]

    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans portfolio-config.json")
        sys.exit(1)

    # Load existing state
    archive = load_json(ARCHIVE_FILE, {"videos": []})
    archive_videos = archive.get("videos", [])
    
    # Filter out excluded videos from current archive immediately
    if excluded_urls:
        initial_count = len(archive_videos)
        archive_videos = [v for v in archive_videos if v["url"] not in excluded_urls]
        if len(archive_videos) < initial_count:
            print(f"Nettoyage : {initial_count - len(archive_videos)} vidéo(s) exclue(s) retirée(s) de l'archive.")

    archive_urls = {v["url"] for v in archive_videos}

    import yt_dlp
    # extract_flat is fast and avoids bot detection on channel pages
    ydl_opts = {
        'quiet': True, 
        'extract_flat': True, 
        'playlist_items': '1-50', # Check last 50 videos per channel
    }

    current_matches: dict[str, dict] = {}
    
    print(f"Recherche de nouvelles vidéos (Keywords: {keywords})...")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        for channel_url in channel_urls:
            if not channel_url: continue
            print(f"\nAnalyse: {channel_url}")
            try:
                # Ensure /videos tab
                target = channel_url.rstrip('/') + "/videos"
                info = ydl.extract_info(target, download=False)
                if not info or 'entries' not in info:
                    print(f"  Impossible de lister les vidéos.")
                    continue

                for entry in info['entries']:
                    if not entry: continue
                    video_id = entry.get('id')
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                    
                    if video_url in excluded_urls:
                        print(f"  Vérif: {entry.get('title')[:50]}... [EXCLUE]")
                        continue

                    if video_url in archive_urls:
                        # Already archived, stop scanning this channel (assuming chronological order)
                        # Actually we continue a bit just in case, but archive is our "stop" sign
                        continue

                    print(f"  Vérif: {entry.get('title')[:50]}...", end=" ", flush=True)
                    
                    description = get_video_description(video_url)
                    desc_lower = description.lower()
                    
                    if any(kw in desc_lower for kw in keywords):
                        print(" [MATCH]")
                        current_matches[video_url] = {
                            "url": video_url,
                            "published": entry.get("upload_date", "00000000"), # YYYYMMDD
                            "title": entry.get("title")
                        }
                    else:
                        print(" [SKIP]")

            except Exception as e:
                print(f"  Erreur canal {channel_url}: {e}")

    # Add new matches to archive
    new_count = 0
    for url, data in current_matches.items():
        if url not in archive_urls:
            # Reformat published date for display if needed, but keeping YYYYMMDD for sorting
            # We'll use YYYY-MM-DD for consistency with old archive
            raw_date = data["published"]
            formatted_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}" if len(raw_date) == 8 else raw_date
            
            archive_videos.append({
                "url": url,
                "published": formatted_date
            })
            archive_urls.add(url)
            new_count += 1

    # Save archive if changed (new videos added or old ones excluded)
    # Note: we compare with the filtered archive at the beginning
    if new_count > 0 or (excluded_urls and len(archive_videos) != initial_count):
        if new_count > 0:
            print(f"\n{new_count} nouvelle(s) vidéo(s) ajoutée(s) à l'archive.")
        # Sort archive by date desc
        archive_videos = sorted(archive_videos, key=lambda v: v.get("published", ""), reverse=True)
        save_json(ARCHIVE_FILE, {"videos": archive_videos})
    else:
        print("\nAucune nouvelle vidéo trouvée et aucun changement d'exclusion.")

    # Always generate the final output for the site
    # This combines everything in archive_videos
    save_json(OUTPUT_FILE, {"videos": archive_videos})


if __name__ == "__main__":
    update_portfolio()
