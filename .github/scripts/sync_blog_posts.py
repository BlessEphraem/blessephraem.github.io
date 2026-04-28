import urllib.request, pathlib, os, re, json

with open("site.config.json", encoding="utf-8") as _f:
    _site_cfg = json.load(_f)

with open("Wiki/topics/topic-map.json", encoding="utf-8") as _f:
    _topic_cfg = json.load(_f)

token = os.environ.get("GH_TOKEN", "")
_auth_headers = {"Authorization": f"token {token}"} if token else {}

TOPIC_PRIORITY = {
    item["topic"]: (item["category"], idx)
    for idx, item in enumerate(_topic_cfg["mappings"])
}


def fetch(url):
    req = urllib.request.Request(url, headers=_auth_headers)
    with urllib.request.urlopen(req) as r:
        return r.read().decode("utf-8")


def fetch_json(url):
    hdrs = dict(_auth_headers)
    hdrs["Accept"] = "application/vnd.github+json"
    req = urllib.request.Request(url, headers=hdrs)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s-]+", "-", text).strip("-")


def _assign_category(topics):
    best = None
    for topic in topics:
        if topic in TOPIC_PRIORITY:
            cat, priority = TOPIC_PRIORITY[topic]
            if best is None or priority < best[1]:
                best = (cat, priority)
    return best[0] if best else None


def _fetch_all_repos(username):
    repos = []
    page = 1
    while True:
        data = fetch_json(
            f"https://api.github.com/users/{username}/repos"
            f"?type=owner&per_page=100&page={page}"
        )
        if not data:
            break
        repos.extend(data)
        if len(data) < 100:
            break
        page += 1
    return repos


def _fetch_all_releases(owner, repo):
    releases = []
    page = 1
    while True:
        data = fetch_json(
            f"https://api.github.com/repos/{owner}/{repo}/releases"
            f"?per_page=100&page={page}"
        )
        if not data:
            break
        releases.extend(data)
        if len(data) < 100:
            break
        page += 1
    return releases


def _sanitize_for_mdx(content):
    content = re.sub(r'\s*style="[^"]*"', '', content)
    content = re.sub(
        r'<(img|br|hr|input)([^>]*?)(?<!/)>',
        lambda m: f'<{m.group(1)}{m.group(2).rstrip()} />',
        content
    )
    content = re.sub(r'\[([^\]]+)\]\(\.docs/[^)]+\)', r'\1', content)
    return content


def _build_post_body(release):
    body = _sanitize_for_mdx((release.get("body") or "").strip())
    assets = release.get("assets") or []
    html_url = release.get("html_url", "")

    lines = []
    if body:
        lines += [body, ""]
    lines += ["## Downloads", ""]
    if assets:
        for a in assets:
            lines.append(f"- [{a.get('name', 'asset')}]({a.get('browser_download_url', '')})")
    else:
        lines.append("_No downloadable assets attached to this release._")
    if html_url:
        lines += ["", f"[View on GitHub]({html_url})"]
    return "\n".join(lines)


def write_blog_post(prog, release):
    if release.get("draft"):
        return

    tag_name = release.get("tag_name") or release.get("name") or "latest"
    published_at = release.get("published_at", "")
    date_str = published_at[:10] if published_at else "1970-01-01"

    slug = slugify(prog["repo"])
    tag_slug = slugify(tag_name)
    filename = f"{date_str}-{slug}-{tag_slug}.md"
    path = pathlib.Path("Blog/posts") / filename

    if path.exists():
        print(f"[SKIP] {filename}")
        return

    title = f"{prog['display_name']} {tag_name}".replace('"', '\\"')
    category = prog["category"]

    frontmatter = (
        f'---\n'
        f'title: "{title}"\n'
        f'date: {published_at}\n'
        f'tags: [{category}]\n'
        f'---\n'
    )

    path.write_text(frontmatter + "\n" + _build_post_body(release), encoding="utf-8")
    print(f"[POST] {filename}")


OWNER = _site_cfg["owner"]
print("Fetching repos...")
_all_repos = _fetch_all_repos(OWNER)

PROGRAMS = []
for _repo in _all_repos:
    if _repo.get("private") or _repo.get("archived") or _repo.get("fork"):
        continue
    _topics = _repo.get("topics", [])
    _cat = _assign_category(_topics)
    if _cat is None:
        continue
    PROGRAMS.append({
        "owner": OWNER,
        "repo": _repo["name"],
        "display_name": _repo["name"].replace("-", " "),
        "category": _cat,
    })
    print(f"[INCLUDE] {_repo['name']} → {_cat}")

pathlib.Path("Blog/posts").mkdir(parents=True, exist_ok=True)

for prog in PROGRAMS:
    print(f"Fetching releases for {prog['repo']}...")
    try:
        releases = _fetch_all_releases(prog["owner"], prog["repo"])
    except Exception as e:
        print(f"[ERROR] {prog['repo']}: {e}")
        continue
    if not releases:
        print(f"[NO RELEASES] {prog['repo']}")
        continue
    for rel in releases:
        write_blog_post(prog, rel)

print("Done.")
