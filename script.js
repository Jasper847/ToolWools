/* =============================================
   TOOLWOOLS — Interactive JavaScript (Premium)
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. DARK MODE TOGGLE
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Check saved preference
  const savedTheme = localStorage.getItem('toolwools-theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('toolwools-theme', next);
  });

  // ==========================================
  // 2. MOBILE MENU
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    const isOpen = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ==========================================
  // 3. DROPDOWN MEGA MENU
  // ==========================================
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const navItem = document.querySelector('.nav-item.has-dropdown');

  if (dropdownTrigger && navItem) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      navItem.classList.toggle('active');
      const isOpen = navItem.classList.contains('active');
      dropdownTrigger.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navItem.contains(e.target)) {
        navItem.classList.remove('active');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navItem.classList.remove('active');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================
  // 4. STATS COUNTER ANIMATION
  // ==========================================
  function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const suffix = element.getAttribute('data-suffix') || '';
    const isDecimal = element.getAttribute('data-decimal') === 'true';
    const duration = 2000;
    const startTime = performance.now();

    function formatNumber(num) {
      if (isDecimal) {
        return num.toFixed(1);
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
      }
      return Math.round(num).toString();
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Eased progress (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      element.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Observe stats section
  const statsSection = document.getElementById('stats');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        document.querySelectorAll('.stat-number').forEach(el => {
          animateCounter(el);
        });
      }
    });
  }, { threshold: 0.3 });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // ==========================================
  // 5. SCROLL REVEAL SYSTEM (Fix 5 — Premium)
  // ==========================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

  // Also handle legacy animate-on-scroll class
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.children;
        const siblingIndex = Array.from(siblings).indexOf(entry.target);
        entry.target.style.transitionDelay = `${siblingIndex * 0.05}s`;
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach(el => scrollObserver.observe(el));

  // ==========================================
  // 6. TOOL CATEGORY TABS
  // ==========================================
  const tabs = document.querySelectorAll('.tab[data-category]');
  const toolCards = document.querySelectorAll('.tool-card[data-category]');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');

      toolCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = '';
          // Re-trigger reveal animation
          card.classList.remove('is-visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.add('is-visible');
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Tab scroll button
  const tabScrollBtn = document.querySelector('.tab-scroll-btn');
  const tabsScroll = document.querySelector('.tabs-scroll');

  if (tabScrollBtn && tabsScroll) {
    tabScrollBtn.addEventListener('click', () => {
      tabsScroll.scrollBy({ left: 200, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 7. IMAGE COMPARISON SLIDER
  // ==========================================
  const compareContainer = document.getElementById('imageCompare');
  const compareSlider = document.getElementById('compareSlider');
  const compareCompressed = document.getElementById('compareCompressed');

  if (compareContainer && compareSlider && compareCompressed) {
    let isDragging = false;

    function updateSlider(x) {
      const rect = compareContainer.getBoundingClientRect();
      let percentage = ((x - rect.left) / rect.width) * 100;
      percentage = Math.max(5, Math.min(95, percentage));

      compareSlider.style.left = percentage + '%';
      compareCompressed.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }

    compareContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateSlider(e.clientX);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    compareContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    });

    compareContainer.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: false });

    compareContainer.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // ==========================================
  // 8. NAVBAR GLASSMORPHISM ON SCROLL (Fix 14)
  // ==========================================
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ==========================================
  // 9. SMOOTH SCROLL FOR ANCHORS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ==========================================
  // 10. NEWSLETTER FORM (Frontend only)
  // ==========================================
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('.newsletter-input');
      const email = input.value.trim();

      if (email && email.includes('@')) {
        // Show success feedback
        const btn = newsletterForm.querySelector('.newsletter-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10L9 14L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.style.background = '#10B981';
        input.value = '';
        input.placeholder = 'Subscribed! ✓';

        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          input.placeholder = 'Enter your email';
        }, 3000);
      }
    });
  }

  // ==========================================
  // 11. PROGRESS BAR ANIMATION
  // ==========================================
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          progressBar.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              progressBar.style.width = '100%';
            });
          });
          progressObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    progressObserver.observe(progressBar.closest('.featured-mockup') || progressBar);
  }

  // ==========================================
  // 12. KEYBOARD ACCESSIBILITY
  // ==========================================
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tab.click();
      }
    });
  });

  // ==========================================
  // 13. INITIAL REVEAL-UP TRIGGER FOR ABOVE-FOLD
  // ==========================================
  // Small delay to let CSS load, then trigger any already-visible reveal-up elements
  setTimeout(() => {
    document.querySelectorAll('.reveal-up').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
  }, 100);
});
