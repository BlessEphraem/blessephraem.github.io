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
  const overlay = getOverlay();
  overlay.style.animation = 'none';
  overlay.offsetHeight; // force reflow
  overlay.style.animation = 'blogOverlayEnter 0.55s ease-out both';
}
