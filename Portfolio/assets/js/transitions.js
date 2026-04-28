window.initBlobs = function() {
    if (!sessionStorage.getItem('blobEpoch')) {
        sessionStorage.setItem('blobEpoch', Date.now());
    }
    const elapsed = (Date.now() - +sessionStorage.getItem('blobEpoch')) / 1000;
    const PERIOD = 9;
    const pink = document.querySelector('.blob-pink');
    const cyan = document.querySelector('.blob-cyan');
    if (pink) pink.style.animationDelay = -(elapsed % PERIOD) + 's';
    if (cyan) cyan.style.animationDelay = -((elapsed + 4.5) % PERIOD) + 's';
};
window.initBlobs();
