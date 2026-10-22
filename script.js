// ==========================================================================
// RITESH BONTHALAKOTI &middot; A TECHNICAL MONOGRAPH
// Minimal Reading Scripts: Progress Tracker & Dual-Theme (Paper/Night)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Reading Progress Bar
    const progressBar = document.getElementById('reading-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progressPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        if (progressBar) {
            progressBar.style.width = progressPercent + '%';
        }
    }, { passive: true });

    // 2. Paper / Night Dual-Mode Reader Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootHtml = document.documentElement;

    // Retrieve user preference from storage or fallback to Paper
    const savedTheme = localStorage.getItem('monograph-theme') || 'paper';
    rootHtml.setAttribute('data-theme', savedTheme);
    updateThemeButtonLabel(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootHtml.getAttribute('data-theme') || 'paper';
            const nextTheme = currentTheme === 'paper' ? 'night' : 'paper';
            
            rootHtml.setAttribute('data-theme', nextTheme);
            localStorage.setItem('monograph-theme', nextTheme);
            updateThemeButtonLabel(nextTheme);
        });
    }

    function updateThemeButtonLabel(theme) {
        if (!themeToggleBtn) return;
        const label = themeToggleBtn.querySelector('.mode-label');
        if (label) {
            label.textContent = theme === 'paper' ? 'Night Mode' : 'Paper Mode';
        }
    }

    // 3. Optional Keyboard Shortcut: Press 'T' to toggle reading theme
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 't' || e.key === 'T') {
            if (themeToggleBtn) themeToggleBtn.click();
        }
    });
});
