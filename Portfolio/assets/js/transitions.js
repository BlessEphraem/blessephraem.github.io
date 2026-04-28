(function () {
    if (!sessionStorage.getItem('blobEpoch')) {
        sessionStorage.setItem('blobEpoch', Date.now());
    }
    const elapsed = (Date.now() - +sessionStorage.getItem('blobEpoch')) / 1000;
    const PERIOD = 9;
    const pink = document.querySelector('.blob-pink');
    const cyan = document.querySelector('.blob-cyan');
    if (pink) pink.style.animationDelay = -(elapsed % PERIOD) + 's';
    if (cyan) cyan.style.animationDelay = -((elapsed + 4.5) % PERIOD) + 's';
})();

function leaveAndNavigate(url) {
    const overlay = document.getElementById('page-transition');
    if (overlay) {
        overlay.style.animation = 'none';
        overlay.offsetHeight;
        overlay.style.animation = 'overlayLeave 0.35s ease-in both';
        setTimeout(() => { window.location.href = url; }, 340);
    } else {
        window.location.href = url;
    }
}

window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;
    overlay.style.animation = 'none';
    overlay.offsetHeight;
    overlay.style.animation = 'overlayEnter 0.55s ease-out both';
});
