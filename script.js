const contactDialog = document.querySelector('.contact-dialog');
const openButtons = document.querySelectorAll('[data-contact-open]');
const closeButton = document.querySelector('[data-contact-close]');
const copyButton = document.querySelector('[data-copy-number]');
const copyStatus = document.querySelector('[data-copy-status]');
const currentYear = document.querySelector('[data-current-year]');
const faqItems = document.querySelectorAll('.faq details');

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-lucide]').forEach((placeholder) => {
    const iconName = placeholder.dataset.lucide;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.className.baseVal = placeholder.className;
    use.setAttribute('href', `Assets/icons.svg#icon-${iconName}`);
    svg.append(use);
    placeholder.replaceWith(svg);
  });
}

hydrateIcons();

// Mobile navigation drawer
const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
const mobileNavClose = document.querySelector('.mobile-nav__close');
const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');

function setMobileNavOpen(isOpen) {
  if (!mobileNav || !mobileNavToggle) return;
  mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  mobileNavToggle.classList.toggle('is-open', isOpen);
  mobileNav.classList.toggle('is-open', isOpen);
  if (mobileNavBackdrop) {
    mobileNavBackdrop.classList.toggle('is-open', isOpen);
    mobileNavBackdrop.hidden = !isOpen;
  }
  mobileNav.hidden = !isOpen;
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen && mobileNavClose) {
    mobileNavClose.focus();
  }
}

if (mobileNavToggle) {
  mobileNavToggle.addEventListener('click', () => {
    const isOpen = mobileNavToggle.getAttribute('aria-expanded') === 'true';
    setMobileNavOpen(!isOpen);
  });

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => setMobileNavOpen(false));
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', () => setMobileNavOpen(false));
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileNavOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && !mobileNav.hidden) {
      setMobileNavOpen(false);
      mobileNavToggle.focus();
    }
  });
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;

    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.open = false;
      }
    });
  });
});

if (contactDialog) {
  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      contactDialog.showModal();
      if (document.activeElement === closeButton) {
        closeButton.blur();
      }
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      contactDialog.close();
    });
  }

  contactDialog.addEventListener('click', (event) => {
    if (event.target === contactDialog) {
      contactDialog.close();
    }
  });
}

const copyButtons = document.querySelectorAll('[data-copy-number]');
if (copyButtons.length) {
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const number = btn.dataset.number || '0775 605 12';
      const copyTextEl = btn.querySelector('.contact-phone-btn__copy-text') || btn.querySelector('.contact-number__label') || btn;
      const originalText = copyTextEl ? copyTextEl.textContent : '';

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(number);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = number;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        btn.classList.add('is-copied');
        if (copyTextEl) copyTextEl.textContent = 'Скопировано!';
        if (copyStatus) copyStatus.textContent = 'Номер скопирован в буфер обмена';

        setTimeout(() => {
          btn.classList.remove('is-copied');
          if (copyTextEl) copyTextEl.textContent = originalText;
          if (copyStatus) copyStatus.textContent = '';
        }, 2200);
      } catch {
        if (copyStatus) copyStatus.textContent = 'Выделите номер и скопируйте вручную';
      }
    });
  });
}

// Blog filtering on blog.html
const filterButtons = document.querySelectorAll('.blog-filter-btn');
const blogCards = document.querySelectorAll('.blog-card--catalog');

if (filterButtons.length && blogCards.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      blogCards.forEach((card) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Blog copy link buttons
const blogCopyButtons = document.querySelectorAll('.blog-card__copy-btn');
if (blogCopyButtons.length) {
  blogCopyButtons.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const relativeUrl = btn.dataset.url;
      const fullUrl = new URL(relativeUrl, window.location.href).href;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fullUrl);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = fullUrl;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        const originalHtml = btn.innerHTML;
        btn.classList.add('is-copied');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Скопировано!</span>
        `;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove('is-copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy link: ', err);
      }
    });
  });
}

// Interactive maps: Google Maps embeds are loaded natively via iframes with loading="lazy".
