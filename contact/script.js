// ToolWools Legal Page - Minimal JS
(function() {
  'use strict';
  // Theme detection from localStorage
  const saved = localStorage.getItem('tw-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
