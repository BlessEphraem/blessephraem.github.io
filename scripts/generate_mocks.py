import json
import os
import pathlib
import sys
from typing import Any

# Add .github/scripts to path to import markdownCleaner
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".github", "scripts"))
import markdownCleaner

# ── Helpers ──────────────────────────────────────────────────────────────────

def ensure_dir(path: str) -> None:
    pathlib.Path(path).parent.mkdir(parents=True, exist_ok=True)

def write_json(path: str, data: Any) -> None:
    ensure_dir(path)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def write_text(path: str, text: str) -> None:
    ensure_dir(path)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def write_if_missing(path: str, text: str) -> None:
    """Skip write if file already exists — preserves hand-crafted content."""
    if not os.path.exists(path):
        write_text(path, text)

def load_topic_map(path: str = "Wiki/topics/topic-map.json") -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)["mappings"]

# ── Main ─────────────────────────────────────────────────────────────────────

print("Generating mock data for local development...")

mappings = load_topic_map()

# ── 1. Wiki — mirrors sync_wiki_docs.py output ────────────────────────────────

# Navbar — same structure as CI output
navbar_entries = []
for i, m in enumerate(mappings):
    category = m["category"]
    topic    = m["topic"]
    navbar_entries.append({
        "to":       f"/mock/{category}/mock-{topic}/",
        "label":    category.capitalize(),
        "position": "right",
    })
    if i < len(mappings) - 1:
        navbar_entries.append({
            "type":     "html",
            "value":    "<span class=\"navbar__separator\">|</span>",
            "position": "right",
        })

write_json("Wiki/generated-navbar.json", navbar_entries)

# tools.json — same structure as CI output
write_json("Wiki/pages/tools.json", [
    {
        "name":      f"Mock {m['topic'].capitalize()}",
        "desc":      f"Generated mock for local development ({m['category']}).",
        "link":      f"/mock/{m['category']}/mock-{m['topic']}/",
        "iconImg":   None,
        "iconEmoji": "📦",
        "color":     m["color"],
    }
    for m in mappings
])

# icons.css — same structure as CI output (emoji fallback, no external images)
icons_rules = "\n".join(
    f".sidebar-icon-mock-{m['topic']} > .menu__link::before,\n"
    f".sidebar-icon-mock-{m['topic']} > .menu__list-item-collapsible > .menu__link::before {{\n"
    f'  content: "📦";\n'
    f"  background-image: none;\n"
    f"}}"
    for m in mappings
)
write_text("Wiki/assets/css/icons.css", f"/* Mock icons — generated locally */\n\n{icons_rules}\n")

# Docs — mirrors sync_wiki_docs.py structure exactly
for m in mappings:
    topic    = m["topic"]
    category = m["category"]
    slug     = f"mock-{topic}"
    doc_dir  = f"Wiki/docs/mock/{category}/{slug}"
    doc_id   = f"mock/{category}/{slug}/index"

    # _category_.json (repo level)
    write_json(f"{doc_dir}/_category_.json", {
        "label": f"Mock {topic.capitalize()}",
        "link":  {"type": "doc", "id": doc_id},
    })

    # index.mdx — same frontmatter as sync_wiki_docs.py
    raw_content = (
        f"# Mock {topic.capitalize()}\n\n"
        f"> Local mock. In production this is populated from GitHub repos tagged `{topic}`.\n\n"
        f"## Live Example\n\n"
        f"<!-- tabs\n\n"
        f"#### **JavaScript**\n\n"
        f"```javascript\n"
        f"console.log('This is inside the tab');\n"
        f"```\n\n"
        f"#### **Python**\n\n"
        f"```python\n"
        f"print('This is inside the tab')\n"
        f"```\n\n"
        f"-->\n"
    )
    cleaned_content = markdownCleaner.clean_for_mdx(raw_content, is_wiki=True)
    write_text(f"{doc_dir}/index.mdx", (
        f"---\n"
        f"title: Mock {topic.capitalize()}\n"
        f"hide_title: true\n"
        f"pagination_prev: null\n"
        f"pagination_next: null\n"
        f"---\n\n"
        f"{cleaned_content}"
    ))

    # releases.mdx — same frontmatter as sync_wiki_docs.py
    raw_releases = (
        f"# 📥 Releases\n\nNo releases in local mock mode.\n"
    )
    cleaned_releases = markdownCleaner.clean_for_mdx(raw_releases, is_wiki=True)
    write_text(f"{doc_dir}/releases.mdx", (
        f"---\n"
        f"title: \"📥 Releases\"\n"
        f"sidebar_position: 0\n"
        f"pagination_prev: null\n"
        f"pagination_next: null\n"
        f"---\n\n"
        f"{cleaned_releases}"
    ))

# Styling test page — gitignored via Wiki/docs/mock-category, never in nav/sidebar
write_json("Wiki/docs/mock-category/mock-repo/_category_.json", {
    "label": "Mock Repo",
    "link":  {"type": "doc", "id": "mock-category/mock-repo/index"},
})
raw_repo_content = "# Mock Repo\n\nGenerated mock document for local testing.\n"
cleaned_repo_content = markdownCleaner.clean_for_mdx(raw_repo_content, is_wiki=True)
write_text(
    "Wiki/docs/mock-category/mock-repo/index.mdx",
    f"---\ntitle: Mock Repo\n---\n\n{cleaned_repo_content}",
)

# ── 2. Blog — mirrors sync_blog_posts.py + sync_blog_portfolio.py output ─────

write_json("Blog/generated-blog-navbar.json", [
    {"to": f"/tags/{m['category']}", "label": m["category"].capitalize(), "position": "right"}
    for m in mappings
])

write_json("Blog/generated-blog-portfolio-nav.json", [
    {"to": "/tags/portfolio", "label": "Portfolio", "position": "right"}
])

write_json("Blog/src/data/generated-blog-sidebar.json", [
    {
        "category": m["category"],
        "label":    m["category"].capitalize(),
        "repos":    [{"name": f"Mock {m['topic'].capitalize()}", "slug": f"mock-{m['topic']}", "iconImg": None}],
    }
    for m in mappings
])

for m in mappings:
    topic    = m["topic"]
    category = m["category"]
    write_text(
        f"Blog/posts/2026-01-01-mock-{topic}-v1.0.0.md",
        (
            f"---\n"
            f"title: \"Mock {topic.capitalize()} v1.0.0\"\n"
            f"date: 2026-01-01T00:00:00Z\n"
            f"tags: [{category}, mock-{topic}]\n"
            f"---\n\n"
            f"## What's Changed\n\n- Mock release entry for local development.\n"
        ),
    )

write_text(
    "Blog/posts/2026-01-01-portfolio-mock-video.md",
    (
        "---\n"
        "title: \"Mock Video Post\"\n"
        "date: 2026-01-01T00:00:00Z\n"
        "tags: [portfolio]\n"
        "---\n\n"
        '<iframe width="560" height="315" src="https://www.youtube.com/embed/kb6MKt-M79M" '
        'frameborder="0" allowfullscreen></iframe>\n'
    ),
)

# ── 3. Portfolio — mirrors update_portfolio.py output ────────────────────────

mock_videos = [
    {"url": "https://www.youtube.com/watch?v=kb6MKt-M79M", "published": "2026-01-01", "title": "Mock Video 1"},
    {"url": "https://www.youtube.com/watch?v=XL-DNin7msc", "published": "2026-01-02", "title": "Mock Video 2"},
    {"url": "https://www.youtube.com/watch?v=zxZiXyFmvV4", "published": "2026-01-03", "title": "Mock Video 3"},
]

write_json("portfolio-archive.json", {"videos": mock_videos})
write_json("portfolio-recent.json",  {"videos": mock_videos})
write_json("Portfolio/videos.json",  {"videos": mock_videos})

print("Mock data generated successfully!")
