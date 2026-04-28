const BLOB_PERIOD = 9; // seconds, matches index.html

function ensureBackgroundElements() {
  if (document.getElementById('blog-bg-grid')) return;

  // Grid
  const grid = document.createElement('div');
  grid.id = 'blog-bg-grid';
  document.body.appendChild(grid);

  // Yellow blob (top-right)
  const blobYellow = document.createElement('div');
  blobYellow.className = 'blog-blob blog-blob-yellow';
  document.body.appendChild(blobYellow);

  // Cyan blob (bottom-left)
  const blobCyan = document.createElement('div');
  blobCyan.className = 'blog-blob blog-blob-cyan';
  document.body.appendChild(blobCyan);
}

function syncBlobAnimations() {
  if (!sessionStorage.getItem('blobEpoch')) {
    sessionStorage.setItem('blobEpoch', Date.now());
  }
  const elapsed = (Date.now() - +sessionStorage.getItem('blobEpoch')) / 1000;

  const yellow = document.querySelector('.blog-blob-yellow');
  const cyan   = document.querySelector('.blog-blob-cyan');
  if (yellow) yellow.style.animationDelay = -(elapsed % BLOB_PERIOD) + 's';
  if (cyan)   cyan.style.animationDelay   = -((elapsed + 4.5) % BLOB_PERIOD) + 's';
}

function getOverlay() {
  let el = document.getElementById('blog-page-transition');
  if (!el) {
    el = document.createElement('div');
    el.id = 'blog-page-transition';
    document.body.appendChild(el);
  }
  return el;
}

export function onRouteDidUpdate() {
  ensureBackgroundElements();
  syncBlobAnimations();

  const overlay = getOverlay();
  overlay.style.animation = 'none';
  overlay.offsetHeight; // force reflow
  overlay.style.animation = 'blogOverlayEnter 0.55s ease-out both';
}
