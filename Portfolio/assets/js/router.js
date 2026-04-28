window.appRouter = {
    isAnimating: false,
    
    init() {
        this.bindEvents();
        window.addEventListener('popstate', (e) => this.handlePopState(e));
        window.addEventListener('pageshow', (e) => {
            if (!e.persisted) return;
            const overlay = document.getElementById('page-transition');
            if (!overlay) return;
            overlay.style.animation = 'none';
            void overlay.offsetHeight;
            overlay.style.animation = 'overlayEnter 0.55s ease-out both';
        });
    },

    bindEvents() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            if (link.getAttribute('target') === '_blank') return;
            
            // Only intercept local links
            const url = new URL(link.href);
            if (url.origin !== window.location.origin) return;

            if (href.startsWith('#')) return;
            if (href.startsWith('mailto:')) return;

            // If it's going to /news/ or /wiki/, do hard nav with animation.
            if (url.pathname.includes('/news') || url.pathname.includes('/wiki')) {
                e.preventDefault();
                this.leaveAndNavigate(link.href);
                return;
            }

            // SPA navigation for Portfolio & Index
            e.preventDefault();
            this.navigateSPA(link.href);
        });
    },

    leaveAndNavigate(url) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const overlay = document.getElementById('page-transition');
        if (overlay) {
            overlay.style.animation = 'none';
            void overlay.offsetHeight;
            overlay.style.animation = 'overlayLeave 0.35s ease-in both';
            setTimeout(() => { window.location.href = url; }, 340);
        } else {
            window.location.href = url;
        }
    },

    async navigateSPA(url, isPopState = false) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const overlay = document.getElementById('page-transition');
        if (overlay) {
            overlay.style.animation = 'none';
            void overlay.offsetHeight;
            overlay.style.animation = 'overlayLeave 0.35s ease-in both';
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            setTimeout(() => {
                document.title = doc.title;

                // --- Sync Stylesheets ---
                const currentStyles = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'));
                const newStyles = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'));

                // 1. Remove old styles that are not in the new document
                currentStyles.forEach(style => {
                    const href = style.getAttribute('href');
                    if (!href) return;
                    const currentUrl = new URL(href, window.location.href).href;
                    
                    const isStillNeeded = newStyles.some(newStyle => {
                        const newHref = newStyle.getAttribute('href');
                        if (!newHref) return false;
                        const newUrl = new URL(newHref, url).href;
                        return currentUrl === newUrl;
                    });
                    
                    if (!isStillNeeded) style.remove();
                });

                // 2. Add new styles from the new document
                newStyles.forEach(style => {
                    const href = style.getAttribute('href');
                    if (!href) return;
                    const newUrl = new URL(href, url).href;
                    
                    const isAlreadyLoaded = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).some(currentStyle => {
                        const currentHref = currentStyle.getAttribute('href');
                        if (!currentHref) return false;
                        const currentResolved = new URL(currentHref, window.location.href).href;
                        return currentResolved === newUrl;
                    });
                    
                    if (!isAlreadyLoaded) {
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = newUrl;
                        document.head.appendChild(newLink);
                    }
                });
                // ------------------------

                document.body.innerHTML = doc.body.innerHTML;

                if (!isPopState) {
                    window.history.pushState({}, '', url);
                    const hash = new URL(url).hash;
                    if (hash) {
                        const target = document.querySelector(hash);
                        if (target) {
                            target.scrollIntoView();
                        } else {
                            window.scrollTo(0, 0);
                        }
                    } else {
                        window.scrollTo(0, 0);
                    }
                }

                // Re-evaluate scripts so they bind to the new DOM
                const scripts = document.body.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                const newOverlay = document.getElementById('page-transition');
                if (newOverlay) {
                    newOverlay.style.animation = 'none';
                    void newOverlay.offsetHeight;
                    newOverlay.style.animation = 'overlayEnter 0.55s ease-out both';
                }
                
                this.isAnimating = false;
            }, 340); // Wait for fade out
            
        } catch (error) {
            console.error('SPA error:', error);
            window.location.href = url;
        }
    },

    handlePopState(e) {
        this.navigateSPA(window.location.href, true);
    }
};

if (!window.appRouterInitialized) {
    window.appRouterInitialized = true;
    document.addEventListener('DOMContentLoaded', () => {
        window.appRouter.init();
    });
}
