(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const nav = document.getElementById('primaryNav');
  const navToggle = document.getElementById('navToggle');
  const themeToggle = document.getElementById('themeToggle');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  function setTheme(theme) {
    root.toggleAttribute('data-theme', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {}
  }

  function closeNavigation() {
    nav?.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }

  function setupThemeToggle() {
    themeToggle?.addEventListener('click', () => {
      const nextTheme = root.hasAttribute('data-theme') ? 'light' : 'dark';
      setTheme(nextTheme);
      themeToggle.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} mode`);
    });
  }

  function setupNavigation() {
    navToggle?.addEventListener('click', () => {
      const isOpen = nav?.classList.toggle('open') ?? false;
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNavigation));

    const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function setupReveals() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion) {
      revealElements.forEach((element) => element.classList.add('in-view'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  function setupActiveNavigation() {
    if (!nav || !('IntersectionObserver' in window)) return;

    const links = nav.querySelectorAll('a[href^="#"]');
    const sections = document.querySelectorAll('main [id], footer[id]');
    const navigationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeLink = nav.querySelector(`a[href="#${entry.target.id}"]`);
        if (!activeLink) return;
        links.forEach((link) => link.classList.toggle('active', link === activeLink));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => navigationObserver.observe(section));
  }

  function animateCount(element) {
    const originalValue = element.textContent.trim();
    const match = originalValue.match(/^([\d,.]+)(.*)$/);
    if (!match) return;

    const target = Number.parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2];
    const start = performance.now();
    const duration = 900;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - ((1 - progress) ** 3);
      element.textContent = `${Math.round(target * easedProgress)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
      else element.textContent = originalValue;
    }

    requestAnimationFrame(step);
  }

  function setupStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-num');
    if (!statNumbers.length || reduceMotion || !('IntersectionObserver' in window)) return;

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    statNumbers.forEach((element) => statsObserver.observe(element));
  }

  setupThemeToggle();
  setupNavigation();
  setupReveals();
  setupActiveNavigation();
  setupStatCounters();
})();
