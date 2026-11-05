/*
 * Bolgsvenia Global — Optional advertising measurement consent
 * Version 1.0: consent choices only; NO GOOGLE TAGS ARE LOADED BY THIS FILE.
 * Future Google Ads integration MUST check BGAdsConsent.getStatus() before loading.
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'bg_ads_measurement_consent_v1';
  const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
  const lang = (document.documentElement.lang || 'en').toLowerCase();
  const locale = lang.startsWith('es') ? 'es' : lang.startsWith('ca') ? 'ca' : 'en';

  const copy = {
    en: {
      heading: 'Optional advertising cookies',
      detail: 'With your permission, we may use Google Ads cookies to understand whether an advert leads to a website enquiry. They stay off unless you accept. You can change your choice at any time.',
      accept: 'Accept optional cookies',
      reject: 'Reject optional cookies',
      settings: 'Cookie settings',
      privacy: 'Privacy notice',
      aria: 'Optional cookie preferences',
      privacyUrl: '/privacy.html'
    },
    es: {
      heading: 'Cookies publicitarias opcionales',
      detail: 'Con su permiso, podemos utilizar cookies de Google Ads para saber si un anuncio genera una consulta sobre páginas web. Permanecen desactivadas hasta que las acepte. Puede cambiar su elección en cualquier momento.',
      accept: 'Aceptar cookies opcionales',
      reject: 'Rechazar cookies opcionales',
      settings: 'Configuración de cookies',
      privacy: 'Aviso de privacidad',
      aria: 'Preferencias de cookies opcionales',
      privacyUrl: '/privacidad.html'
    },
    ca: {
      heading: 'Galetes publicitàries opcionals',
      detail: 'Amb el vostre permís, podem utilitzar galetes de Google Ads per saber si un anunci genera una consulta sobre pàgines web. Romanen desactivades fins que les accepteu. Podeu canviar la vostra elecció en qualsevol moment.',
      accept: 'Acceptar galetes opcionals',
      reject: 'Rebutjar galetes opcionals',
      settings: 'Configuració de galetes',
      privacy: 'Avís de privadesa',
      aria: 'Preferències de galetes opcionals',
      privacyUrl: '/privadesa.html'
    }
  }[locale];

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || !['granted', 'denied'].includes(saved.value) ||
          !Number.isFinite(saved.time) || saved.time > Date.now() ||
          Date.now() - saved.time > MAX_AGE_MS) return null;
      return saved.value;
    } catch (_) {
      return null;
    }
  }

  let status = readChoice();
  let panel = null;
  let settings = null;

  function choose(value) {
    if (value !== 'granted' && value !== 'denied') return;
    status = value;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({value, time: Date.now()})); }
    catch (_) { /* Still honour this choice on the current page. */ }
    if (panel) panel.hidden = true;
    if (settings) settings.hidden = false;
    window.dispatchEvent(new CustomEvent('bgadsconsentchange', {detail: {status}}));
  }

  function open() {
    if (!panel) return;
    panel.hidden = false;
    if (settings) settings.hidden = true;
    const reject = panel.querySelector('[data-bg-consent="reject"]');
    if (reject) reject.focus();
  }

  // API reserved for future conversion tracking; no tracking runs at this stage.
  window.BGAdsConsent = Object.freeze({
    getStatus: () => status,
    isGranted: () => status === 'granted',
    open
  });

  function makeButton(text, action, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.addEventListener('click', action);
    return button;
  }

  function mount() {
    if (document.getElementById('bg-consent-panel')) return;
    const root = document.createElement('div');
    root.className = 'bg-consent-root';

    panel = document.createElement('section');
    panel.id = 'bg-consent-panel';
    panel.className = 'bg-consent-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', copy.aria);

    const content = document.createElement('div');
    content.className = 'bg-consent-copy';
    const title = document.createElement('h2');
    title.textContent = copy.heading;
    title.className = 'bg-consent-title';
    const detail = document.createElement('p');
    detail.textContent = copy.detail;
    const privacy = document.createElement('a');
    privacy.href = copy.privacyUrl;
    privacy.textContent = copy.privacy;
    content.append(title, detail, privacy);

    const controls = document.createElement('div');
    controls.className = 'bg-consent-actions';
    const reject = makeButton(copy.reject, () => choose('denied'), 'bg-consent-button');
    reject.dataset.bgConsent = 'reject';
    const accept = makeButton(copy.accept, () => choose('granted'), 'bg-consent-button');
    controls.append(reject, accept);

    panel.append(content, controls);
    panel.hidden = status !== null;

    settings = makeButton(copy.settings, open, 'bg-consent-settings');
    settings.hidden = status === null;

    root.append(panel, settings);
    document.body.appendChild(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, {once: true});
  } else {
    mount();
  }
})();
