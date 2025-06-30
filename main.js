document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('header');
    const title = document.querySelector('.title');

    // Gestion du formulaire de contact avec Formspree (AJAX)
    const form = document.getElementById("my-form");
    if (form) {
        form.addEventListener("submit", async function handleSubmit(event) {
            event.preventDefault();
            const status = document.getElementById("my-form-status");
            const data = new FormData(form);
            const submitBtn = form.querySelector('button[type=\"submit\"]');
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
                    if (result.errors) {
                        status.innerHTML = result.errors.map(error => error.message).join(', ');
                    } else {
                        status.innerHTML = "Oups ! Une erreur est survenue lors de l'envoi.";
                    }
                }
            } catch (error) {
                status.innerHTML = "Oups ! Une erreur réseau est survenue.";
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Envoyer';
        });
    }

    let currentSectionIndex = 0;
    let isScrolling = false;

    const isMobileView = () => {
        return window.matchMedia("(max-width: 995px)").matches;
    };

    // Initialisation du lien de navigation actif si l'en-tête est visible
    if (navLinks.length > 0 && window.getComputedStyle(header).display !== 'none') {
        navLinks[currentSectionIndex].classList.add('active');
    }

    // Fonction pour mettre à jour le lien de navigation actif
    const updateNavLinks = (index) => {
        if (window.getComputedStyle(header).display !== 'none') {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) {
                navLinks[index].classList.add('active');
            }
        }
    };

    // Scroll vers une section (desktop)
    function scrollToSection(index, instant = false) {
        if (index < 0 || index >= sections.length) return;
        const scrollPos = index * window.innerWidth;
        mainContent.scrollTo({
            left: scrollPos,
            behavior: instant ? 'auto' : 'smooth'
        });
        currentSectionIndex = index;
        updateNavLinks(index);
    }

    // Clic sur la nav bar
    navLinks.forEach((link, i) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (isMobileView()) {
                // Scroll natif sur mobile
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                scrollToSection(i, false);
            }
        });
    });

    // Molette (desktop uniquement)
    mainContent.addEventListener('wheel', (e) => {
        if (isMobileView()) return;
        if (isScrolling) return;
        e.preventDefault();
        isScrolling = true;
        if (e.deltaY > 0) {
            // Droite
            if (currentSectionIndex < sections.length - 1) {
                scrollToSection(currentSectionIndex + 1);
            }
        } else {
            // Gauche
            if (currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
        }
        setTimeout(() => { isScrolling = false; }, 400); // délai pour éviter le spam
    }, { passive: false });

    // Flèches clavier (desktop uniquement)
    document.addEventListener('keydown', (e) => {
        if (isMobileView()) return;
        if (isScrolling) return;
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentSectionIndex < sections.length - 1) {
                isScrolling = true;
                scrollToSection(currentSectionIndex + 1);
                setTimeout(() => { isScrolling = false; }, 400);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSectionIndex > 0) {
                isScrolling = true;
                scrollToSection(currentSectionIndex - 1);
                setTimeout(() => { isScrolling = false; }, 400);
            }
        }
    });

    // Observer pour synchroniser la nav bar avec la section visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = sections.indexOf(entry.target);
                if (idx !== -1) {
                    currentSectionIndex = idx;
                    updateNavLinks(idx);
                }
            }
        });
    }, {
        threshold: 0.6,
        root: mainContent
    });
    sections.forEach(section => observer.observe(section));

    // Resize : recalcule la position de la section courante
    window.addEventListener('resize', () => {
        if (!isMobileView()) {
            scrollToSection(currentSectionIndex, true);
        }
    });

    // Au chargement, scroll sur la première section (desktop)
    if (!isMobileView()) {
        scrollToSection(0, true);
    }

    // Juste après la déclaration de const nav = document.querySelector('nav');
    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.add('nav-animating');
        nav.addEventListener('animationend', () => {
            nav.classList.remove('nav-animating');
        }, { once: true });
    }
});