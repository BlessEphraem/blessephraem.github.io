import json
import os
import pathlib

def ensure_dir(path):
    pathlib.Path(path).parent.mkdir(parents=True, exist_ok=True)

def write_json(path, data):
    ensure_dir(path)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def write_text(path, text):
    ensure_dir(path)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

print("Generating mock data for local development...")

# 1. Wiki Mocks
write_json("Wiki/generated-navbar.json", [
    {"to": "/mock-category/mock-repo/", "position": "right", "label": "Mock Category"}
])

write_json("Wiki/pages/tools.json", [
    {
        "name": "Mock Tool",
        "desc": "This is a local development mock tool.",
        "link": "/mock-category/mock-repo/",
        "iconImg": None,
        "iconEmoji": "📦",
        "color": "#ffffff"
    }
])

write_text("Wiki/assets/css/icons.css", "/* Mock CSS */\n")

# Mock Docs
write_json("Wiki/docs/mock-category/_category_.json", {"label": "Mock Category"})
write_json("Wiki/docs/mock-category/mock-repo/_category_.json", {"label": "Mock Repo", "link": {"type": "doc", "id": "mock-category/mock-repo/index"}})
write_text("Wiki/docs/mock-category/mock-repo/index.mdx", "---\ntitle: Mock Repo\n---\n\n# Mock Repo\n\nThis is a generated mock document for local testing.")

# 2. Blog Mocks
write_json("Blog/generated-blog-navbar.json", [
    {"to": "/tags/mock-category", "label": "Mock Category", "position": "right"}
])

write_json("Blog/generated-blog-portfolio-nav.json", [
    {"to": "/tags/portfolio", "label": "Portfolio", "position": "right"}
])

write_json("Blog/src/data/generated-blog-sidebar.json", [
    {
        "category": "mock-category",
        "label": "Mock Category",
        "repos": [{"name": "Mock Repo", "slug": "mock-repo", "iconImg": None}]
    }
])

write_text("Blog/posts/2026-01-01-mock-repo-mock-release.md", "---\ntitle: \"Mock Repo Latest Release\"\ndate: 2026-01-01T00:00:00Z\ntags: [mock-category, mock-repo]\n---\n\n# Latest Release\nThis is a mock post representing a GitHub release.")
write_text("Blog/posts/2026-01-01-portfolio-mock-video.md", "---\ntitle: \"Mock Video Post\"\ndate: 2026-01-01T00:00:00Z\ntags: [portfolio]\n---\n\n# Mock Video\nThis is a mock portfolio post featuring a video embed.")

# 3. Portfolio Mocks
mock_videos = [
    {"url": "https://www.youtube.com/watch?v=kb6MKt-M79M", "published": "2026-01-01", "title": "Mock Video 1"},
    {"url": "https://www.youtube.com/watch?v=XL-DNin7msc", "published": "2026-01-02", "title": "Mock Video 2"},
    {"url": "https://www.youtube.com/watch?v=zxZiXyFmvV4", "published": "2026-01-03", "title": "Mock Video 3"}
]

write_json("portfolio-archive.json", {"videos": mock_videos})
write_json("portfolio-recent.json", {"videos": mock_videos})
write_json("Portfolio/videos.json", {"videos": mock_videos})

print("Mock data generated successfully!")
