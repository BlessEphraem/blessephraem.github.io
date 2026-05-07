import re

def slugify(text):
    """Common slugification logic for URLs and IDs."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s-]+', '-', text).strip('-')

def css_to_jsx_style(css):
    """Converts inline CSS string to a JSX-compatible style object string."""
    props = {}
    for decl in css.split(';'):
        decl = decl.strip()
        if ':' not in decl:
            continue
        prop, _, val = decl.partition(':')
        prop = prop.strip()
        val = val.strip().replace("'", "\\'")
        parts = prop.split('-')
        camel = parts[0] + ''.join(p.capitalize() for p in parts[1:])
        props[camel] = val
    return ', '.join("{}: '{}'".format(k, v) for k, v in props.items())

def clean_for_mdx(content, site_cfg=None, img_prefix=None, is_wiki=False):
    """
    Centralized MDX cleaning logic.
    Handles HTML comments, self-closing tags, JSX attributes, and Wiki-specific rewrites.
    """
    # 1. Comment Transformations
    # Remove wiki-hide blocks
    content = re.sub(r'<!--\s*wiki-hide-start\s*-->.*?<!--\s*wiki-hide-end\s*-->', '', content, flags=re.DOTALL)
    
    # Unwrap <!-- embed ... --> tags
    content = re.sub(r'<!--\s*embed\s*(.*?)-->', lambda m: m.group(1).strip(), content, flags=re.DOTALL)
    
    # Transform <!-- tabs ... --> blocks into MDX-safe markers
    def transform_tabs(match):
        inner = match.group(1).strip()
        return f"{{/* tabs:start */}}\n\n{inner}\n\n{{/* tabs:end */}}"
    content = re.sub(r'<!--\s*tabs\s*\n?(.*?)-->', transform_tabs, content, flags=re.DOTALL)

    # 2. HTML Sanitization & JSX Compatibility
    
    # Convert style="background: red" to style={{background: 'red'}} (Wiki only, or strip for Blog)
    if is_wiki:
        content = re.sub(
            r'style="([^"]*)"',
            lambda m: 'style={{' + css_to_jsx_style(m.group(1)) + '}}',
            content
        )
    else:
        content = re.sub(r'\s*style="[^"]*"', '', content)

    # Ensure specific tags are self-closing
    content = re.sub(
        r'<(img|br|hr|input|meta|link)([^>]*?)(?<!/)>',
        lambda m: '<{}{} />'.format(m.group(1), m.group(2).rstrip()),
        content
    )
    # Remove trailing </br> or </hr>
    content = re.sub(r'</(br|hr)>', lambda m: '<{} />'.format(m.group(1)), content)

    # YouTube nocookie & attributes
    content = re.sub(
        r'src="https://www\.youtube\.com/embed/([^"]+)"',
        r'src="https://www.youtube-nocookie.com/embed/\1"',
        content
    )
    content = re.sub(r'\bframeborder=', 'frameBorder=', content, flags=re.IGNORECASE)
    content = re.sub(r'\ballowfullscreen\b', 'allowFullScreen', content, flags=re.IGNORECASE)

    # GitHub Video URLs -> <video>
    content = re.sub(
        r'(https://github\.com/[^\s)\]"]+\.(?:mp4|webm))',
        r'<video controls width="100%"><source src="\1" /></video>',
        content
    )

    # 3. Wiki Specific Rewrites
    if is_wiki and site_cfg:
        domain_wiki = site_cfg.get("domain", "") + "/wiki"
        
        def transform_url(url):
            if url.startswith(domain_wiki):
                url = url[len(site_cfg["domain"]):]
            if "://" in url or url.startswith(('#', 'mailto:', 'tel:', '/')):
                return url
            
            parts = url.split('#', 1)
            path = parts[0]
            anchor = parts[1] if len(parts) > 1 else None
            
            is_readme = "readme.md" in path.lower() or path.lower() == "readme"
            is_md = path.lower().endswith(".md")
            
            if is_readme:
                path = f"/wiki/programs/{img_prefix}/" if img_prefix else "./"
            elif is_md:
                path = path[:-3]
                path_parts = [slugify(p) for p in path.split('/') if p and p not in ('.', '..')]
                slug_path = "/".join(path_parts)
                path = f"/wiki/programs/{img_prefix}/{slug_path}" if img_prefix else slug_path
            
            return f"{path}#{slugify(anchor)}" if anchor else path

        # Transform Markdown links [text](url) and HTML href="url"
        content = re.sub(r'\[((?:\[[^\]]*\]|[^\]])*)\]\(([^)]+)\)',
                         lambda m: f'[{m.group(1)}]({transform_url(m.group(2))})', content)
        content = re.sub(r'href="([^"]+)"', lambda m: f'href="{transform_url(m.group(1))}"', content)

    # Handle <!-- tabs-start --> ... <!-- tabs-end --> (list-based format, content visible on GitHub)
    content = re.sub(
        r'<!--\s*tabs-start\s*-->(.*?)<!--\s*tabs-end\s*-->',
        lambda m: '{/* tabs:start */}\n\n' + m.group(1).strip() + '\n\n{/* tabs:end */}',
        content,
        flags=re.DOTALL
    )

    # 4. Final comment pass: convert remaining HTML comments to MDX comments
    # This prevents MDX compilation errors while preserving the comments.
    content = re.sub(r'<!--\s*(.*?)\s*-->', r'{/* \1 */}', content, flags=re.DOTALL)

    return content
