window.appRouter = {
    isAnimating: false,
    currentPath: window.location.pathname,
    
    getContentEls() {
        return Array.from(document.body.children).filter(
            el => !el.matches('.bg-grid, .blob, #page-transition, script')
        );
    },

    init() {
        this.bindEvents();
        window.addEventListener('popstate', (e) => this.handlePopState(e));
        window.addEventListener('pageshow', (e) => {
            if (!e.persisted) return;
            this.isAnimating = false;
            this.getContentEls().forEach(el => {
                el.style.opacity = '1';
            });
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
        
        this.getContentEls().forEach(el => {
            el.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], { duration: 320, easing: 'ease-in' });
            el.style.opacity = '0';
        });
        
        setTimeout(() => { window.location.href = url; }, 320);
    },

    async navigateSPA(url, isPopState = false) {
        if (this.isAnimating) return;

        const targetUrl = new URL(url);
        if (targetUrl.pathname === this.currentPath) {
            if (targetUrl.hash) {
                const el = document.querySelector(targetUrl.hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        this.isAnimating = true;

        if (!isPopState) {
            this.getContentEls().forEach(el => {
                el.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], { duration: 320, easing: 'ease-in' });
                el.style.opacity = '0';
            });
        }

        try {
            const oldUrl = window.location.href;
            
            // Promise.all to fetch HTML while animation plays
            const [response] = await Promise.all([
                fetch(url),
                new Promise(resolve => setTimeout(resolve, isPopState ? 0 : 320))
            ]);

            if (!response.ok) throw new Error('Network response was not ok');
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            if (!isPopState) {
                window.history.pushState({}, '', url);
            }
            this.currentPath = new URL(url).pathname;
            document.title = doc.title;

            const stylePromises = [];

            // --- Sync Stylesheets ---
            const currentStyles = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'));
            const newStyles = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"], style'));

            // 1. Ajouter les nouveaux styles et ATTENDRE qu'ils chargent
            newStyles.forEach(style => {
                if (style.tagName.toLowerCase() === 'link') {
                    const href = style.getAttribute('href');
                    if (!href) return;
                    const newResolved = new URL(href, url).href;
                    
                    const isAlreadyLoaded = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).some(currentStyle => {
                        const currentHref = currentStyle.getAttribute('href');
                        if (!currentHref) return false;
                        const currentResolved = new URL(currentHref, window.location.href).href;
                        return currentResolved === newResolved;
                    });
                    
                    if (!isAlreadyLoaded) {
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = newResolved;
                        stylePromises.push(new Promise((resolve) => {
                            newLink.onload = resolve;
                            newLink.onerror = resolve;
                        }));
                        document.head.appendChild(newLink);
                    }
                } else {
                    const isAlreadyLoaded = Array.from(document.head.querySelectorAll('style')).some(currentStyle => {
                        return currentStyle.innerHTML === style.innerHTML;
                    });
                    if (!isAlreadyLoaded) {
                        const newStyle = document.createElement('style');
                        newStyle.innerHTML = style.innerHTML;
                        document.head.appendChild(newStyle);
                    }
                }
            });
            
            // 2. ATTENDRE que tout le nouveau CSS soit complètement téléchargé et appliqué
            await Promise.all(stylePromises);

            // 3. SEULEMENT ENSUITE, on retire les anciens styles pour éviter de dénuder la page
            currentStyles.forEach(style => {
                if (style.tagName.toLowerCase() === 'link') {
                    const href = style.getAttribute('href');
                    if (!href) return;
                    const currentResolved = new URL(href, oldUrl).href;
                    
                    const isStillNeeded = newStyles.some(newStyle => {
                        if (newStyle.tagName.toLowerCase() !== 'link') return false;
                        const newHref = newStyle.getAttribute('href');
                        if (!newHref) return false;
                        const newResolved = new URL(newHref, url).href;
                        return currentResolved === newResolved;
                    });
                    
                    if (!isStillNeeded) style.remove();
                } else {
                    const isStillNeeded = newStyles.some(newStyle => {
                        if (newStyle.tagName.toLowerCase() !== 'style') return false;
                        return newStyle.innerHTML === style.innerHTML;
                    });
                    if (!isStillNeeded) style.remove();
                }
            });

            // Optionnel: Donner le temps au navigateur de recalculer le DOM
            await new Promise(r => requestAnimationFrame(r));
            await new Promise(r => requestAnimationFrame(r));

            // 4. Supprimer chirurgicalement l'ancien contenu
            this.getContentEls().forEach(el => el.remove());

            // 5. Extraire et insérer le nouveau contenu
            const newContentEls = Array.from(doc.body.children).filter(
                el => !el.matches('.bg-grid, .blob, #page-transition, script')
            );
            
            newContentEls.forEach(el => {
                el.style.opacity = '0';
                document.body.appendChild(el);
            });

            // Scroll à la bonne position
            const hash = new URL(window.location.href).hash;
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

            // Relancer les scripts pour que le carrousel/bontons marchent
            const scripts = doc.body.querySelectorAll('script');
            scripts.forEach(oldScript => {
                if (oldScript.src) {
                    const existing = document.querySelector(`script[src="${oldScript.getAttribute('src')}"]`);
                    if (!existing) {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        document.body.appendChild(newScript);
                    }
                } else {
                    const newScript = document.createElement('script');
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    document.body.appendChild(newScript);
                }
            });

            // Explicitly re-initialize page logic if scripts are already loaded
            setTimeout(() => {
                if (document.querySelector('.carousel-container') && typeof window.initPortfolio === 'function') {
                    window.initPortfolio();
                }
                if (document.querySelector('.videos-page') && typeof window.initVideos === 'function') {
                    window.initVideos();
                }
                if (document.querySelector('.hero .name') && typeof window.initRoot === 'function') {
                    window.initRoot();
                }
            }, 50);

            // Fade in content
            await new Promise(r => requestAnimationFrame(r));
            this.getContentEls().forEach(el => {
                el.animate([
                    { opacity: 0 },
                    { opacity: 1 }
                ], { duration: 300, easing: 'ease-out' });
                el.style.opacity = '1';
            });
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 300);
            
        } catch (error) {
            console.error('SPA error:', error);
            window.location.href = url; // Fallback sécurité
        }
    },

    handlePopState(e) {
        const newUrl = new URL(window.location.href);
        if (newUrl.pathname === this.currentPath) {
            if (newUrl.hash) {
                const el = document.querySelector(newUrl.hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }
        this.getContentEls().forEach(el => {
            el.style.opacity = '0';
        });
        this.navigateSPA(window.location.href, true);
    }
};

if (!window.appRouterInitialized) {
    window.appRouterInitialized = true;
    document.addEventListener('DOMContentLoaded', () => {
        window.appRouter.init();
    });
}
