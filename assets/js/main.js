document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Menu Mobile
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fa-solid fa-times"></i>' 
                : '<i class="fa-solid fa-bars"></i>';
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    // 2. Typing Effect
    const typingElement = document.querySelector('.typing-text');
    if(typingElement) {
        const texts = ["Éditeur Vidéo", "Graphiste", "Artiste FX", "Motion Designer"];
        let count = 0;
        let index = 0;
        let currentText = "";
        let letter = "";
        
        (function type() {
            if (count === texts.length) { count = 0; }
            currentText = texts[count];
            letter = currentText.slice(0, ++index);
            
            typingElement.textContent = letter;
            
            if (letter.length === currentText.length) {
                count++;
                index = 0;
                setTimeout(type, 2000); 
            } else {
                setTimeout(type, 100); 
            }
        })();
    }

    // 3. Formulaire de contact (FORMSPREE AJAX)
    // C'EST ICI L'IMPLEMENTATION JAVASCRIPT
    const form = document.getElementById("contact-form");
    
    if(form) {
        form.addEventListener("submit", async function(event) {
            event.preventDefault(); // 1. On empêche le rechargement de la page
            
            const status = document.getElementById("form-status");
            const btn = form.querySelector("button");
            const data = new FormData(form);
            
            // Animation bouton
            const originalBtnText = btn.textContent;
            btn.textContent = "Envoi...";
            btn.disabled = true;

            try {
                // 2. On envoie les données à Formspree via fetch()
                const response = await fetch(atob('aHR0cHM6Ly9mb3Jtc3ByZWUuaW8vZi9tamtxenJqZw=='), {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' } // Important pour ne pas être redirigé
                });
                
                if (response.ok) {
                    status.innerHTML = "Merci ! Votre message a bien été envoyé.";
                    status.style.color = "#3ad0ff"; // Bleu
                    form.reset(); // On vide le formulaire
                } else {
                    const result = await response.json();
                    if (result.errors) {
                        status.innerHTML = result.errors.map(error => error.message).join(", ");
                    } else {
                        status.innerHTML = "Oups ! Une erreur est survenue.";
                    }
                    status.style.color = "#ff1796"; // Rouge/Rose
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
        const wrappers = document.querySelectorAll('.video-card');
        wrappers.forEach(card => {
            const iframe = card.querySelector('iframe');
            const titleEl = card.querySelector('.video-title');
            
            if(iframe && titleEl) {
                // Extract Video ID from src (embed/ID)
                const match = iframe.src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                if(match && match[1]) {
                    const videoId = match[1];
                    const apiUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
                    
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            if(data.title) {
                                titleEl.textContent = data.title;
                            }
                        })
                        .catch(err => console.error("Error fetching title for video", videoId, err));
                }
            }
        });
    };
    updateVideoTitles();

    // 4. Portfolio 3D Carousel Logic
    const videoCards = document.querySelectorAll('.video-card');
    
    if(videoCards.length > 0) {
        console.log("3D Carousel initialized with", videoCards.length, "cards.");

        videoCards.forEach(card => {
            card.addEventListener('click', () => {
                // Mobile check : on ne fait rien, comportement natif (scroll + play)
                if (window.innerWidth <= 900) return;

                // Si c'est la carte centrale, on laisse le clic passer à l'iframe (lecture)
                if (card.classList.contains('pos-center')) return;

                console.log("Swap triggered by:", card.id);

                // Identifier la carte centrale actuelle
                const currentCenter = document.querySelector('.video-card.pos-center');
                if(!currentCenter) return;

                // Quelle est la position de la carte cliquée ? (left ou right)
                let clickedPositionClass = '';
                if(card.classList.contains('pos-left')) clickedPositionClass = 'pos-left';
                else if(card.classList.contains('pos-right')) clickedPositionClass = 'pos-right';

                if(!clickedPositionClass) return;

                // --- EXECUTION DU SWAP ---

                // 1. La carte cliquée DEVIENT le centre
                card.classList.remove(clickedPositionClass);
                card.classList.add('pos-center');

                // 2. L'ancien centre PREND la place de la carte cliquée
                currentCenter.classList.remove('pos-center');
                currentCenter.classList.add(clickedPositionClass);

                // 3. STOPPER LA VIDÉO de l'ancien centre
                // On recharge l'iframe pour couper le son proprement
                const iframe = currentCenter.querySelector('iframe');
                if(iframe) {
                    const currentSrc = iframe.src;
                    iframe.src = currentSrc;
                }
            });
        });
    }
    
    // 5. 3D Tilt Effect (VanillaTilt Library)
    // Documentation: https://micku7zu.github.io/vanilla-tilt.js/
    const tiltCard = document.querySelector(".highlight-box");
    if (tiltCard && typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(tiltCard, {
            max: 15,          // Angle max d'inclinaison
            speed: 400,       // Vitesse de transition
            glare: true,      // Activer l'effet de brillance
            "max-glare": 0.2, // Opacité max de la brillance
            scale: 1.05,      // Zoom au survol
            perspective: 1000 // Perspective 3D
        });
    } else if (tiltCard) {
        console.warn("VanillaTilt not loaded. Check script inclusion.");
    }

    // 6. Gestion du Spotlight (Lumière blanche sous la souris)
    if (tiltCard) {
        tiltCard.addEventListener('mousemove', (e) => {
            const rect = tiltCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            tiltCard.style.setProperty('--mouse-x', `${x}px`);
            tiltCard.style.setProperty('--mouse-y', `${y}px`);
        });
    }

});