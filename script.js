const contactDialog = document.querySelector('.contact-dialog');
const openButtons = document.querySelectorAll('[data-contact-open]');
const closeButton = document.querySelector('[data-contact-close]');
const copyButton = document.querySelector('[data-copy-number]');
const copyStatus = document.querySelector('[data-copy-status]');
const currentYear = document.querySelector('[data-current-year]');
const faqItems = document.querySelectorAll('.faq details');

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

if (window.lucide) {
  window.lucide.createIcons();
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

if (copyButton && copyStatus) {
  copyButton.addEventListener('click', async () => {
    const number = copyButton.dataset.number;

    try {
      await navigator.clipboard.writeText(number);
      copyStatus.textContent = 'Номер скопирован';
    } catch {
      copyStatus.textContent = 'Выделите номер и скопируйте вручную';
    }
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

// Interactive Maps initialization
function initLocationMaps() {
  const mapElements = document.querySelectorAll('.location-card__map-wrap');
  if (!mapElements.length || typeof L === 'undefined') return;

  mapElements.forEach((mapEl) => {
    if (mapEl.dataset.initialized === 'true') return;
    mapEl.dataset.initialized = 'true';

    const lat = parseFloat(mapEl.dataset.lat);
    const lng = parseFloat(mapEl.dataset.lng);
    const title = mapEl.dataset.title || '';
    const address = mapEl.dataset.address || '';
    const hint = mapEl.dataset.hint || '';
    const theme = mapEl.dataset.theme || 'turquoise';

    const isMobile = window.innerWidth < 768;

    const map = L.map(mapEl, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      dragging: !isMobile,
      touchZoom: false,
      tap: false,
      zoomControl: !isMobile,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const isTurquoise = theme === 'turquoise';
    const pinColor = isTurquoise ? '#2F7772' : '#F5A39A';
    const pinBg = isTurquoise ? '#2F7772' : '#d46f63';
    const pulseBg = isTurquoise ? 'rgba(47, 119, 114, 0.28)' : 'rgba(212, 111, 99, 0.28)';

    const pinHtml = `
      <div class="custom-map-pin custom-map-pin--${theme}">
        <span class="custom-map-pin__pulse" style="background:${pulseBg};"></span>
        <div class="custom-map-pin__body" style="background:${pinBg};">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'custom-map-pin-wrap',
      html: pinHtml,
      iconSize: [36, 46],
      iconAnchor: [18, 42],
      popupAnchor: [0, -38],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    const popupContent = `
      <div class="custom-map-popup">
        <span class="custom-map-popup__tag" style="color:${pinColor};">${title}</span>
        <strong class="custom-map-popup__addr">${address}</strong>
        ${hint ? `<span class="custom-map-popup__hint">${hint}</span>` : ''}
      </div>
    `;

    marker.bindPopup(popupContent, {
      closeButton: false,
      offset: [0, -10],
      className: 'leaflet-custom-popup',
    });

    // Auto open popup after render
    marker.openPopup();
  });
  return true;
}

// Ensure maps initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLocationMaps();
  });
} else {
  initLocationMaps();
}

window.addEventListener('load', () => {
  initLocationMaps();
});

