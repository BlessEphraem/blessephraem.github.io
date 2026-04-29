import pathlib, os, re, json

ARCHIVE_FILE = "portfolio-archive.json"
POSTS_DIR = pathlib.Path("Blog/posts")
PORTFOLIO_NAV_FILE = pathlib.Path("Blog/generated-blog-portfolio-nav.json")


def _load_json(path, default):
    p = pathlib.Path(path)
    if not p.exists():
        return default
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _extract_video_id(url):
    m = re.search(r'[?&]v=([a-zA-Z0-9_-]+)', url)
    if m:
        return m.group(1)
    m = re.search(r'youtu\.be/([a-zA-Z0-9_-]+)', url)
    if m:
        return m.group(1)
    return re.sub(r'[^a-zA-Z0-9_-]', '-', url)[-16:]


def _build_post_body(video):
    video_id = _extract_video_id(video["url"])
    url = video["url"]
    lines = [
        '<iframe',
        '  width="100%"',
        '  height="400"',
        f'  src="https://www.youtube-nocookie.com/embed/{video_id}"',
        '  frameBorder="0"',
        '  allowFullScreen',
        '/>',
        '',
        f'[Watch on YouTube]({url})',
    ]
    return '\n'.join(lines)


def write_portfolio_post(video):
    url = video.get("url", "")
    published = video.get("published", "")
    title = (video.get("title") or "").strip()
    date_str = published[:10] if published else "1970-01-01"
    video_id = _extract_video_id(url)

    filename = f"{date_str}-portfolio-{video_id}.md"
    path = POSTS_DIR / filename

    if path.exists():
        print(f"[SKIP] {filename}")
        return True

    display_title = title if title else f"Portfolio - {date_str}"
    escaped_title = display_title.replace('"', '\\"')

    frontmatter = (
        f'---\n'
        f'title: "{escaped_title}"\n'
        f'date: {published}\n'
        f'tags: [portfolio]\n'
        f'---\n'
    )

    path.write_text(frontmatter + "\n" + _build_post_body(video), encoding="utf-8")
    print(f"[POST] {filename}")
    return True


print("Generating portfolio blog posts...")
archive = _load_json(ARCHIVE_FILE, {"videos": []})
videos = archive.get("videos", [])

if not videos:
    print("No portfolio videos in archive — skipping.")
else:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    count = sum(1 for v in videos if write_portfolio_post(v))
    print(f"Processed {count} portfolio videos.")

    PORTFOLIO_NAV_FILE.write_text(
        json.dumps(
            [{"to": "/tags/portfolio", "label": "Portfolio", "position": "right"}],
            indent=2,
        ),
        encoding="utf-8",
    )
    print("Generated Blog/generated-blog-portfolio-nav.json")

print("Done.")
