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
                const response = await fetch(form.action, {
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
});