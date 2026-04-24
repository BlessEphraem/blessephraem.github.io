import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

CONFIG_FILE = "portfolio-config.json"
OUTPUT_FILE = "Portfolio/videos.json"

NS = {
    "atom":  "http://www.w3.org/2005/Atom",
    "yt":    "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}

HEADERS = {"User-Agent": "Mozilla/5.0"}


def extract_video_id(url: str) -> str:
    m = re.search(r"[?&]v=([A-Za-z0-9_-]{11})", url)
    return m.group(1) if m else ""


def load_config() -> dict:
    if not os.path.exists(CONFIG_FILE):
        print(f"Erreur: {CONFIG_FILE} introuvable.")
        sys.exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_registry() -> tuple[list, set]:
    """
    Returns (videos_list, seen_ids_set).
    seen_ids includes IDs from both 'seen_ids' and current 'videos' entries
    so manual additions are also deduplicated.
    """
    if not os.path.exists(OUTPUT_FILE):
        return [], set()
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    videos = data.get("videos", [])
    seen_ids = set(data.get("seen_ids", []))
    # absorb manually-added videos into seen_ids
    for v in videos:
        vid = extract_video_id(v.get("url", ""))
        if vid:
            seen_ids.add(vid)
    return videos, seen_ids


def resolve_channel_id(channel_url: str) -> str | None:
    req = urllib.request.Request(channel_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Erreur fetch {channel_url}: {e}")
        return None
    m = re.search(r'channel_id=(UC[\w-]+)', html)
    if m:
        return m.group(1)
    print(f"channel_id introuvable dans {channel_url}")
    return None


def fetch_rss(channel_id: str) -> list[dict]:
    url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    print(f"Fetch RSS: {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            xml_bytes = resp.read()
    except Exception as e:
        print(f"Erreur fetch RSS {channel_id}: {e}")
        return []

    root = ET.fromstring(xml_bytes)
    entries = []
    for entry in root.findall("atom:entry", NS):
        video_id_el = entry.find("yt:videoId", NS)
        published_el = entry.find("atom:published", NS)
        desc_el = entry.find("media:group/media:description", NS)

        if video_id_el is None or published_el is None:
            continue

        video_id = video_id_el.text.strip()
        published = published_el.text.strip()[:10]  # YYYY-MM-DD
        description = (desc_el.text or "") if desc_el is not None else ""

        entries.append({
            "video_id": video_id,
            "published": published,
            "description": description,
            "url": f"https://www.youtube.com/watch?v={video_id}",
        })
    return entries


def update_portfolio() -> None:
    config = load_config()

    date_limit = config.get("date_limit", "2025-01-01")
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channels = config.get("channels", [])

    if not keywords or not channels:
        print("Erreur: 'keywords' ou 'channels' manquant dans la config.")
        sys.exit(1)

    print(f"Keywords: {keywords}")
    print(f"Date limit: {date_limit}")

    existing_videos, seen_ids = load_registry()
    print(f"Vidéos affichées: {len(existing_videos)} | IDs vus: {len(seen_ids)}")

    new_videos = []

    for channel in channels:
        channel_url = channel.get("url", "")
        if not channel_url:
            continue

        print(f"\nRésolution channel_id: {channel_url}")
        channel_id = resolve_channel_id(channel_url)
        if not channel_id:
            print(f"[SKIP] impossible de résoudre {channel_url}")
            continue

        print(f"channel_id: {channel_id}")
        entries = fetch_rss(channel_id)
        print(f"Entrées RSS: {len(entries)}")

        for entry in entries:
            if entry["published"] < date_limit:
                print(f"[SKIP DATE] {entry['video_id']} ({entry['published']})")
                continue

            if entry["video_id"] in seen_ids:
                print(f"[DÉJÀ VU]   {entry['video_id']}")
                continue

            desc_lower = entry["description"].lower()
            print(f"[CHECK]     [{entry['video_id']}] desc[:120]: {entry['description'][:120]!r}")

            if any(kw in desc_lower for kw in keywords):
                print(f"[TROUVÉ]    {entry['url']}")
                new_videos.append({"url": entry["url"], "published": entry["published"]})
                seen_ids.add(entry["video_id"])

    print(f"\nNouvelles vidéos: {len(new_videos)}")

    all_videos = sorted(
        existing_videos + new_videos,
        key=lambda v: v.get("published", ""),
        reverse=True,
    )

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"videos": all_videos, "seen_ids": sorted(seen_ids)},
            f, indent=2, ensure_ascii=False,
        )

    print(f"{OUTPUT_FILE} mis à jour → {len(all_videos)} vidéos affichées, {len(seen_ids)} IDs vus.")


if __name__ == "__main__":
    update_portfolio()
