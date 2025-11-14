document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sections = Array.from(document.querySelectorAll('section'));
    const navLinks = Array.from(document.querySelectorAll('header nav a, .button a'));
    const header = document.querySelector('header');
    const title = document.querySelector('.title');

    // Formulaire de contact (Formspree)
    const form = document.getElementById("my-form");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const status = document.getElementById("my-form-status");
            const data = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi...';
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    status.innerHTML = "Merci ! Votre message a bien été envoyé.";
                    form.reset();
                } else {
                    const result = await response.json();
                    status.innerHTML = result.errors ? result.errors.map(e => e.message).join(', ') : "Oups ! Une erreur est survenue lors de l'envoi.";
                }
            } catch {
                status.innerHTML = "Oups ! Une erreur réseau est survenue.";
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer';
        });
    }

    let currentSectionIndex = 0;
    let isScrolling = false;

    const isMobileView = () => window.matchMedia("(max-width: 995px)").matches;

    // Initialisation du lien de navigation actif si l'en-tête est visible
    if (navLinks.length > 0 && window.getComputedStyle(header).display !== 'none') {
        navLinks[currentSectionIndex].classList.add('active');
    }

    function updateNavLinks(index) {
        if (window.getComputedStyle(header).display !== 'none') {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) navLinks[index].classList.add('active');
        }
    }

    function scrollToSection(index, instant = false) {
        if (index < 0 || index >= sections.length) return;
        const scrollPos = index * window.innerWidth;
        mainContent.scrollTo({ left: scrollPos, behavior: instant ? 'auto' : 'smooth' });
        currentSectionIndex = index;
        updateNavLinks(index);
    }

    navLinks.forEach((link, i) => {
        link.addEventListener('click', e => {
            e.preventDefault();
            if (isMobileView()) {
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                scrollToSection(i, false);
            }
        });
    });

    mainContent.addEventListener('wheel', e => {
        if (isMobileView() || isScrolling) return;

        // --- Logique du Blog (Index 0) ---
        // (On vérifie si on est sur la section blog, qui est l'index 0)
        if (currentSectionIndex === 5) {
            const blogContent = sections[currentSectionIndex].querySelector('.blog-content');
            if (blogContent) {
                const { scrollTop, scrollHeight, clientHeight } = blogContent;
                const deltaY = e.deltaY;
                const isAtTop = scrollTop <= 0;
                const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 1);

                // Si on scroll DANS le blog (ni en haut, ni en bas), on sort.
                if ((deltaY > 0 && !isAtBottom) || (deltaY < 0 && !isAtTop)) {
                    return; // Laisse le scroll vertical natif du blog se faire
                }
            }
            // Si on est en haut ou en bas du blog, on continue vers le scroll horizontal...
        }

        // --- Logique de scroll horizontal (pour TOUTES les sections) ---
        e.preventDefault();
        isScrolling = true;

        // Tente de scroller vers la section suivante
        if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
            scrollToSection(currentSectionIndex + 1);
            // On réinitialise 'isScrolling' APRES l'animation
            setTimeout(() => { isScrolling = false; }, 600); // Augmenté à 600ms pour plus de sécurité
        
        // Tente de scroller vers la section précédente
        } else if (e.deltaY < 0 && currentSectionIndex > 0) {
            scrollToSection(currentSectionIndex - 1);
            // On réinitialise 'isScrolling' APRES l'animation
            setTimeout(() => { isScrolling = false; }, 600); // Augmenté à 600ms
        
        // On est au bout (ex: scroll up sur Blog, ou scroll down sur Contact)
        } else {
            isScrolling = false; // Pas de scroll, on reset le blocage immédiatement
        }
    }, { passive: false });

    document.addEventListener('keydown', e => {
        if (isMobileView() || isScrolling) return;
        if (e.key === 'ArrowRight' && currentSectionIndex < sections.length - 1) {
            e.preventDefault();
            isScrolling = true;
            scrollToSection(currentSectionIndex + 1);
            setTimeout(() => { isScrolling = false; }, 400);
        } else if (e.key === 'ArrowLeft' && currentSectionIndex > 0) {
            e.preventDefault();
            isScrolling = true;
            scrollToSection(currentSectionIndex - 1);
            setTimeout(() => { isScrolling = false; }, 400);
        }
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = sections.indexOf(entry.target);
                if (idx !== -1) {
                    currentSectionIndex = idx;
                    updateNavLinks(idx);
                }
            }
        });
    }, { threshold: 0.6, root: mainContent });
    sections.forEach(section => observer.observe(section));

    window.addEventListener('resize', () => {
        if (!isMobileView()) scrollToSection(currentSectionIndex, true);
    });

    if (!isMobileView()) scrollToSection(currentSectionIndex, true);

    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.add('nav-animating');
        nav.addEventListener('animationend', () => {
            nav.classList.remove('nav-animating');
        }, { once: true });
    }

    // === ANIMATIONS AU SCROLL (hors home) ===

    // Sélecteurs des éléments à animer au scroll (hors .home)
    const animatedSelectorsScroll = [
        '.skills-content',
        '.skills-content h2',
        '.skill-track',
        '.services-content',
        '.service-card',
        '.service-card li',
        '.experiences-content',
        '.timeline-item',
        '.contact-content',
        '.contact-content h2',
        '.contact-content p',
        '.contact-panel',
        '.contact-form',
    ];

    const animatedElementsScroll = Array.from(document.querySelectorAll(animatedSelectorsScroll.join(',')));

    // IntersectionObserver pour desktop uniquement
    let animationObserver = null;
    function setupDesktopScrollAnimations() {
        if (animationObserver) {
            animationObserver.disconnect();
        }
        animationObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    entry.target.classList.remove('out-view');
                } else {
                    entry.target.classList.remove('in-view');
                    entry.target.classList.add('out-view');
                }
            });
        }, { threshold: 0.5 });
        animatedElementsScroll.forEach(el => {
            // Ensure no inline styles are present before observing for desktop animations
            el.style.opacity = '';
            el.style.transform = '';
            animationObserver.observe(el);
        });
    }

    // Animation progressive pour mobile uniquement
    // Sensibilité de l'apparition progressive adaptée à la taille de la section
    function getAppearThreshold(rect, windowHeight) {
        // Ratio de la taille de la section par rapport à la fenêtre
        const ratio = rect.height / windowHeight;
        // Clamp pour éviter des valeurs extrêmes (min 0.2, max 0.3)
        return Math.max(0.1, Math.min(0.1, 0.7 / ratio));
    }

    function animateOnScrollProgressive() {
        if (!isMobileView()) return;
        sections.forEach(section => {
            if (section.classList.contains('home') || section.classList.contains('contact') || section.classList.contains('blog')) {
                // Toujours visible pour home et contact
                section.style.opacity = 1;
                section.style.transform = 'none';
                const animatedChildren = section.querySelectorAll('.skills-content, .skills-content h2, .skill-track, .services-content, .service-card, .service-card li, .experiences-content, .timeline-item, .contact-content, .contact-content h2, .contact-content p, .contact-panel, .contact-form');
                animatedChildren.forEach(el => {
                    el.style.opacity = 1;
                    el.style.transform = 'none';
                });
                return;
            }
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            let percent = 0;
            if (rect.top < windowHeight && rect.bottom > 0) {
                const visible = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                percent = Math.max(0, Math.min(1, visible / rect.height));
            }
            // Calcul dynamique du seuil d'apparition selon la taille de la section
            const appearThreshold = getAppearThreshold(rect, windowHeight);
            let displayPercent = percent / appearThreshold;
            displayPercent = Math.max(0, Math.min(1, displayPercent));
            if (percent > 0) {
                section.style.opacity = displayPercent;
                section.style.transform = `translateY(${20 * (1 - displayPercent)}px)`;
            } else {
                section.style.opacity = 0;
                section.style.transform = `translateY(20px)`;
            }
            const animatedChildren = section.querySelectorAll('.skills-content, .skills-content h2, .skill-track, .services-content, .service-card, .service-card li, .experiences-content, .timeline-item, .contact-content, .contact-content h2, .contact-content p, .contact-panel, .contact-form');
            animatedChildren.forEach(el => {
                if (percent > 0) {
                    el.style.opacity = displayPercent;
                    el.style.transform = `translateY(${20 * (1 - displayPercent)}px)`;
                } else {
                    el.style.opacity = 0;
                    el.style.transform = `translateY(20px)`;
                }
            });
        });
    }

    // Nettoyer les styles inline quand on repasse en desktop
    function cleanMobileInlineStyles() {
        sections.forEach(section => {
            section.style.opacity = '';
            section.style.transform = '';
            const animatedChildren = section.querySelectorAll('.skills-content, .skills-content h2, .skill-track, .services-content, .service-card, .service-card li, .experiences-content, .timeline-item, .contact-content, .contact-content h2, .contact-content p, .contact-panel, .contact-form');
            animatedChildren.forEach(el => {
                el.style.opacity = '';
                el.style.transform = '';
                el.classList.add('out-view');
                el.classList.remove('in-view');
            });
        });
    }

    // Gestion du mode responsive pour les animations
    function handleResponsiveAnimations() {
        if (isMobileView()) {
            if (animationObserver) {
                animationObserver.disconnect();
                animationObserver = null;
            }
            window.addEventListener('scroll', animateOnScrollProgressive);
            if (mainContent) {
                mainContent.addEventListener('scroll', animateOnScrollProgressive);
            }
        } else {
            // Si on passe en mode desktop, on nettoie les styles inline et on réactive les animations CSS
            cleanMobileInlineStyles();
            setupDesktopScrollAnimations();
            window.removeEventListener('scroll', animateOnScrollProgressive);
            if (mainContent) {
                mainContent.removeEventListener('scroll', animateOnScrollProgressive);
            }
        }
    }

    // On gère les animations au chargement
    handleResponsiveAnimations();

    // Et on réagit aux changements de taille de fenêtre
    window.addEventListener('resize', handleResponsiveAnimations);

    // ===================================
    // === SECTION : BLOG ===
    // ===================================

    const GITHUB_USER = "BlessEphraem"; 
    const GITHUB_REPO = "blessephraem.github.io"; // Ex: "Portfolio"
    const POSTS_PATH = "_posts";

    const postsListContainer = document.getElementById('posts-list');

    async function loadBlogPosts() {
        if (!postsListContainer) return;

        try {
            // 1. Récupérer la liste des fichiers
            const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${POSTS_PATH}`);
            if (!response.ok) {
                throw new Error(`Erreur GitHub API: ${response.statusText}`);
            }
            let files = await response.json();

            // 2. Trier les fichiers
            files = files
                .filter(file => file.name.endsWith('.md'))
                .sort((a, b) => b.name.localeCompare(a.name)); // Décroissant

            if (files.length === 0) {
                postsListContainer.innerHTML = "<p>Aucun article pour le moment.</p>";
                return;
            }

            // 3. Télécharger le contenu de tous les fichiers
            const fetchPromises = files.map(file => 
                fetch(file.download_url).then(res => res.text())
            );
            const allPostTexts = await Promise.all(fetchPromises);

            // 4. Vider la liste et afficher chaque post
            postsListContainer.innerHTML = ''; 

            allPostTexts.forEach((postText, index) => {
                const file = files[index];

                // --- NOUVELLE LOGIQUE ---

                // 4a. Extraire la date du nom de fichier (fiable)
                const postDate = file.name.substring(0, 10);

                // 4b. Initialiser les variables pour le Front Matter
                let postContent = postText; // Contenu Markdown
                let title = '';             // Titre du post
                let thumbnailUrl = null;    // URL de la miniature

                // 4c. Parser le Front Matter (YAML) s'il existe
                if (postText.startsWith('---')) {
                    const endOfYaml = postText.indexOf('---', 3);
                    if (endOfYaml !== -1) {
                        const yamlBlock = postText.substring(3, endOfYaml);
                        postContent = postText.substring(endOfYaml + 3); // Garde le reste
                        
                        // Expression régulière pour trouver le titre
                        const titleMatch = yamlBlock.match(/title:\s*(.*)/);
                        if (titleMatch && titleMatch[1]) {
                            title = titleMatch[1].trim();
                        }

                        // Expression régulière pour trouver la miniature
                        const thumbnailMatch = yamlBlock.match(/thumbnail:\s*(.*)/);
                        if (thumbnailMatch && thumbnailMatch[1]) {
                            thumbnailUrl = thumbnailMatch[1].trim();
                        }
                    }
                }

                // 4d. Fallback : si pas de titre YAML, prendre le nom du fichier
                if (!title) {
                    title = file.name.replace(/\.md$/, '').substring(11).replace(/-/g, ' ');
                }

                // 4e. Convertir le contenu Markdown (sans YAML)
                const convertedHtml = marked.parse(postContent); 

                // 4f. Générer le HTML pour la miniature (si elle existe)
                let thumbnailHtml = '';
                if (thumbnailUrl) {
                    // Les chemins de Netlify CMS sont souvent absolus (ex: /assets/uploads/img.jpg)
                    // donc on les utilise directement.
                    thumbnailHtml = `<img src="${thumbnailUrl}" alt="Miniature pour ${title}" class="post-thumbnail">`;
                }

                // 4g. Créer l'élément complet du post
                const postElement = document.createElement('div');
                postElement.className = 'post-item';

                // Injecter le HTML (avec la miniature en premier)
                postElement.innerHTML = `
                    ${thumbnailHtml}
                    <h3>${title}</h3>
                    <p>${postDate}</p>
                    <div class="post-content-full">
                        ${convertedHtml}
                    </div>
                `;

                postsListContainer.appendChild(postElement);
            });

        } catch (error) {
            console.error("Erreur lors du chargement des posts:", error);
            postsListContainer.innerHTML = "<p>Impossible de charger les articles. Vérifiez la configuration de GITHUB_USER et GITHUB_REPO dans main.js</p>";
        }
    }



    // Lancer le chargement des posts au démarrage
    loadBlogPosts();

});