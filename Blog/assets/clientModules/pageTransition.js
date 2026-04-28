const BLOB_PERIOD = 9; // seconds, matches index.html

// Returns true if elements were freshly created, false if already present.
function ensureBackgroundElements() {
  if (document.getElementById('blog-bg-grid')) return false;

  const grid = document.createElement('div');
  grid.id = 'blog-bg-grid';
  document.body.appendChild(grid);

  const blobYellow = document.createElement('div');
  blobYellow.className = 'blog-blob blog-blob-yellow';
  document.body.appendChild(blobYellow);

  const blobCyan = document.createElement('div');
  blobCyan.className = 'blog-blob blog-blob-cyan';
  document.body.appendChild(blobCyan);

  return true;
}

// Only needed on first creation to align with the cross-page epoch stored in sessionStorage.
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

// Cover the outgoing page instantly so React unmount/remount is hidden.
export function onRouteWillChange() {
  const overlay = getOverlay();
  overlay.style.transition = 'none';
  overlay.style.animation  = 'none';
  overlay.style.opacity    = '1';
}

// Blobs keep running via CSS — only sync animationDelay on first creation.
export function onRouteDidUpdate() {
  const justCreated = ensureBackgroundElements();
  if (justCreated) syncBlobAnimations();

  const overlay = getOverlay();
  overlay.style.opacity   = '';
  overlay.style.animation = 'none';
  overlay.offsetHeight; // force reflow
  overlay.style.animation = 'blogOverlayEnter 0.55s ease-out both';
}
