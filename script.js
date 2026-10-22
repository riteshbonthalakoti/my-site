// ==========================================================================
// RITESH BONTHALAKOTI — CLEAN 1-PAGE BOOK NAVIGATION SCRIPT
// Silky Page Transitions, Keyboard Controls, Touch Gestures, Theme Toggle
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const totalPages = 8;
    let currentIndex = 1;
    let isTransitioning = false;

    // DOM Elements
    const pages = document.querySelectorAll('.page-view');
    const pills = document.querySelectorAll('.pill');
    const chapterLabel = document.getElementById('chapter-label');
    const pageReadoutText = document.getElementById('page-readout-text');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const arrowPrev = document.getElementById('arrow-prev');
    const arrowNext = document.getElementById('arrow-next');
    const tocBtn = document.getElementById('toc-btn');
    const tocDropdown = document.getElementById('toc-dropdown');
    const themeBtn = document.getElementById('theme-btn');
    const themeModeText = document.getElementById('theme-mode-text');
    const bookLeaf = document.getElementById('book-leaf');

    // 1. Smooth Page Turn Function
    function goToPage(targetIndex, direction = null) {
        if (targetIndex < 1 || targetIndex > totalPages || targetIndex === currentIndex || isTransitioning) {
            return;
        }

        isTransitioning = true;
        const fromPage = document.querySelector(`.page-view[data-index="${currentIndex}"]`);
        const toPage = document.querySelector(`.page-view[data-index="${targetIndex}"]`);

        const isForward = direction ? direction === 'forward' : targetIndex > currentIndex;

        // Animate Outgoing Page
        fromPage.classList.remove('active');
        fromPage.classList.add(isForward ? 'exit-left' : 'exit-right');

        // Setup Incoming Page
        toPage.style.display = 'flex';
        toPage.style.opacity = '0';
        toPage.style.transform = isForward ? 'translateX(35px)' : 'translateX(-35px)';

        // Force browser layout reflow
        void toPage.offsetWidth;

        setTimeout(() => {
            toPage.classList.add('active');
            toPage.style.opacity = '1';
            toPage.style.transform = 'translateX(0)';

            fromPage.classList.remove('exit-left', 'exit-right');
            fromPage.style.display = 'none';

            currentIndex = targetIndex;
            updateControlsState();
            isTransitioning = false;
        }, 200);

        // Scroll back to top if scrolled
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 2. Update UI Indicators
    function updateControlsState() {
        const activePage = document.querySelector(`.page-view[data-index="${currentIndex}"]`);
        const title = activePage ? activePage.getAttribute('data-title') : '';

        // Update Labels
        if (chapterLabel) chapterLabel.textContent = title;
        if (pageReadoutText) pageReadoutText.textContent = `Page ${currentIndex} of ${totalPages}`;

        // Update Dots / Pills
        pills.forEach(pill => {
            const pageNum = parseInt(pill.getAttribute('data-page'), 10);
            pill.classList.toggle('active', pageNum === currentIndex);
        });

        // Update Prev / Next Buttons
        const isFirst = currentIndex === 1;
        const isLast = currentIndex === totalPages;

        if (btnPrev) btnPrev.disabled = isFirst;
        if (arrowPrev) arrowPrev.disabled = isFirst;

        if (btnNext) btnNext.disabled = isLast;
        if (arrowNext) arrowNext.disabled = isLast;
    }

    // 3. Navigation Triggers
    if (btnPrev) btnPrev.addEventListener('click', () => goToPage(currentIndex - 1, 'backward'));
    if (arrowPrev) arrowPrev.addEventListener('click', () => goToPage(currentIndex - 1, 'backward'));

    document.querySelectorAll('.next-trigger').forEach(btn => {
        btn.addEventListener('click', () => goToPage(currentIndex + 1, 'forward'));
    });

    // Jump to specific page buttons (Pills, Table of Contents, Dropdown)
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', () => {
            const page = parseInt(el.getAttribute('data-page'), 10);
            if (!isNaN(page)) {
                goToPage(page);
                if (tocDropdown) tocDropdown.classList.add('hidden');
            }
        });
    });

    // 4. TOC Dropdown Popover
    if (tocBtn && tocDropdown) {
        tocBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tocDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!tocDropdown.contains(e.target) && !tocBtn.contains(e.target)) {
                tocDropdown.classList.add('hidden');
            }
        });
    }

    // 5. Keyboard Navigation
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            goToPage(currentIndex + 1, 'forward');
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            goToPage(currentIndex - 1, 'backward');
        } else if (e.key === 't' || e.key === 'T') {
            if (themeBtn) themeBtn.click();
        }
    });

    // 6. Mobile Touch Swipe Gestures
    let touchStartX = 0;
    let touchEndX = 0;

    if (bookLeaf) {
        bookLeaf.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        bookLeaf.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                // Swiped Left -> Next
                goToPage(currentIndex + 1, 'forward');
            } else if (touchEndX > touchStartX + threshold) {
                // Swiped Right -> Prev
                goToPage(currentIndex - 1, 'backward');
            }
        }, { passive: true });
    }

    // 7. Paper / Night Reading Themes
    const root = document.documentElement;
    const storedTheme = localStorage.getItem('monograph-theme') || 'paper';
    root.setAttribute('data-theme', storedTheme);
    updateThemeButton(storedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme') || 'paper';
            const nextTheme = currentTheme === 'paper' ? 'night' : 'paper';
            root.setAttribute('data-theme', nextTheme);
            localStorage.setItem('monograph-theme', nextTheme);
            updateThemeButton(nextTheme);
        });
    }

    function updateThemeButton(theme) {
        if (themeModeText) {
            themeModeText.textContent = theme === 'paper' ? 'Night' : 'Paper';
        }
    }

    // Initial setup
    updateControlsState();
});
