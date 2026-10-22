// ==========================================================================
// RITESH BONTHALAKOTI — 1-PAGE-AT-A-TIME INTERACTIVE BOOK SCRIPT
// Smooth Page Transitions, Folio Navigation, Touch Swiping & Theme Control
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const totalPages = 6;
    let currentPage = 1;
    let isTurning = false;

    // DOM Elements
    const pages = document.querySelectorAll('.book-page');
    const leafDots = document.querySelectorAll('.leaf-dot');
    const curPageNumEl = document.getElementById('cur-page-num');
    const currentChapterTitleEl = document.getElementById('current-chapter-title');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const prevArrow = document.getElementById('prev-page-arrow');
    const nextArrow = document.getElementById('next-page-arrow');
    const tocBtn = document.getElementById('toc-btn');
    const tocMenu = document.getElementById('toc-menu');
    const themeToggle = document.getElementById('theme-toggle');
    const bookFrame = document.getElementById('book-frame');

    // 1. Core Page Navigation with Smooth Transition
    function goToPage(targetPage, direction = null) {
        if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage || isTurning) {
            return;
        }

        isTurning = true;
        const fromPageEl = document.querySelector(`.book-page[data-page="${currentPage}"]`);
        const toPageEl = document.querySelector(`.book-page[data-page="${targetPage}"]`);

        // Determine transition direction if not passed
        const isForward = direction ? direction === 'forward' : targetPage > currentPage;

        // Reset scroll position within the page
        const scrollableAreas = toPageEl.querySelectorAll('.projects-scrollable, .chronicle-timeline');
        scrollableAreas.forEach(area => area.scrollTop = 0);

        // Animate outgoing page
        fromPageEl.classList.remove('active');
        fromPageEl.classList.add(isForward ? 'turning-left-out' : 'turning-right-out');

        // Prepare incoming page
        toPageEl.style.transform = isForward 
            ? 'translateX(50px) rotateY(-4deg)' 
            : 'translateX(-50px) rotateY(4deg)';
        toPageEl.style.opacity = '0';
        toPageEl.style.display = 'flex';

        // Force browser reflow
        void toPageEl.offsetWidth;

        setTimeout(() => {
            // Animate incoming page in
            toPageEl.classList.add('active');
            toPageEl.style.transform = 'translateX(0) rotateY(0deg)';
            toPageEl.style.opacity = '1';

            // Clean up outgoing page classes
            fromPageEl.classList.remove('turning-left-out', 'turning-right-out');
            fromPageEl.style.display = 'none';

            // Update state
            currentPage = targetPage;
            updateUIState();
            isTurning = false;
        }, 220);

        // Scroll to top of book frame smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateUIState() {
        const activePageEl = document.querySelector(`.book-page[data-page="${currentPage}"]`);
        const chapterName = activePageEl ? activePageEl.getAttribute('data-chapter') : '';

        // Update Header & Readout
        if (curPageNumEl) curPageNumEl.textContent = `Leaf ${currentPage}`;
        if (currentChapterTitleEl) currentChapterTitleEl.textContent = chapterName;

        // Update Leaf Dots
        leafDots.forEach(dot => {
            const pageNum = parseInt(dot.getAttribute('data-goto'), 10);
            dot.classList.toggle('active', pageNum === currentPage);
        });

        // Update Prev/Next button states
        const isFirst = currentPage === 1;
        const isLast = currentPage === totalPages;

        if (btnPrev) btnPrev.disabled = isFirst;
        if (prevArrow) prevArrow.disabled = isFirst;

        if (btnNext) btnNext.disabled = isLast;
        if (nextArrow) nextArrow.disabled = isLast;
    }

    // 2. Button Event Listeners
    if (btnPrev) btnPrev.addEventListener('click', () => goToPage(currentPage - 1, 'backward'));
    if (prevArrow) prevArrow.addEventListener('click', () => goToPage(currentPage - 1, 'backward'));

    document.querySelectorAll('.next-action').forEach(btn => {
        btn.addEventListener('click', () => goToPage(currentPage + 1, 'forward'));
    });

    // Jump to page clicks (TOC cards & Popover)
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = parseInt(btn.getAttribute('data-goto'), 10);
            if (!isNaN(target)) {
                goToPage(target);
                if (tocMenu) tocMenu.classList.add('hidden');
            }
        });
    });

    // 3. Chapter Menu Popover Toggle
    if (tocBtn && tocMenu) {
        tocBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tocMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!tocMenu.contains(e.target) && !tocBtn.contains(e.target)) {
                tocMenu.classList.add('hidden');
            }
        });
    }

    // 4. Keyboard Navigation
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            e.preventDefault();
            goToPage(currentPage + 1, 'forward');
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            goToPage(currentPage - 1, 'backward');
        } else if (e.key === 't' || e.key === 'T') {
            if (themeToggle) themeToggle.click();
        }
    });

    // 5. Touch / Mobile Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    if (bookFrame) {
        bookFrame.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        bookFrame.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const threshold = 55;
        if (touchEndX < touchStartX - threshold) {
            // Swiped Left -> Go Next Page
            goToPage(currentPage + 1, 'forward');
        } else if (touchEndX > touchStartX + threshold) {
            // Swiped Right -> Go Previous Page
            goToPage(currentPage - 1, 'backward');
        }
    }

    // 6. Paper / Night Reading Mode Toggle
    const rootHtml = document.documentElement;
    const savedTheme = localStorage.getItem('book-theme') || 'paper';
    rootHtml.setAttribute('data-theme', savedTheme);
    updateThemeLabel(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = rootHtml.getAttribute('data-theme') || 'paper';
            const nextTheme = currentTheme === 'paper' ? 'night' : 'paper';
            rootHtml.setAttribute('data-theme', nextTheme);
            localStorage.setItem('book-theme', nextTheme);
            updateThemeLabel(nextTheme);
        });
    }

    function updateThemeLabel(theme) {
        if (!themeToggle) return;
        const text = themeToggle.querySelector('.theme-text');
        if (text) text.textContent = theme === 'paper' ? 'Night' : 'Paper';
    }

    // Initialize UI on load
    updateUIState();
});
