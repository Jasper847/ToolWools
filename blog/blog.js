/* =============================================
   TOOLWOOLS BLOG — Shared Controller
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. READING PROGRESS BAR
  // ==========================================
  const progressBar = document.querySelector('.reading-progress-bar');
  
  if (progressBar) {
    const updateReadingProgress = () => {
      const scrollPos = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Prevent division by zero and restrict to 0-100%
      const percentage = totalHeight > 0 ? Math.min(100, Math.max(0, (scrollPos / totalHeight) * 100)) : 0;
      
      progressBar.style.width = `${percentage}%`;
    };

    // Initialize progress on load
    updateReadingProgress();

    // High performance passive scroll listener
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
  }

  // ==========================================
  // 2. HIGH-PERFORMANCE TOC INTERSECTION HIGHLIGHT
  // ==========================================
  const headings = Array.from(document.querySelectorAll('.article-body h2[id], .article-body h3[id]'));
  const tocLinks = Array.from(document.querySelectorAll('.toc-item'));

  if (headings.length > 0 && tocLinks.length > 0) {
    const tocMap = new Map();
    tocLinks.forEach(link => {
      const id = link.getAttribute('href').replace('#', '');
      tocMap.set(id, link);
    });

    let currentActiveId = null;

    // Use Intersection Observer for high-performance viewport tracking
    const observerOptions = {
      root: null,
      // Focus on the upper portion of the viewport where reading happens
      rootMargin: '-10% 0px -75% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          currentActiveId = id;
          updateActiveTOC(id);
        }
      });
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));

    // Helper to update active class
    const updateActiveTOC = (activeId) => {
      tocLinks.forEach(link => link.classList.remove('active'));
      const activeLink = tocMap.get(activeId);
      if (activeLink) {
        activeLink.classList.add('active');
        
        // Ensure active item is visible in sticky sidebar
        const sidebar = activeLink.closest('.article-sidebar');
        if (sidebar && sidebar.scrollHeight > sidebar.clientHeight) {
          const linkRect = activeLink.getBoundingClientRect();
          const sidebarRect = sidebar.getBoundingClientRect();
          if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
            activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    };

    // Fallback: If at the top or bottom of the page, ensure edge items are highlighted
    const checkScrollFallback = () => {
      const scrollPos = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollPos < 120 && headings.length > 0) {
        updateActiveTOC(headings[0].id);
      } else if (totalHeight > 0 && scrollPos >= totalHeight - 40 && headings.length > 0) {
        updateActiveTOC(headings[headings.length - 1].id);
      }
    };

    window.addEventListener('scroll', checkScrollFallback, { passive: true });
    checkScrollFallback();
  }
});
