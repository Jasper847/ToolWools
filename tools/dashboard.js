/* =============================================
   TOOLWOOLS — Tools Dashboard Controller
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('toolSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const tabs = document.querySelectorAll('.tab[data-category]');
  const toolCards = document.querySelectorAll('.tool-card[data-category]');
  const emptyState = document.getElementById('emptyState');
  const emptyQuerySpan = document.getElementById('emptyQuery');

  let currentCategory = 'all';
  let searchQuery = '';

  // Get ?cat= query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam) {
    const matchingTab = Array.from(tabs).find(t => t.getAttribute('data-category') === catParam);
    if (matchingTab) {
      currentCategory = catParam;
      // Update tab active classes
      tabs.forEach(t => t.classList.remove('active'));
      matchingTab.classList.add('active');
      
      // Scroll active tab into view on mobile
      const tabsScroll = document.querySelector('.tabs-scroll');
      if (tabsScroll) {
        const offsetLeft = matchingTab.offsetLeft;
        tabsScroll.scrollTo({ left: offsetLeft - 24, behavior: 'smooth' });
      }
    }
  }

  // Combined Search and Tab filter function
  function filterTools() {
    let visibleCount = 0;
    const query = searchQuery.toLowerCase().trim();

    toolCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const name = card.querySelector('.tool-name').textContent.toLowerCase();
      const desc = card.querySelector('.tool-desc').textContent.toLowerCase();

      const categoryMatch = (currentCategory === 'all' || category === currentCategory);
      const searchMatch = !query || name.includes(query) || desc.includes(query);

      if (categoryMatch && searchMatch) {
        card.style.display = '';
        visibleCount++;
        // Trigger subtle animation transition
        requestAnimationFrame(() => {
          card.classList.add('is-visible');
        });
      } else {
        card.style.display = 'none';
        card.classList.remove('is-visible');
      }
    });

    // Show/hide empty state
    if (visibleCount === 0) {
      if (emptyQuerySpan) {
        emptyQuerySpan.textContent = searchQuery ? ` "${searchQuery}"` : '';
      }
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
    }
  }

  // Tab click handler
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.getAttribute('data-category');

      // Update URL without reloading page
      const newUrl = new URL(window.location);
      if (currentCategory === 'all') {
        newUrl.searchParams.delete('cat');
      } else {
        newUrl.searchParams.set('cat', currentCategory);
      }
      window.history.pushState({}, '', newUrl);

      filterTools();
    });
  });

  // Search input typing handler (instant filtering)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.style.display = 'flex';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      filterTools();
    });
  }

  // Clear search input button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      filterTools();
    });
  }

  // Run initial filter on page load
  filterTools();
});
