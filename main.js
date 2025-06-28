document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('header nav a');
    const header = document.querySelector('header');
    const title = document.querySelector('.title');

    let currentSectionIndex = 0;
    let isThrottled = false;
    const throttleTime = 300; // Temps de latence pour le défilement desktop/clavier

    const isMobileView = () => {
        return window.matchMedia("(max-width: 995px)").matches;
    };

    // Initialisation du lien de navigation actif si l'en-tête est visible
    if (navLinks.length > 0 && window.getComputedStyle(header).display !== 'none') {
        navLinks[currentSectionIndex].classList.add('active');
    }

    // Fonction pour mettre à jour le lien de navigation actif
    const updateNavLink = (index) => {
        if (window.getComputedStyle(header).display !== 'none') {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index]) {
                navLinks[index].classList.add('active');
            }
        }
    };

    // Fonction pour faire défiler vers une section spécifique (utilisée uniquement sur desktop et navigation)
    const scrollToSection = (index) => {
        if (index >= 0 && index < sections.length) {
            // Uniquement pour le mode desktop, le scroll mobile est natif
            if (!isMobileView()) {
                const scrollPosition = index * window.innerWidth; // Défilement horizontal
                mainContent.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
                currentSectionIndex = index;
                updateNavLink(currentSectionIndex);
            }
            // Sur mobile, cette fonction n'aura pas d'effet sur le scroll manuel,
            // mais pourrait être appelée par les liens de navigation si on les rendait visibles
            // et qu'on voulait un scroll "smooth" vers une section spécifique.
            // Pour l'instant, on se base sur le scroll natif.
        }
    };

    // --- Gestion du défilement pour Desktop (molette de souris) ---
    mainContent.addEventListener('wheel', (event) => {
        // Appliquer cette logique uniquement sur desktop
        if (!isMobileView()) {
            if (isThrottled) {
                return;
            }

            isThrottled = true;
            event.preventDefault(); // Empêche le défilement vertical par défaut du navigateur

            if (event.deltaY > 0) { // Défilement vers le bas (mappé à la droite/section suivante)
                scrollToSection(currentSectionIndex + 1);
            } else { // Défilement vers le haut (mappé à la gauche/section précédente)
                scrollToSection(currentSectionIndex - 1);
            }

            setTimeout(() => {
                isThrottled = false;
            }, throttleTime);
        }
    }, { passive: false }); // `passive: false` est nécessaire car nous utilisons `preventDefault`

    // --- Suppression de la gestion tactile personnalisée ---
    // Les écouteurs 'touchstart', 'touchmove', 'touchend' sont supprimés.
    // Le défilement sur mobile sera géré nativement par le navigateur.

    // --- Liens de navigation (fonctionnent toujours pour les deux vues) ---
    // Ces liens utiliseront scrollToSection, qui est conditionnel au mode desktop
    // ou si le scroll mobile natif est géré par le navigateur après le clic.
    if (window.getComputedStyle(header).display !== 'none') {
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Sur mobile, le clic sur un lien fera défiler la page normalement
                // ou déclenchera scrollToSection s'il était actif.
                // Ici, on fait simplement un scroll vers l'ID si on est sur mobile,
                // pour un comportement natif.
                if (isMobileView()) {
                    const targetId = e.target.getAttribute('href');
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // Sur desktop, on utilise notre fonction scrollToSection pour le défilement snap
                    scrollToSection(index);
                }
            });
        });
    }

    // --- Navigation au clavier (fonctionne pour les deux vues, mais le comportement diffère) ---
    document.addEventListener('keydown', (event) => {
        if (isMobileView()) {
            // Sur mobile, les flèches haut/bas vont faire défiler la page normalement
            // sans "snap" aux sections.
            // On peut optionnellement ajouter un `preventDefault()` ici pour les flèches,
            // mais si on veut un scroll natif, on le laisse.
            // Pour l'instant, pas de modification spécifique pour le clavier sur mobile
            // pour un défilement entièrement natif.
        } else {
            // Sur desktop, les flèches gauche/droite changent de section
            if (event.key === 'ArrowRight') {
                event.preventDefault(); // Empêche le défilement natif de la page
                scrollToSection(currentSectionIndex + 1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault(); // Empêche le défilement natif de la page
                scrollToSection(currentSectionIndex - 1);
            }
        }
    });

    // L'Intersection Observer doit continuer à observer les sections.
    // Sa logique reste la même car il détecte l'intersection d'éléments pour la navigation.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const index = Array.from(sections).findIndex(sec => sec.id === id);
                if (index !== -1) {
                    // Mettre à jour l'index de la section courante uniquement si on est sur desktop
                    // ou si l'en-tête est visible (car c'est là que les liens sont mis à jour)
                    if (!isMobileView() || window.getComputedStyle(header).display !== 'none') {
                         currentSectionIndex = index;
                         updateNavLink(currentSectionIndex);
                    }
                }
            }
        });
    }, { threshold: 0.7, root: mainContent }); // Le `root: mainContent` est important pour le défilement des sections

    sections.forEach(section => {
        observer.observe(section);
    });

    // Gérer le redimensionnement de la fenêtre pour ajuster le scrollPosition initial
    window.addEventListener('resize', () => {
        // Recalculer la position de la section courante après un redimensionnement
        // Uniquement si on est en mode desktop pour maintenir le "snap"
        if (!isMobileView()) {
            scrollToSection(currentSectionIndex);
        } else {
            // Sur mobile, si l'en-tête est caché, les sections sont en défilement normal.
            // S'il y a un besoin de recentrer une section spécifique au redimensionnement,
            // il faudrait ajouter une logique ici. Pour l'instant, on laisse le comportement natif.
        }
    });
});