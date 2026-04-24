import json
import os
import sys
import subprocess

CONFIG_FILE = "portfolio-config.json"
OUTPUT_FILE = "Portfolio/videos.json"


def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"Erreur: {CONFIG_FILE} introuvable.")
        sys.exit(1)
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_videos_matching_keywords(channel_url: str, date_limit: str, keywords: list) -> list:
    channel = channel_url.split('@')[-1].rstrip('/')
    date_str = date_limit.replace('-', '')  # '2025-01-01' -> '20250101'

    print(f"Lancement yt-dlp sur @{channel} depuis {date_limit}...")
    result = subprocess.run([
        'yt-dlp',
        '--no-download',
        '--dateafter', date_str,
        '--dump-json',
        '--ignore-errors',
        '--js-runtimes', 'node',
        f'https://www.youtube.com/@{channel}/videos',
    ], capture_output=True, text=True, timeout=600)

    if result.returncode != 0 and not result.stdout.strip():
        print(f"yt-dlp stderr: {result.stderr[:500]}")
        return []

    found = []
    checked = 0

    for line in result.stdout.strip().split('\n'):
        if not line.strip():
            continue
        try:
            info = json.loads(line)
        except json.JSONDecodeError:
            continue

        # Skip playlist-level entries
        if info.get('_type') == 'playlist':
            continue

        video_id = info.get('id', '')
        if not video_id:
            continue

        description = (info.get('description') or '')
        desc_lower = description.lower()
        checked += 1

        # Debug: show first 120 chars of each description
        print(f"[{video_id}] desc[:120]: {description[:120]!r}")

        if any(kw in desc_lower for kw in keywords):
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            print(f"[TROUVÉ] {video_url}")
            found.append({"url": video_url})

    print(f"Vidéos vérifiées: {checked} — trouvées: {len(found)}")
    return found


def update_portfolio():
    config = load_config()

    date_limit = config.get("date_limit", "2025-01-01")
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channel_urls = config.get("urls", [])

    if not keywords or not channel_urls:
        print("Erreur: 'keywords' ou 'urls' manquant dans la config.")
        sys.exit(1)

    print(f"Keywords: {keywords}")
    found_videos = []

    for channel_url in channel_urls:
        print(f"\nAnalyse: {channel_url}")
        try:
            found_videos.extend(
                get_videos_matching_keywords(channel_url, date_limit, keywords)
            )
        except Exception as e:
            print(f"Erreur lors de l'analyse de {channel_url}: {e}")

    print("\nRecherche terminée.")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump({"videos": found_videos}, f, indent=2, ensure_ascii=False)

    print(f"Fichier {OUTPUT_FILE} mis à jour avec {len(found_videos)} vidéos.")


if __name__ == "__main__":
    update_portfolio()
