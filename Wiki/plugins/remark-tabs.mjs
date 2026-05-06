/**
 * remark-tabs — transforms tab marker comments into Docusaurus <Tabs>/<TabItem>.
 *
 * .md files (GitHub-compatible — renders as headings + code blocks on GitHub):
 *   <!-- tabs
 *   #### **JavaScript**
 *   ```javascript
 *   code here
 *   ```
 *   -->
 *   (markdownCleaner.py transforms this into the MDX form below)
 *
 * .mdx files (direct MDX syntax):
 *   {/* tabs:start *\/}
 *   #### **JavaScript**
 *   ```javascript
 *   code here
 *   ```
 *   {/* tabs:end *\/}
 */

function getText(node) {
  if (node.type === 'text')         return node.value;
  if (Array.isArray(node.children)) return node.children.map(getText).join('');
  return '';
}

function extractLabel(heading) {
  return getText(heading).trim().replace(/^\*+|\*+$/g, '').trim();
}

function slugifyLabel(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'tab';
}

function makeTabItem(label, content) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'TabItem',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'value', value: slugifyLabel(label) },
      { type: 'mdxJsxAttribute', name: 'label', value: label },
    ],
    children: content,
  };
}

function makeTabs(items) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'Tabs',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'className', value: 'code-tabs' },
      { type: 'mdxJsxAttribute', name: 'groupId',   value: 'code-language' },
    ],
    children: items,
  };
}

// Note: <Tabs>/<TabItem> are registered globally via
// Wiki/src/theme/MDXComponents.js — no import injection needed here.

function isComment(node, marker) {
  const val = (node.value ?? '').trim();
  if (node.type === 'html') {
    const m = val.match(/^<!--\s*(.*?)\s*-->$/);
    return m ? m[1] === marker : false;
  }
  if (node.type === 'mdxFlowExpression') {
    const m = val.match(/^\/\*\s*(.*?)\s*\*\/$/);
    return m ? m[1] === marker : false;
  }
  return false;
}

export default function remarkTabs() {
  return (tree) => {
    const nodes = tree.children;

    const blocks = [];
    let i = 0;
    while (i < nodes.length) {
      if (isComment(nodes[i], 'tabs:start')) {
        let found = false;
        for (let j = i + 1; j < nodes.length; j++) {
          if (isComment(nodes[j], 'tabs:end')) {
            blocks.push({ start: i, end: j });
            i = j + 1;
            found = true;
            break;
          }
        }
        if (!found) i++;
      } else {
        i++;
      }
    }

    if (blocks.length === 0) return;

    // Process in reverse so splice doesn't shift later indices
    for (const { start, end } of [...blocks].reverse()) {
      const inner = nodes.slice(start + 1, end);
      const tabs  = [];
      let label   = null;
      let content = [];

      for (const node of inner) {
        if (node.type === 'heading' && node.depth === 4) {
          if (label !== null) tabs.push(makeTabItem(label, content));
          label   = extractLabel(node);
          content = [];
        } else if (label !== null) {
          content.push(node);
        }
      }
      if (label !== null) tabs.push(makeTabItem(label, content));

      if (tabs.length > 0) {
        nodes.splice(start, end - start + 1, makeTabs(tabs));
      } else {
        nodes.splice(start, end - start + 1);
      }
    }

  };
}
