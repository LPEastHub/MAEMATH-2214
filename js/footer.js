// js/footer.js

const footerHTML = `
<footer class="site-footer">
    <div class="footer-container">
        
        <div class="footer-brand">
            <img src="AppGero.png" alt="AppGero Logo" class="footer-logo">
            <p>MAEMATH 2214 Portal - Numerical Analysis</p>
            <p>&copy; ${new Date().getFullYear()} APpGeroMetrics All rights reserved.</p>
        </div>

        <div class="footer-contact">
            <h4>Connect with Us</h4>
            <ul class="contact-list">
                <li><a href="https://www.facebook.com/profile.php?id=61561185271842" target="_blank"><i class="fab fa-facebook-f"></i> Facebook</a></li>
                <li><a href="https://github.com/LPEastHub" target="_blank"><i class="fab fa-github"></i> GitHub</a></li>
                <li><a href="mailto:gerothornz05@gmail.com"><i class="far fa-envelope"></i> gerothornz05@gmail.com</a></li>
                <li><a href="https://www.youtube.com/channel/UCQi6TYsY7t-skLkjQu8l8zg" target="_blank"><i class="fab fa-youtube"></i> YouTube</a></li>
                <li><a href="tel:09510930117"><i class="fas fa-phone-alt"></i> 09510930117</a></li>
            </ul>
        </div>
        
    </div>
</footer>
`;

// 1. Inject the FontAwesome stylesheet so the icons work automatically
if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesome);
}

// 2. Inject the footer HTML into the very bottom of the page
document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("beforeend", footerHTML);
});