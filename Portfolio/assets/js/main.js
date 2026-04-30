function getYouTubeId(url) {
    const m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
}

window.initPortfolio = function() {
    // 0. Navbar dynamique au scroll
    if (window._portfolioScrollHandler) {
        window.removeEventListener('scroll', window._portfolioScrollHandler);
    }
    
    window._portfolioScrollHandler = () => {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        // If there's no hero section (e.g. on videos.html), navbar should remain visible
        const hasHero = document.querySelector('.hero');
        if (!hasHero) {
            navbar.classList.add('scrolled');
            return;
        }

        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', window._portfolioScrollHandler);
    window._portfolioScrollHandler(); // Check immediately on load

    // 1. Menu Mobile
    const oldMobileBtn = document.querySelector('.mobile-toggle');
    if (oldMobileBtn) {
        // Clone to remove any stale event listeners from previous initializations
        const mobileBtn = oldMobileBtn.cloneNode(true);
        oldMobileBtn.parentNode.replaceChild(mobileBtn, oldMobileBtn);
        
        const navLinks = document.querySelector('.nav-links');
        
        mobileBtn.addEventListener('click', () => {
            if (!navLinks) return;
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active')
                ? '<i class="fa-solid fa-times"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (!navLinks) return;
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    // 2. Typing Effect
    if (window._typingTimeout) {
        clearTimeout(window._typingTimeout);
    }
    
    const typingElement = document.querySelector('.typing-text');
    if(typingElement) {
        const texts = ["Éditeur Vidéo", "Graphiste", "Artiste FX", "Motion Designer"];
        let count = 0;
        let index = 0;
        let currentText = "";
        let letter = "";

        function type() {
            // Stop if element is no longer in the DOM (e.g. navigated away)
            if (!document.querySelector('.typing-text')) return; 
            
            if (count === texts.length) { count = 0; }
            currentText = texts[count];
            letter = currentText.slice(0, ++index);

            const el = document.querySelector('.typing-text');
            if(el) el.textContent = letter;

            if (letter.length === currentText.length) {
                count++;
                index = 0;
                window._typingTimeout = setTimeout(type, 2000);
            } else {
                window._typingTimeout = setTimeout(type, 100);
            }
        }
        type();
    }

    // 3. Formulaire de contact (FORMSPREE AJAX)
    const oldForm = document.getElementById("contact-form");
    if(oldForm) {
        // Clone to reset listeners
        const form = oldForm.cloneNode(true);
        oldForm.parentNode.replaceChild(form, oldForm);
        
        form.addEventListener("submit", async function(event) {
            event.preventDefault();

            const status = document.getElementById("form-status");
            const btn = form.querySelector("button");
            const data = new FormData(form);

            const originalBtnText = btn.textContent;
            btn.textContent = "Envoi...";
            btn.disabled = true;

            try {
                const response = await fetch('%%FORMSPREE_ENDPOINT%%', {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    status.innerHTML = "Merci ! Votre message a bien été envoyé.";
                    status.style.color = "#3ad0ff";
                    form.reset();
                } else {
                    const result = await response.json();
                    if (result.errors) {
                        status.innerHTML = result.errors.map(error => error.message).join(", ");
                    } else {
                        status.innerHTML = "Oups ! Une erreur est survenue.";
                    }
                    status.style.color = "#ff1796";
                }
            } catch (error) {
                status.innerHTML = "Erreur réseau. Vérifiez votre connexion.";
                status.style.color = "#ff1796";
            } finally {
                btn.textContent = originalBtnText;
                btn.disabled = false;
            }
        });
    }

    // 3.5. Auto-update YouTube Titles
    const updateVideoTitles = () => {
        document.querySelectorAll('.video-card').forEach(card => {
            const iframe = card.querySelector('iframe');
            const titleEl = card.querySelector('.video-title');
            if (iframe && titleEl && iframe.src) {
                const match = iframe.src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                    const videoId = match[1];
                    fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
                        .then(r => r.json())
                        .then(data => { if (data.title) titleEl.textContent = data.title; })
                        .catch(() => {});
                }
            }
        });
    };

    // 4. Portfolio 3D Carousel Logic
    const videoCards = document.querySelectorAll('.video-card');
    if(videoCards.length > 0) {
        videoCards.forEach(card => {
            // These are fresh nodes inserted by the router, so it's safe to add listeners
            card.addEventListener('click', () => {
                if (window.innerWidth <= 900) return;
                if (card.classList.contains('pos-center')) return;

                const currentCenter = document.querySelector('.video-card.pos-center');
                if(!currentCenter) return;

                let clickedPositionClass = '';
                if(card.classList.contains('pos-left')) clickedPositionClass = 'pos-left';
                else if(card.classList.contains('pos-right')) clickedPositionClass = 'pos-right';
                if(!clickedPositionClass) return;

                card.classList.remove(clickedPositionClass);
                card.classList.add('pos-center');
                currentCenter.classList.remove('pos-center');
                currentCenter.classList.add(clickedPositionClass);

                const iframe = currentCenter.querySelector('iframe');
                if(iframe) { const s = iframe.src; iframe.src = s; }
            });
        });
    }

    // 5. Chargement vitrine depuis video-carousel.json
    if (document.querySelector('.carousel-container')) {
        // Use an absolute path /Portfolio/... to ensure it resolves correctly regardless of current URL
        const jsonPath = window.location.pathname.includes('/Portfolio/') 
            ? 'videos/video-carousel.json' 
            : '/Portfolio/videos/video-carousel.json';

        fetch(jsonPath)
            .then(r => r.ok ? r.json() : Promise.reject('Failed to load ' + jsonPath))
            .then(data => {
                const featured = data.featured || [];
                const slots = ['video-left', 'video-center', 'video-right'];
                slots.forEach((id, i) => {
                    if (!featured[i]) return;
                    const vid = getYouTubeId(featured[i].url);
                    if (!vid) return;
                    const iframe = document.querySelector('#' + id + ' iframe');
                    if (iframe) iframe.src = 'https://www.youtube-nocookie.com/embed/' + vid;
                });
                updateVideoTitles();
            })
            .catch(e => console.error('Carousel load error:', e));
    }
};
window.initPortfolio();
