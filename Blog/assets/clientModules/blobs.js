import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  const initBlobs = () => {
    // Only inject once
    if (document.querySelector('.blob-yellow')) return;

    const blobYellow = document.createElement('div');
    blobYellow.className = 'blob blob-yellow';
    
    const blobOrange = document.createElement('div');
    blobOrange.className = 'blob blob-orange';
    
    // Insert them at the top of the body
    document.body.insertBefore(blobOrange, document.body.firstChild);
    document.body.insertBefore(blobYellow, document.body.firstChild);

    // Sync animation with the exact same epoch as index.html
    if (!sessionStorage.getItem('blobEpoch')) {
      sessionStorage.setItem('blobEpoch', Date.now());
    }
    const elapsed = (Date.now() - +sessionStorage.getItem('blobEpoch')) / 1000;
    const PERIOD = 9;
    
    blobYellow.style.animationDelay = -(elapsed % PERIOD) + 's';
    blobOrange.style.animationDelay = -((elapsed + 4.5) % PERIOD) + 's';
  };

  // Wait for Docusaurus or document load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlobs);
  } else {
    initBlobs();
  }
}
