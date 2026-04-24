import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

CONFIG_FILE = "portfolio-config.json"
ARCHIVE_FILE = "portfolio-archive.json"
RECENT_FILE = "portfolio-recent.json"
OUTPUT_FILE = "Portfolio/videos.json"

NS = {
    "atom":  "http://www.w3.org/2005/Atom",
    "yt":    "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}

HEADERS = {"User-Agent": "Mozilla/5.0"}


def load_json(path: str, default: dict) -> dict:
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: dict) -> None:
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


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

        entries.append({
            "video_id": video_id_el.text.strip(),
            "published": published_el.text.strip()[:10],
            "description": (desc_el.text or "") if desc_el is not None else "",
            "url": f"https://www.youtube.com/watch?v={video_id_el.text.strip()}",
        })
    return entries


def update_portfolio() -> None:
    config = load_json(CONFIG_FILE, {})
    keywords = [kw.lower() for kw in config.get("keywords", [])]
    channels = config.get("channels", [])

    if not keywords or not channels:
        print("Erreur: 'keywords' ou 'channels' manquant dans portfolio-config.json")
        sys.exit(1)

    archive = load_json(ARCHIVE_FILE, {"videos": []})
    old_recent = load_json(RECENT_FILE, {"videos": []})

    archive_videos = archive.get("videos", [])
    old_recent_videos = old_recent.get("videos", [])

    archive_urls = {v["url"] for v in archive_videos}
    old_recent_urls = {v["url"] for v in old_recent_videos}

    # fetch current RSS keyword matches across all channels
    current_matches: dict[str, dict] = {}
    for channel in channels:
        channel_url = channel.get("url", "")
        if not channel_url:
            continue
        print(f"\nRésolution: {channel_url}")
        channel_id = resolve_channel_id(channel_url)
        if not channel_id:
            print(f"[SKIP] impossible de résoudre {channel_url}")
            continue
        print(f"channel_id: {channel_id}")
        entries = fetch_rss(channel_id)
        print(f"Entrées RSS: {len(entries)}")

        for entry in entries:
            desc_lower = entry["description"].lower()
            print(f"[CHECK] [{entry['video_id']}] desc[:80]: {entry['description'][:80]!r}")
            if any(kw in desc_lower for kw in keywords):
                print(f"[MATCH] {entry['url']}")
                current_matches[entry["url"]] = {
                    "url": entry["url"],
                    "published": entry["published"],
                }

    current_urls = set(current_matches.keys())
    print(f"\nMatches RSS actuels: {len(current_matches)}")

    # videos that were in recent but are no longer in RSS → archive them
    newly_archived = [v for v in old_recent_videos if v["url"] not in current_urls]
    if newly_archived:
        print(f"Migration vers archive: {len(newly_archived)} vidéo(s)")
        for v in newly_archived:
            if v["url"] not in archive_urls:
                archive_videos.append(v)
                archive_urls.add(v["url"])

    # new recent = current RSS matches not already in archive
    new_recent_videos = [v for url, v in current_matches.items() if url not in archive_urls]

    # sort archive by date desc
    archive_videos = sorted(archive_videos, key=lambda v: v.get("published", ""), reverse=True)
    new_recent_videos = sorted(new_recent_videos, key=lambda v: v.get("published", ""), reverse=True)

    save_json(ARCHIVE_FILE, {"videos": archive_videos})
    save_json(RECENT_FILE, {"videos": new_recent_videos})

    # generate Portfolio/videos.json = recent + archive, sorted
    all_videos = sorted(
        new_recent_videos + archive_videos,
        key=lambda v: v.get("published", ""),
        reverse=True,
    )
    save_json(OUTPUT_FILE, {"videos": all_videos})

    print(f"\nArchive: {len(archive_videos)} | Récent: {len(new_recent_videos)} | Total site: {len(all_videos)}")


if __name__ == "__main__":
    update_portfolio()
