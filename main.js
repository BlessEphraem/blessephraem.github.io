document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sections = Array.from(document.querySelectorAll('section'));
    const navLinks = Array.from(document.querySelectorAll('header nav a'));
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
        e.preventDefault();
        isScrolling = true;
        if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
            scrollToSection(currentSectionIndex + 1);
        } else if (e.deltaY < 0 && currentSectionIndex > 0) {
            scrollToSection(currentSectionIndex - 1);
        }
        setTimeout(() => { isScrolling = false; }, 400);
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

    if (!isMobileView()) scrollToSection(0, true);

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

    const animateOnScroll = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                entry.target.classList.remove('out-view');
            } else {
                entry.target.classList.remove('in-view');
                entry.target.classList.add('out-view');
            }
        });
    };

    const animationObserver = new IntersectionObserver(animateOnScroll, {
        threshold: 0.5
    });

    animatedElementsScroll.forEach(el => {
        animationObserver.observe(el);
    });

    function animateOnScrollProgressive() {
        const elements = document.querySelectorAll('.skills-content, .services-content, .experiences-content, .contact-content');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            // Calcul du pourcentage de visibilité
            let percent = 0;
            if (rect.top < windowHeight && rect.bottom > 0) {
                const visible = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
                percent = Math.max(0, Math.min(1, visible / rect.height));
            }
            // Application de l'animation progressive
            el.style.opacity = percent;
            el.style.transform = `translateY(${40 * (1 - percent)}px)`;
        });
    }

    window.addEventListener('scroll', animateOnScrollProgressive);
    window.addEventListener('resize', animateOnScrollProgressive);
    document.addEventListener('DOMContentLoaded', animateOnScrollProgressive);
});