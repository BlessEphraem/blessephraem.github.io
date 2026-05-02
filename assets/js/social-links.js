class SocialLinks extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <a href="https://www.youtube.com/@BlessEphraem" target="_blank" rel="noopener" aria-label="YouTube">
                <i class="fa-brands fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/bless_ephraem" target="_blank" rel="noopener" aria-label="Instagram">
                <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="https://github.com/BlessEphraem" target="_blank" rel="noopener" aria-label="GitHub">
                <i class="fa-brands fa-github"></i>
            </a>
        `;
    }
}

customElements.define('social-links', SocialLinks);
