/**
 * RevoRevis - Main Application Module
 * Mermaid schematics, theme management, lightbox, and navigation
 */

import './style.css';
import mermaid from 'mermaid';
import { setupAudioPlayer } from './audio.js';
import { initQuiz } from './quiz.js';

export { setupAudioPlayer, initQuiz };

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initReadingProgress();
  initMobileNav();
  initLightbox();
  initDocAccordions();
  initLexiconSearch();
  await initMermaid();
  setupAudioPlayer();
});

// Theme Management
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('revorevis-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('revorevis-theme', newTheme);
      // Re-render mermaid with new theme
      initMermaid();
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
  }
}

// Mermaid Schematics
async function initMermaid() {
  const elements = document.querySelectorAll('.mermaid');
  if (!elements.length) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default';

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: currentTheme,
    themeVariables: currentTheme === 'dark' ? {
      primaryColor: '#1e3a8a',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#60a5fa',
      lineColor: '#93c5fd',
      secondaryColor: '#1e293b',
      tertiaryColor: '#131d33'
    } : {
      primaryColor: '#eff6ff',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#1e3a8a',
      lineColor: '#1e3a8a',
      secondaryColor: '#f1f5f9',
      tertiaryColor: '#ffffff'
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis'
    }
  });

  try {
    await mermaid.run({
      querySelector: '.mermaid'
    });
  } catch (err) {
    console.error('Mermaid render error:', err);
  }
}

// Reading Progress Bar
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

// Mobile Menu
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav-drawer');
  if (!toggleBtn || !mobileNav) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.textContent = isOpen ? '✕' : '☰';
  });
}

// Lightbox modal for Art Gallery
function initLightbox() {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  const modalImg = modal.querySelector('.modal-img');
  const modalCaption = modal.querySelector('.modal-caption');
  const closeBtn = modal.querySelector('.modal-close-btn');

  document.querySelectorAll('.art-img-box').forEach(box => {
    box.addEventListener('click', () => {
      const img = box.querySelector('img');
      const card = box.closest('.art-card');
      if (!img || !card) return;

      const title = card.querySelector('.art-title')?.textContent || '';
      const artist = card.querySelector('.art-artist')?.textContent || '';
      const meta = card.querySelector('.art-meta')?.innerHTML || '';

      modalImg.src = img.src;
      modalImg.alt = img.alt;
      modalCaption.innerHTML = `
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.75rem;">${artist}</p>
        <div style="font-size: 0.8rem; color: var(--text-subtle);">${meta}</div>
      `;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// Document Analysis Accordions
function initDocAccordions() {
  document.querySelectorAll('.doc-corrige-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.nextElementSibling;
      if (!target) return;
      const isOpen = target.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const arrow = btn.querySelector('.corrige-arrow');
      if (arrow) arrow.textContent = isOpen ? '▲ Masquer' : '▼ Afficher';
    });
  });
}

// Lexicon Search Filter
function initLexiconSearch() {
  const searchInput = document.getElementById('lexique-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.lexique-item').forEach(item => {
      const term = item.querySelector('.lexique-term')?.textContent.toLowerCase() || '';
      const def = item.querySelector('.lexique-def')?.textContent.toLowerCase() || '';
      if (term.includes(query) || def.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}
